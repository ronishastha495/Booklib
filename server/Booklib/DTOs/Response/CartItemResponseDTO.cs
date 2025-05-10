using System;

namespace Booklib.DTOs.Response;

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
