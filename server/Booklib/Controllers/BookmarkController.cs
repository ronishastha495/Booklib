using Booklib.Data;
using Booklib.DTOs.Request;
using Booklib.DTOs.Response;
using Booklib.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Booklib.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookmarkController(AppDBContext context) : ControllerBase
    {
        private readonly AppDBContext _context = context;

        [HttpPost("create")]
        public async Task<IActionResult> AddBookmark([FromBody] BookmarkRequestDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!_context.User.Any(u => u.Id == request.MemberId))
                return NotFound("Member not found");

            if (!_context.Books.Any(b => b.BookId == request.BookId))
                return NotFound("Book not found");

            var existingBookmark = await _context.Bookmarks
                .FirstOrDefaultAsync(b => b.MemberId == request.MemberId && b.BookId == request.BookId);

            if (existingBookmark != null)
                return Conflict("This book is already bookmarked.");

            var bookmark = new Bookmark
            {
                MemberId = request.MemberId,
                BookId = request.BookId,
                AddedDate = DateTime.UtcNow
            };

            _context.Bookmarks.Add(bookmark);
            await _context.SaveChangesAsync();

            return Ok("Bookmarked successfully.");
        }

        [HttpGet("getAll/{memberId}")]
        public async Task<IActionResult> GetBookmarksByMember(Guid memberId)
        {
            if (!_context.User.Any(u => u.Id == memberId))
                return NotFound("Member not found");

            var bookmarks = await _context.Bookmarks
                .Include(b => b.Book)
                .Where(b => b.MemberId == memberId)
                .Select(b => new BookmarkResponseDTO
                {
                    BookmarkId = b.BookmarkId,
                    BookId = b.BookId,
                    BookTitle = b.Book.Title,
                    Author = b.Book.Author,
                    ImageURL = b.Book.ImageURL,
                    AddedDate = b.AddedDate
                })
                .ToListAsync();

            return Ok(bookmarks);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteBookmark([FromBody] BookmarkRequestDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var bookmark = await _context.Bookmarks.FirstOrDefaultAsync(b =>
                b.MemberId == request.MemberId && b.BookId == request.BookId);

            if (bookmark == null)
                return NotFound("Bookmark not found.");

            _context.Bookmarks.Remove(bookmark);
            await _context.SaveChangesAsync();

            return Ok("Bookmark removed."); 
        }
    }

}
