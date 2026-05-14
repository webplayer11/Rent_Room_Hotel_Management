using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoomManagement.Models;

[Table("Promotion")]
public class Promotion
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = default!;

    [MaxLength(200)]
    public string? Name { get; set; }

    public string? Description { get; set; }

    public double DiscountPercent { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    [MaxLength(50)]
    public string? PropertyType { get; set; }

    [MaxLength(50)]
    public string? RoomType { get; set; }

    public bool IsActive { get; set; } = true;
}
