using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Booklib.Models.Entities
{
    public class Notification
    {
        [Key]
        public Guid Id { get; set; }
        
        public Guid OrderId { get; set; }
        
        [Required]
        public Guid UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User User { get; set; }
        
        [Required]
        public string Message { get; set; }
        
        public bool IsRead { get; set; }
        
        public string? Type { get; set; } = "Order";
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}