using System;
using System.ComponentModel.DataAnnotations;

namespace Booklib.DTOs.Request;

public class BookmarkRequestDTO
    {
        [Required]
        public Guid MemberId { get; set; }

        [Required]
        public Guid BookId { get; set; }
    }