using System.ComponentModel.DataAnnotations;
namespace RoomManagement.DTOs;

    public class RegisterDto
    {
        [Required]
        [EmailAddress]
        public string? Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; } =  string.Empty;
        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;
        [Required]
        public DateTime? DateOfBirth { get; set; }
        [Required]
        public string? Gender { get; set; }
        [Required]
        public string? Address { get; set; }
    }

    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string? Token { get; set; }
        public string? RefreshToken { get; set; }
    }

    
    public class TokenRequestDto
    {
        [Required]
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
