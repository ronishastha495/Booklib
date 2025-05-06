using System;
using System.ComponentModel.DataAnnotations;

namespace Booklib.DTOs.Request;

public class UpdateCartItemDTO
    {
        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }