using System;
using System.ComponentModel.DataAnnotations;

namespace Booklib.DTOs.Request;

public class CartItemRequestDTO
    {
        [Required]
        public Guid BookId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
