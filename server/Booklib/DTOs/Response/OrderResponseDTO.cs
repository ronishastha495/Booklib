using System;

namespace Booklib.DTOs.Response;

public class OrderResponseDTO
    {
    internal UserBasicInfoDTO User;

    public Guid OrderId { get; set; }
        public string ClaimCode { get; set; }
        public string Status { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal FinalTotal { get; set; }
        public List<OrderItemResponseDTO> Items { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? CancellationReason { get; set; }

        public Guid UserId { get; set; } // Add UserId
        public string UserName { get; set; } // Add UserName
    }

    public class OrderItemResponseDTO
    {
        public Guid BookId { get; set; }
        public string BookTitle { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal { get; set; }
    }
