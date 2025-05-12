using System.Security.Claims;
using Booklib.Data;
using Booklib.DTOs.Request;
using Booklib.DTOs.Response;
using Booklib.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Booklib.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderController(AppDBContext context) : ControllerBase
    {
        private readonly AppDBContext _context = context;

        // GET: api/Order
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderResponseDTO>>> GetUserOrders()
        {
            var userId = GetCurrentUserId();
            var orders = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(i => i.Book)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders.Select(MapToOrderResponseDTO));
        }

        // GET: api/Order/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderResponseDTO>> GetOrder(Guid id)
        {
            var userId = GetCurrentUserId();
            var order = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(i => i.Book)
                .FirstOrDefaultAsync(o => o.OrderId == id && o.UserId == userId);

            if (order == null)
                return NotFound("Order not found");

            return Ok(MapToOrderResponseDTO(order));
        }

        // POST: api/Order
    [HttpPost]
public async Task<ActionResult<OrderResponseDTO>> CreateOrder([FromBody] OrderRequestDTO orderDTO)
{
    var userId = GetCurrentUserId();

    if (orderDTO?.Items == null || !orderDTO.Items.Any())
        return BadRequest("No items provided in the order");

    // Validate stock availability
    foreach (var item in orderDTO.Items)
    {
        var book = await _context.Books.FindAsync(item.BookId);
        if (book == null)
            return BadRequest($"Book with ID {item.BookId} not found");
            
        if (book.StockQuantity < item.Quantity)
            return BadRequest($"Not enough stock for book: {book.Title}");
    }

    // Calculate discounts
    var itemCount = orderDTO.Items.Sum(i => i.Quantity);
    var discountPercentage = CalculateDiscountPercentage(userId, itemCount);

    // Create order
    var order = new Order
    {
        UserId = userId,
        Status = OrderStatus.Pending,
        Items = new List<OrderItem>()
    };

    decimal subtotal = 0;

    // Add order items and update stock
    foreach (var itemDTO in orderDTO.Items)
    {
        var book = await _context.Books.FindAsync(itemDTO.BookId);
        var price = book.OnSale ? book.DiscountPrice ?? book.Price : book.Price;
        
        order.Items.Add(new OrderItem
        {
            BookId = itemDTO.BookId,
            Quantity = itemDTO.Quantity,
            UnitPrice = price
        });

        subtotal += price * itemDTO.Quantity;
        book.StockQuantity -= itemDTO.Quantity;
    }

    order.SubTotal = subtotal;
    order.DiscountPercentage = discountPercentage;
    order.FinalTotal = subtotal * (1 - discountPercentage / 100);

    _context.Orders.Add(order);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, MapToOrderResponseDTO(order));
}
        // POST: api/Order/{id}/cancel
        [HttpPost("{id}/cancel")]
        public async Task<ActionResult> CancelOrder(Guid id, [FromBody] string reason)
        {
            var userId = GetCurrentUserId();
            var order = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(i => i.Book)
                .FirstOrDefaultAsync(o => o.OrderId == id && o.UserId == userId);

            if (order == null)
                return NotFound("Order not found");

            if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.Confirmed)
                return BadRequest("Order cannot be cancelled in its current status");

            // Restore stock
            foreach (var item in order.Items)
            {
                item.Book.StockQuantity += item.Quantity;
            }

            order.Status = OrderStatus.Cancelled;
            order.CancelledAt = DateTime.UtcNow;
            order.CancellationReason = reason;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok("Order cancelled successfully");
        }

        private OrderResponseDTO MapToOrderResponseDTO(Order order)
        {
            return new OrderResponseDTO
            {
                OrderId = order.OrderId,
                ClaimCode = order.ClaimCode,
                Status = order.Status.ToString(),
                SubTotal = order.SubTotal,
                DiscountPercentage = order.DiscountPercentage,
                FinalTotal = order.FinalTotal,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                CancelledAt = order.CancelledAt,
                CancellationReason = order.CancellationReason,
                Items = order.Items.Select(item => new OrderItemResponseDTO
                {
                    BookId = item.BookId,
                    BookTitle = item.Book.Title,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    Subtotal = item.UnitPrice * item.Quantity
                }).ToList()
            };
        }

        private decimal CalculateDiscountPercentage(Guid userId, int itemCount)
        {
            decimal discount = 0;

            // Apply 5% discount for orders with 5 or more books
            if (itemCount >= 5)
                discount += 5;

            // Add 10% discount for every 10 successful orders
            var successfulOrdersCount = _context.Orders
                .Count(o => o.UserId == userId && o.Status == OrderStatus.Completed);

            discount += (successfulOrdersCount / 10) * 10;

            return discount;
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