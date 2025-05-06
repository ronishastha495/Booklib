using System;
using System.ComponentModel.DataAnnotations;

namespace Booklib.DTOs.Response;

public class BookResponseDTO
{
    public Guid BookId { get; set; }
    public string Title { get; set; }
    public string Author { get; set; }
    public string ImageURL { get; set; }
    public string ISBN { get; set; }
    public string Description { get; set; }
    public string Genre { get; set; }
    public decimal Price { get; set; }
    public int YearPublished { get; set; }
    public DateTime PublishedDate { get; set; }
    public string Publisher { get; set; }
    public string Language { get; set; }
    public string Format { get; set; }
    public int StockQuantity { get; set; }
    public bool IsAvailable { get; set; }
    public bool OnSale { get; set; }
    public decimal? DiscountPrice { get; set; }
    public DateTime? DiscountEndDate { get; set; }
    public DateTime AddedDate { get; set; }
    public bool IsBestseller { get; set; }
    public bool IsAwardWinner { get; set; }
    public bool IsComingSoon { get; set; }
    public int SalesCount { get; set; }
}