using System;
using System.ComponentModel.DataAnnotations;

namespace Booklib.DTOs.Request
{
    public class ReviewRequestDTO
    {
        [Required]
        public Guid BookId { get; set; }
            [Required]
    public Guid OrderId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        [MinLength(10)]
        [MaxLength(1000)]
        public string Comment { get; set; }
    }
}