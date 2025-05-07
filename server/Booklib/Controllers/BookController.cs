using System;
using Booklib.Data;
using Booklib.DTOs.Request;
using Booklib.DTOs.Response;
using Booklib.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Booklib.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly AppDBContext _context;

        public BookController(AppDBContext context)
        {
            _context = context;
        }

        // GET: Book/GetAll
        [HttpGet("GetAll")]
        public ActionResult<ICollection<BookResponseDTO>> GetAllBooks()
        {
            var books = _context.Books.ToList();
            
            if (books == null || books.Count == 0)
                return NotFound("No books found");
                
            var response = books.Select(book => MapToResponseDTO(book)).ToList();
            return Ok(response);
        }

        // GET: Book/GetFiltered
        [HttpGet("GetFiltered")]
        public ActionResult GetFilteredBooks(
            [FromQuery] string? genre,
            [FromQuery] string? search,
            [FromQuery] string? author,
            [FromQuery] bool? onSale,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? language,
            [FromQuery] string? format,
            [FromQuery] string? publisher,
            [FromQuery] int? minRating,
            [FromQuery] string? sortBy = "title", // Default sort by title
            [FromQuery] string? sortOrder = "asc", // Default ascending order
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Books.AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(genre))
                query = query.Where(b => b.Genre == genre);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(b => 
                    b.Title.Contains(search) || 
                    b.Description.Contains(search) ||
                    b.ISBN.Contains(search));

            if (!string.IsNullOrEmpty(author))
                query = query.Where(b => b.Author.Contains(author));

            if (onSale.HasValue)
                query = query.Where(b => b.OnSale == onSale.Value);

            if (minPrice.HasValue)
                query = query.Where(b => b.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(b => b.Price <= maxPrice.Value);

            if (!string.IsNullOrEmpty(language))
                query = query.Where(b => b.Language == language);

            if (!string.IsNullOrEmpty(format))
                query = query.Where(b => b.Format == format);

            if (!string.IsNullOrEmpty(publisher))
                query = query.Where(b => b.Publisher == publisher);

            if (minRating.HasValue)
            {
                // Assuming you'll add ratings later
                // query = query.Where(b => b.AverageRating >= minRating.Value);
            }

            // Apply sorting
            query = sortBy?.ToLower() switch
            {
                "title" => sortOrder == "desc" 
                    ? query.OrderByDescending(b => b.Title)
                    : query.OrderBy(b => b.Title),
                "price" => sortOrder == "desc" 
                    ? query.OrderByDescending(b => b.Price)
                    : query.OrderBy(b => b.Price),
                "year" => sortOrder == "desc" 
                    ? query.OrderByDescending(b => b.YearPublished)
                    : query.OrderBy(b => b.YearPublished),
                "dateadded" => sortOrder == "desc" 
                    ? query.OrderByDescending(b => b.AddedDate)
                    : query.OrderBy(b => b.AddedDate),
                _ => query.OrderBy(b => b.Title) // Default sort
            };

            var totalCount = query.Count();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var books = query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            if (books.Count == 0)
                return NotFound("No books match the criteria");

            var response = new
            {
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages,
                HasPreviousPage = page > 1,
                HasNextPage = page < totalPages,
                Books = books.Select(book => MapToResponseDTO(book)).ToList()
            };

            return Ok(response);
        }

        // GET: Book/GetById/{id}
        [HttpGet("GetById/{id}")]
        public ActionResult<BookResponseDTO> GetBook(Guid id)
        {
            var book = _context.Books.Find(id);
            
            if (book == null)
                return NotFound("Book not found");
                
            return Ok(MapToResponseDTO(book));
        }

   [HttpPost("Create")]
public IActionResult CreateBook([FromBody] BookRequestDTO bookDTO)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    if (_context.Books.Any(b => b.Title == bookDTO.Title))
        return Conflict("Book title already exists");

    // Ensure UTC date
    var publishedDate = bookDTO.PublishedDate;
    if (publishedDate.Kind != DateTimeKind.Utc)
    {
        publishedDate = DateTime.SpecifyKind(publishedDate, DateTimeKind.Utc);
    }

    var book = new Book
    {
        Title = bookDTO.Title,
        Author = bookDTO.Author,
        ImageURL = bookDTO.ImageURL,
        ISBN = bookDTO.ISBN,
        Description = bookDTO.Description,
        Genre = bookDTO.Genre,
        Price = bookDTO.Price,
        YearPublished = bookDTO.YearPublished,
        PublishedDate = publishedDate, // Use the converted UTC date
        Publisher = bookDTO.Publisher,
        Language = bookDTO.Language,
        Format = bookDTO.Format,
        StockQuantity = bookDTO.StockQuantity,
        IsAvailable = bookDTO.IsAvailable,
        OnSale = bookDTO.OnSale,
        DiscountPrice = bookDTO.DiscountPrice,
        DiscountEndDate = bookDTO.DiscountEndDate,
        IsBestseller = bookDTO.IsBestseller,
        IsAwardWinner = bookDTO.IsAwardWinner,
        IsComingSoon = bookDTO.IsComingSoon,
        AddedDate = DateTime.UtcNow
    };

    // Set IsComingSoon based on PublishedDate
    book.IsComingSoon = book.PublishedDate > DateTime.UtcNow;

    _context.Books.Add(book);
    _context.SaveChanges();
    
    return CreatedAtAction(nameof(GetBook), new { id = book.BookId }, MapToResponseDTO(book));
}
        // PUT: Book/Update/{id}
        [HttpPut("Update/{id}")]
        public IActionResult UpdateBook(Guid id, [FromBody] BookRequestDTO bookDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingBook = _context.Books.Find(id);
            if (existingBook == null)
                return NotFound("Book not found");

            if (_context.Books.Any(b => b.Title == bookDTO.Title && b.BookId != id))
                return Conflict("Book title already exists");
            
                // Ensure UTC date
    var publishedDate = bookDTO.PublishedDate;
    if (publishedDate.Kind != DateTimeKind.Utc)
    {
        publishedDate = DateTime.SpecifyKind(publishedDate, DateTimeKind.Utc);
    }

            // Update properties
            existingBook.Title = bookDTO.Title;
            existingBook.Author = bookDTO.Author;
            existingBook.ImageURL = bookDTO.ImageURL;
            existingBook.ISBN = bookDTO.ISBN;
            existingBook.Description = bookDTO.Description;
            existingBook.Genre = bookDTO.Genre;
            existingBook.Price = bookDTO.Price;
            existingBook.YearPublished = bookDTO.YearPublished;
            existingBook.PublishedDate = publishedDate;             
            existingBook.Publisher = bookDTO.Publisher;
            existingBook.Language = bookDTO.Language;
            existingBook.Format = bookDTO.Format;
            existingBook.StockQuantity = bookDTO.StockQuantity;
            existingBook.IsAvailable = bookDTO.IsAvailable;
            existingBook.OnSale = bookDTO.OnSale;
            existingBook.DiscountPrice = bookDTO.DiscountPrice;
            existingBook.DiscountEndDate = bookDTO.DiscountEndDate;
            existingBook.IsBestseller = bookDTO.IsBestseller;       // Add this
    existingBook.IsAwardWinner = bookDTO.IsAwardWinner;     // Add this
    existingBook.IsComingSoon = bookDTO.IsComingSoon;       // Add this


            _context.SaveChanges();
            return Ok(MapToResponseDTO(existingBook));
        }

        // DELETE: Book/Delete/{id}
        [HttpDelete("Delete/{id}")]
        public IActionResult DeleteBook(Guid id)
        {
            var book = _context.Books.Find(id);
            if (book == null)
                return NotFound("Book not found");

            _context.Books.Remove(book);
            _context.SaveChanges();
            return Ok("Book deleted successfully");
        }

        // PATCH: Book/UpdateStock/{id}
        [HttpPatch("UpdateStock/{id}")]
        public IActionResult UpdateStock(Guid id, [FromBody] int quantity)
        {
            var book = _context.Books.Find(id);
            if (book == null)
                return NotFound("Book not found");

            book.StockQuantity = quantity;
            _context.SaveChanges();
            return Ok("Stock updated successfully");
        }

        // Add Author Specific Endpoints
        [HttpGet("GetByAuthor/{authorName}")]
        public ActionResult GetBooksByAuthor(string authorName)
        {
            var books = _context.Books
                .Where(b => b.Author.Contains(authorName))
                .ToList();

            if (books.Count == 0)
                return NotFound($"No books found for author: {authorName}");

            var response = books.Select(book => MapToResponseDTO(book)).ToList();
            return Ok(response);
        }

        [HttpGet("GetAuthors")]
        public ActionResult<ICollection<string>> GetAllAuthors()
        {
            var authors = _context.Books
                .Select(b => b.Author)
                .Distinct()
                .ToList();

            return authors.Count == 0
                ? NotFound("No authors found")
                : Ok(authors);
        }

[HttpGet("Categories/{category}")]
public ActionResult<ICollection<BookResponseDTO>> GetBooksByCategory(string category)
{
    var now = DateTime.UtcNow;
    var threeMonthsAgo = now.AddMonths(-3);
    var oneMonthAgo = now.AddMonths(-1);

    var query = _context.Books.AsQueryable();

    switch (category.ToLower())
    {
        case "all":
            return GetAllBooks();

        case "bestsellers":
            query = query.Where(b => b.IsBestseller);
            break;

        case "award-winners":
            query = query.Where(b => b.IsAwardWinner);
            break;

        case "new-releases":
            // Changed to check PublishedDate
            query = query.Where(b => 
                b.PublishedDate >= threeMonthsAgo && 
                b.PublishedDate <= now);
            break;

        case "new-arrivals":
            query = query.Where(b => b.AddedDate >= oneMonthAgo);
            break;

        case "coming-soon":
            // Changed to check PublishedDate
            query = query.Where(b => b.PublishedDate > now);
            break;

        case "deals":
            query = query.Where(b => b.OnSale && 
                                   b.DiscountEndDate > now);
            break;

        default:
            return BadRequest("Invalid category");
    }

    var books = query.ToList();
    if (!books.Any())
        return NotFound($"No books found in category: {category}");

    var response = books.Select(book => MapToResponseDTO(book)).ToList();
    return Ok(response);
}

// GET: Book/Categories
[HttpGet("Categories")]
public ActionResult<IDictionary<string, int>> GetCategoriesCount()
{
    var now = DateTime.UtcNow;
    var threeMonthsAgo = now.AddMonths(-3);
    var oneMonthAgo = now.AddMonths(-1);

    var categoryCounts = new Dictionary<string, int>
    {
        ["all"] = _context.Books.Count(),
        ["bestsellers"] = _context.Books.Count(b => b.IsBestseller),
        ["award-winners"] = _context.Books.Count(b => b.IsAwardWinner),
        ["new-releases"] = _context.Books.Count(b => 
            b.YearPublished == now.Year && 
            b.PublishedDate >= threeMonthsAgo),
        ["new-arrivals"] = _context.Books.Count(b => 
            b.AddedDate >= oneMonthAgo),
        ["coming-soon"] = _context.Books.Count(b => 
            b.PublishedDate > now),
        ["deals"] = _context.Books.Count(b => 
            b.OnSale && b.DiscountEndDate > now)
    };

    return Ok(categoryCounts);
}
        // Helper method to map Book entity to BookResponseDTO
        private BookResponseDTO MapToResponseDTO(Book book)
        {
            return new BookResponseDTO
            {
                BookId = book.BookId,
                Title = book.Title,
                Author = book.Author,
                ImageURL = book.ImageURL,
                ISBN = book.ISBN,
                Description = book.Description,
                Genre = book.Genre,
                Price = book.Price,
                YearPublished = book.YearPublished,
                 PublishedDate = book.PublishedDate, 
                Publisher = book.Publisher,
                Language = book.Language,
                Format = book.Format,
                StockQuantity = book.StockQuantity,
                IsAvailable = book.IsAvailable,
                OnSale = book.OnSale,
                DiscountPrice = book.DiscountPrice,
                DiscountEndDate = book.DiscountEndDate,
                AddedDate = book.AddedDate,
                 IsBestseller = book.IsBestseller,         // This was missing
        IsAwardWinner = book.IsAwardWinner,       // This was missing
        IsComingSoon = book.IsComingSoon,         // This was missing
        SalesCount = book.SalesCount 
            };
        }
    }
}