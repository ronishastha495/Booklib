using System;
using System.ComponentModel.DataAnnotations;

namespace Booklib.Models.Entities;

public class Book
{
    [Key]
    public Guid BookId { get; set; } = Guid.NewGuid();

    [Required, MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Author { get; set; } = string.Empty;

    public string ImageURL { get; set; } = string.Empty;

    [Required, MaxLength(13)]
    public string ISBN { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string Genre { get; set; } = string.Empty;

    [Required, Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Required]
    public int YearPublished { get; set; }

    [Required]
    public DateTime PublishedDate { get; set; } // New field for precise publication date

    [Required]
    public string Publisher { get; set; } = string.Empty;

    [Required]
    public string Language { get; set; } = string.Empty;

    [Required]
    public string Format { get; set; } = string.Empty;

    [Required, Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }

    [Required]
    public bool IsAvailable { get; set; } = true;

    [Required]
    public bool OnSale { get; set; } = false;

    public decimal? DiscountPrice { get; set; }
    public DateTime? DiscountEndDate { get; set; }

    [Required]
    public DateTime AddedDate { get; set; } = DateTime.UtcNow;

    // New fields for categories
    [Required]
    public bool IsBestseller { get; set; } = false;

    [Required]
    public bool IsAwardWinner { get; set; } = false;

    [Required]
    public bool IsComingSoon { get; set; } = false;

    // Optional: Track sales count for bestseller calculation
    public int SalesCount { get; set; } = 0;
}