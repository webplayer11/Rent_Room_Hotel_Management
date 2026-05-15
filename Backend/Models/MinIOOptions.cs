namespace RoomManagement.Models;

/// <summary>
/// Strongly-typed config class bind từ appsettings.json section "MinIO"
/// </summary>
public class MinIOOptions
{
    public string Endpoint { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string HotelBucketName { get; set; } = string.Empty;
    public string RoomBucketName { get; set; } = string.Empty;
    public string HostDocumentBucketName { get; set; } = string.Empty;
    public bool UseSSL { get; set; } = false;
}
