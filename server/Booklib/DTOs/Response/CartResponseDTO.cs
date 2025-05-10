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