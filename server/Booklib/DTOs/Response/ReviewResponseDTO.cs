using System;

namespace Booklib.DTOs.Response
{
    public class ReviewResponseDTO
    {
        public Guid ReviewId { get; set; }
        public Guid BookId { get; set; }
        public string BookTitle { get; set; }
        public string UserName { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}