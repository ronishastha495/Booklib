using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Booklib.Models.Entities;

public class CartItem
{
    [Key]
    public Guid CartItemId { get; set; }

    [Required]
    public Guid CartId { get; set; }

    [ForeignKey("CartId")]
    public Cart Cart { get; set; }

    [Required]
    public Guid BookId { get; set; }

    [ForeignKey("BookId")]
    public Book Book { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}