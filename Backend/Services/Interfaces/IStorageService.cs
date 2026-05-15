namespace RoomManagement.Services.Interfaces;

public interface IStorageService
{
    /// <summary>
    /// Upload file lên storage, tự động nén sang WebP.
    /// Trả về đường dẫn tương đối (relative path).
    /// VD: /hotel-images/hotel123_1714000000.webp
    /// </summary>
    Task<string> UploadAsync(IFormFile file, string bucketName, string objectKey, int? width = null, int? height = null);

    /// <summary>
    /// Xoá file theo đường dẫn tương đối.
    /// </summary>
    Task DeleteAsync(string relativePath);
}
