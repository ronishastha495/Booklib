using System;

namespace Booklib.DTOs.Response;

public class CartResponseDTO
    {
        public Guid CartId { get; set; }
        public List<CartItemResponseDTO> Items { get; set; } = new List<CartItemResponseDTO>();
        public decimal SubTotal { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal FinalTotal { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CartItemResponseDTO
    {
        public Guid CartItemId { get; set; }
        public Guid BookId { get; set; }
        public string BookTitle { get; set; }
        public string BookImageURL { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal Subtotal { get; set; }
    }
