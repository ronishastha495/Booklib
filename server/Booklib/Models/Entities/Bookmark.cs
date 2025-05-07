using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Booklib.Models.Entities;

public class Bookmark
    {
        [Key]
        public Guid BookmarkId { get; set; } = Guid.NewGuid();

        [Required]
        public Guid MemberId { get; set; }

        [ForeignKey("MemberId")]
        public User Member { get; set; }

        [Required]
        public Guid BookId { get; set; }

        [ForeignKey("BookId")]
        public Book Book { get; set; }

        [Required]
        public DateTime AddedDate { get; set; } = DateTime.UtcNow;
    }