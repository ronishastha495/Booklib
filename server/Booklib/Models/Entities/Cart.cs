using System;
using System.ComponentModel.DataAnnotations;

namespace Booklib.Models.Entities;

 public class Cart
    {
        [Key]
        public Guid CartId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        public virtual ICollection<CartItem> Items { get; set; } = new List<CartItem>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Timestamp]
        public byte[]? RowVersion { get; set; } = Array.Empty<byte>();  // Initialize with empty array
    }