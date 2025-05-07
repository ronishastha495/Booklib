using System;

namespace Booklib.DTOs.Response;

 public class BookmarkResponseDTO
    {
        public Guid BookmarkId { get; set; }
        public Guid BookId { get; set; }
        public string BookTitle { get; set; }
        public string Author { get; set; }
        public string ImageURL { get; set; }
        public DateTime AddedDate { get; set; }
    }