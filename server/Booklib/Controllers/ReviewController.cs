using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Booklib.Data;
using Booklib.Models.Entities;
using Booklib.DTOs.Request;
using Booklib.DTOs.Response;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Booklib.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly AppDBContext _context;

        public ReviewController(AppDBContext context)
        {
            _context = context;
        }

        // GET: api/Review/book/{bookId}
        [HttpGet("book/{bookId}")]
        public async Task<ActionResult<IEnumerable<ReviewResponseDTO>>> GetBookReviews(Guid bookId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.BookId == bookId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(reviews.Select(MapToReviewResponseDTO));
        }

        // GET: api/Review/user
        [Authorize]
        [HttpGet("user")]
        public async Task<ActionResult<IEnumerable<ReviewResponseDTO>>> GetUserReviews()
        {
            var userId = GetCurrentUserId();
            var reviews = await _context.Reviews
                .Include(r => r.Book)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(reviews.Select(MapToReviewResponseDTO));
        }
// GET: api/Review/can-review/{bookId}
[Authorize]
[HttpGet("can-review/{bookId}/{orderId}")]
public async Task<ActionResult<bool>> CanReviewBook(Guid bookId, Guid orderId)
{
    var userId = GetCurrentUserId();

    // Verify the book exists
    var book = await _context.Books.FindAsync(bookId);
    if (book == null)
        return NotFound("Book not found");

    // Verify the order exists and belongs to user
    var order = await _context.Orders
        .Include(o => o.Items)
        .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == userId);

    if (order == null)
        return NotFound("Order not found");

    // Check if order contains the book and is completed
    var hasPurchased = order.Status == OrderStatus.Completed && 
                      order.Items.Any(i => i.BookId == bookId);

    if (!hasPurchased)
        return Ok(false);

    // Check if user has already reviewed this specific order+book combination
    var hasReviewed = await _context.Reviews
        .AnyAsync(r => r.BookId == bookId && 
                      r.OrderId == orderId && 
                      r.UserId == userId);

    return Ok(!hasReviewed);
}

      [Authorize]
[HttpPost]
public async Task<ActionResult<ReviewResponseDTO>> CreateReview([FromBody] ReviewRequestDTO reviewDTO)
{
    var userId = GetCurrentUserId();

    // Verify the book exists
    var book = await _context.Books.FindAsync(reviewDTO.BookId);
    if (book == null)
        return NotFound("Book not found");

    // Verify the order exists and belongs to user
    var order = await _context.Orders
        .Include(o => o.Items)
        .FirstOrDefaultAsync(o => o.OrderId == reviewDTO.OrderId && 
                                 o.UserId == userId);

    if (order == null)
        return NotFound("Order not found");

    // Check if order contains the book and is completed
    var hasPurchased = order.Status == OrderStatus.Completed && 
                      order.Items.Any(i => i.BookId == reviewDTO.BookId);

    if (!hasPurchased)
        return BadRequest("You can only review books from completed orders");

    // Check if user has already reviewed this specific order+book combination
    var existingReview = await _context.Reviews
        .FirstOrDefaultAsync(r => r.BookId == reviewDTO.BookId && 
                                r.OrderId == reviewDTO.OrderId && 
                                r.UserId == userId);

    if (existingReview != null)
        return BadRequest("You have already reviewed this book for this order");

    var review = new Review
    {
        BookId = reviewDTO.BookId,
        UserId = userId,
        OrderId = reviewDTO.OrderId,
        Rating = reviewDTO.Rating,
        Comment = reviewDTO.Comment
    };

    _context.Reviews.Add(review);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(GetBookReviews), 
        new { bookId = review.BookId }, 
        MapToReviewResponseDTO(review));
}


        // PUT: api/Review/{id}
        [Authorize]
        [HttpPut("{id}")]
        public async Task<ActionResult<ReviewResponseDTO>> UpdateReview(Guid id, ReviewRequestDTO reviewDTO)
        {
            var userId = GetCurrentUserId();
            var review = await _context.Reviews.FindAsync(id);

            if (review == null)
                return NotFound("Review not found");

            if (review.UserId != userId)
                return Forbid();

            review.Rating = reviewDTO.Rating;
            review.Comment = reviewDTO.Comment;
            review.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(MapToReviewResponseDTO(review));
        }

        // DELETE: api/Review/{id}
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(Guid id)
        {
            var userId = GetCurrentUserId();
            var review = await _context.Reviews.FindAsync(id);

            if (review == null)
                return NotFound("Review not found");

            if (review.UserId != userId)
                return Forbid();

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok("Review deleted successfully");
        }

        private ReviewResponseDTO MapToReviewResponseDTO(Review review)
        {
            return new ReviewResponseDTO
            {
                ReviewId = review.ReviewId,
                BookId = review.BookId,
                BookTitle = review.Book?.Title,
                UserName = $"{review.User?.FirstName} {review.User?.LastName}",
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                UpdatedAt = review.UpdatedAt
            };
        }

       private Guid GetCurrentUserId()
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.FindFirst("sub")?.Value;
    
    if (userIdClaim == null)
        throw new UnauthorizedAccessException("User ID not found in token");

    return Guid.Parse(userIdClaim);
}
    }
}