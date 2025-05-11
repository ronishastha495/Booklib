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
            var cart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Book)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null || !cart.Items.Any())
                return BadRequest("Cart is empty");

            // Validate stock availability
            foreach (var item in cart.Items)
            {
                if (item.Book.StockQuantity < item.Quantity)
                    return BadRequest($"Not enough stock for book: {item.Book.Title}");
            }

            // Calculate discounts
            var itemCount = cart.Items.Sum(i => i.Quantity);
            var discountPercentage = CalculateDiscountPercentage(userId, itemCount);

            // Create order
            var order = new Order
            {
                UserId = userId,
                Status = OrderStatus.Pending,
                SubTotal = cart.Items.Sum(i => i.Quantity * (i.Book.OnSale ? i.Book.DiscountPrice ?? i.Book.Price : i.Book.Price))
            };

            order.DiscountPercentage = discountPercentage;
            order.FinalTotal = order.SubTotal * (1 - discountPercentage / 100);

            // Add order items and update stock
            foreach (var cartItem in cart.Items)
            {
                order.Items.Add(new OrderItem
                {
                    BookId = cartItem.BookId,
                    Quantity = cartItem.Quantity,
                    UnitPrice = cartItem.Book.OnSale ? cartItem.Book.DiscountPrice ?? cartItem.Book.Price : cartItem.Book.Price
                });

                cartItem.Book.StockQuantity -= cartItem.Quantity;
            }

            _context.Orders.Add(order);
            _context.CartItems.RemoveRange(cart.Items); // Clear cart
            await _context.SaveChangesAsync();

            // TODO: Send confirmation email with claim code

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