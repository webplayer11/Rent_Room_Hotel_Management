using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using RoomManagement.Models;
using RoomManagement.Services.Interfaces;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace RoomManagement.Services.Implementations;

public class MinIOStorageService : IStorageService
{
    private readonly MinIOOptions _minioOptions;
    private readonly AmazonS3Client _s3Client;

    // Cấu hình giới hạn upload
    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10MB
    private const int DefaultWebpQuality = 80;

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp"
    };

    public MinIOStorageService(IOptions<MinIOOptions> minioOptions)
    {
        _minioOptions = minioOptions.Value;

        var config = new AmazonS3Config
        {
            ServiceURL = $"{(_minioOptions.UseSSL ? "https" : "http")}://{_minioOptions.Endpoint}",
            ForcePathStyle = true
        };

        var credentials = new BasicAWSCredentials(_minioOptions.AccessKey, _minioOptions.SecretKey);
        _s3Client = new AmazonS3Client(credentials, config);
    }

    public async Task<string> UploadAsync(IFormFile file, string bucketName, string objectKey, int? width = null, int? height = null)
    {
        // 1. Validate kích thước
        if (file.Length > MaxFileSizeBytes)
            throw new InvalidOperationException("Kích thước ảnh không được vượt quá 10MB.");

        // 2. Validate extension
        var fileName = file.FileName?.Trim('\"', '\'');
        var ext = Path.GetExtension(fileName ?? "").ToLowerInvariant();

        // Fallback check ContentType nếu extension bị thiếu
        if (string.IsNullOrEmpty(ext))
        {
            ext = file.ContentType.ToLowerInvariant() switch
            {
                "image/jpeg" => ".jpg",
                "image/jpg" => ".jpg",
                "image/png" => ".png",
                "image/webp" => ".webp",
                _ => ""
            };
        }

        if (!AllowedExtensions.Contains(ext))
            throw new InvalidOperationException("Chỉ chấp nhận ảnh định dạng JPG, PNG hoặc WEBP.");

        // 3. Đảm bảo objectKey kết thúc bằng .webp
        if (!objectKey.EndsWith(".webp", StringComparison.OrdinalIgnoreCase))
        {
            objectKey = Path.ChangeExtension(objectKey, ".webp");
        }

        using var outputStream = new MemoryStream();

        try
        {
            using var image = await Image.LoadAsync(file.OpenReadStream());

            // 4. Resize nếu có yêu cầu
            if (width.HasValue || height.HasValue)
            {
                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(width ?? 0, height ?? 0),
                    Mode = ResizeMode.Max
                }));
            }

            // 5. Luôn lưu ra WebP để tối ưu dung lượng
            await image.SaveAsync(outputStream, new WebpEncoder
            {
                Quality = DefaultWebpQuality
            });
            outputStream.Position = 0;
        }
        catch (UnknownImageFormatException)
        {
            throw new InvalidOperationException("File không phải ảnh hợp lệ.");
        }

        // 6. Upload lên MinIO
        var request = new PutObjectRequest
        {
            BucketName = bucketName,
            Key = objectKey,
            InputStream = outputStream,
            ContentType = "image/webp",
        };

        await _s3Client.PutObjectAsync(request);

        // 7. Trả về relative path
        return $"/{bucketName}/{objectKey}";
    }

    public async Task DeleteAsync(string relativePath)
    {
        var parts = relativePath.TrimStart('/').Split('/', 2);
        if (parts.Length != 2) return;

        var bucketName = parts[0];
        var objectKey = parts[1];

        try
        {
            var request = new DeleteObjectRequest
            {
                BucketName = bucketName,
                Key = objectKey
            };
            await _s3Client.DeleteObjectAsync(request);
        }
        catch
        {
            // Không throw nếu file cũ không tồn tại
        }
    }
}
