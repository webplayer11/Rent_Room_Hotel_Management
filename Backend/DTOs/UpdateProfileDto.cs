using RoomManagement.DTOs;
using System.ComponentModel.DataAnnotations;

public class UpdateProfileDto
{
    [MaxLength(100)]
    public string? FullName { get; set; }

    [Phone]
    public string? PhoneNumber { get; set; }

    public DateTime? DateOfBirth { get; set; }

    [MaxLength(255)]
    public string? Address { get; set; }
}