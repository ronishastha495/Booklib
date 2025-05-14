namespace Booklib.DTOs.Request
{
    public class CreateNotificationDTO
    {
        public Guid UserId { get; set; }
        public string Message { get; set; }
        public string? Type { get; set; }
        public Guid? OrderId { get; set; }
    }
}