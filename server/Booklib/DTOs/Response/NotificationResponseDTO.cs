using System;

namespace Booklib.DTOs.Response
{
    public class NotificationResponseDTO
    {
        public Guid Id { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}