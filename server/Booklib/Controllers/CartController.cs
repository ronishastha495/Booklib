using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Booklib.Data;
using Booklib.DTOs.Request;
using Booklib.DTOs.Response;
using Booklib.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Booklib.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly AppDBContext _context;
        private readonly int MaxRetries = 3;

        public CartController(AppDBContext context)
        {
            _context = context;
        }

        // GET: api/Cart
        [HttpGet]
        public async Task<ActionResult<CartResponseDTO>> GetCart()
        {
            try
            {
                var userId = GetCurrentUserId();
                var cart = await _context.Carts
                    .Include(c => c.Items)
                    .ThenInclude(i => i.Book)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart == null)
                {
                    return Ok(new CartResponseDTO
                    {
                        Items = new List<CartItemResponseDTO>(),
                        SubTotal = 0,
                        DiscountPercentage = 0,
                        FinalTotal = 0,
                        UpdatedAt = DateTime.UtcNow
                    });
                }

                return Ok(MapToCartResponseDTO(cart));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

    [HttpPost("items")]
public async Task<ActionResult<CartResponseDTO>> AddToCart(CartItemRequestDTO itemDTO)
{
    int maxRetries = 3;
    int currentRetry = 0;

    while (currentRetry < maxRetries)
    {
        try
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            // Get current user
            var userId = GetCurrentUserId();

            // Check book with stock lock
            var book = await _context.Books
                .FromSqlRaw("SELECT * FROM \"Books\" WHERE \"BookId\" = {0} FOR UPDATE", itemDTO.BookId)
                .FirstOrDefaultAsync();

            if (book == null)
                return NotFound("Book not found");

            if (book.StockQuantity < itemDTO.Quantity)
                return BadRequest("Not enough stock available");

            // Get or create cart
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            DateTime now = DateTime.UtcNow; // 2025-05-06 17:39:30

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                _context.Carts.Add(cart);
            }
            else
            {
                // Detach existing cart to avoid tracking conflicts
                _context.Entry(cart).State = EntityState.Detached;
                foreach (var item in cart.Items)
                {
                    _context.Entry(item).State = EntityState.Detached;
                }
            }

            // Check for existing item
            var existingItem = cart.Items.FirstOrDefault(i => i.BookId == itemDTO.BookId);
            
            if (existingItem != null)
            {
                existingItem.Quantity += itemDTO.Quantity;
            }
            else
            {
                cart.Items.Add(new CartItem
                {
                    BookId = itemDTO.BookId,
                    Quantity = itemDTO.Quantity,
                    AddedAt = now
                });
            }

            cart.UpdatedAt = now;

            // Mark cart as modified
            _context.Carts.Update(cart);

            // Try to save changes
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Reload cart for response
            var updatedCart = await _context.Carts
                .Include(c => c.Items)
                .ThenInclude(i => i.Book)
                .FirstAsync(c => c.CartId == cart.CartId);

            return Ok(MapToCartResponseDTO(updatedCart));
        }
        catch (DbUpdateConcurrencyException)
        {
            await _context.Database.RollbackTransactionAsync();
            _context.ChangeTracker.Clear();
            
            currentRetry++;
            if (currentRetry >= maxRetries)
            {
                return StatusCode(409, "Cannot add item to cart due to concurrent modifications. Please try again.");
            }
            
            // Wait before retrying (exponential backoff)
            await Task.Delay(100 * (int)Math.Pow(2, currentRetry));
        }
        catch (Exception ex)
        {
            await _context.Database.RollbackTransactionAsync();
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }

    return StatusCode(409, "Unable to process request after multiple attempts.");
}

[HttpPut("items/{cartItemId}/quantity")]
public async Task<ActionResult<CartResponseDTO>> UpdateCartItemQuantity(Guid cartItemId, [FromBody] UpdateQuantityDTO quantityDTO)
{
    try
    {
        var userId = GetCurrentUserId();

        // Get cart item with cart to verify ownership
        var cartItem = await _context.CartItems
            .Include(ci => ci.Cart)
            .FirstOrDefaultAsync(ci => ci.CartItemId == cartItemId);

        if (cartItem == null)
            return NotFound("Cart item not found");

        // Verify ownership
        if (cartItem.Cart.UserId != userId)
            return Forbid("You don't have permission to modify this cart item");

        // Verify book has enough stock
        var book = await _context.Books.FindAsync(cartItem.BookId);
        if (book == null)
            return NotFound("Book not found");

        if (book.StockQuantity < quantityDTO.Quantity)
            return BadRequest("Not enough stock available");

        // Update quantity
        cartItem.Quantity = quantityDTO.Quantity;
        cartItem.Cart.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Reload cart for response
        var updatedCart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Book)
            .FirstAsync(c => c.CartId == cartItem.Cart.CartId);

        return Ok(MapToCartResponseDTO(updatedCart));
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"An error occurred: {ex.Message}");
    }
}

public class UpdateQuantityDTO
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
    public int Quantity { get; set; }
}

        // DELETE: api/Cart/items/{cartItemId}
        [HttpDelete("items/{cartItemId}")]
        public async Task<ActionResult<CartResponseDTO>> RemoveFromCart(Guid cartItemId)
        {
            var attempt = 0;
            while (attempt < MaxRetries)
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var userId = GetCurrentUserId();
                    var cartItem = await _context.CartItems
                        .Include(ci => ci.Cart)
                        .FirstOrDefaultAsync(ci => ci.CartItemId == cartItemId && ci.Cart.UserId == userId);

                    if (cartItem == null)
                        return NotFound("Cart item not found");

                    _context.CartItems.Remove(cartItem);
                    cartItem.Cart.UpdatedAt = DateTime.UtcNow;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    var updatedCart = await _context.Carts
                        .Include(c => c.Items)
                        .ThenInclude(i => i.Book)
                        .FirstAsync(c => c.CartId == cartItem.CartId);

                    return Ok(MapToCartResponseDTO(updatedCart));
                }
                catch (DbUpdateConcurrencyException)
                {
                    await transaction.RollbackAsync();
                    _context.ChangeTracker.Clear();
                    
                    attempt++;
                    if (attempt >= MaxRetries)
                    {
                        return StatusCode(409, "The cart was modified by another request. Please try again.");
                    }
                    await Task.Delay(100 * (int)Math.Pow(2, attempt));
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, $"An error occurred: {ex.Message}");
                }
            }
            return StatusCode(409, "Unable to process request after multiple attempts.");
        }

        // DELETE: api/Cart/clear
        [HttpDelete("clear")]
        public async Task<ActionResult<CartResponseDTO>> ClearCart()
        {
            var attempt = 0;
            while (attempt < MaxRetries)
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var userId = GetCurrentUserId();
                    var cart = await _context.Carts
                        .Include(c => c.Items)
                        .FirstOrDefaultAsync(c => c.UserId == userId);

                    if (cart == null || !cart.Items.Any())
                        return Ok(new CartResponseDTO
                        {
                            Items = new List<CartItemResponseDTO>(),
                            SubTotal = 0,
                            DiscountPercentage = 0,
                            FinalTotal = 0,
                            UpdatedAt = DateTime.UtcNow
                        });

                    _context.CartItems.RemoveRange(cart.Items);
                    cart.UpdatedAt = DateTime.UtcNow;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(new CartResponseDTO
                    {
                        CartId = cart.CartId,
                        Items = new List<CartItemResponseDTO>(),
                        SubTotal = 0,
                        DiscountPercentage = 0,
                        FinalTotal = 0,
                        UpdatedAt = cart.UpdatedAt
                    });
                }
                catch (DbUpdateConcurrencyException)
                {
                    await transaction.RollbackAsync();
                    _context.ChangeTracker.Clear();
                    
                    attempt++;
                    if (attempt >= MaxRetries)
                    {
                        return StatusCode(409, "The cart was modified by another request. Please try again.");
                    }
                    await Task.Delay(100 * (int)Math.Pow(2, attempt));
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, $"An error occurred: {ex.Message}");
                }
            }
            return StatusCode(409, "Unable to process request after multiple attempts.");
        }

        private CartResponseDTO MapToCartResponseDTO(Cart cart)
        {
            if (cart == null) return null;

            var items = cart.Items.Select(item => new CartItemResponseDTO
            {
                CartItemId = item.CartItemId,
                BookId = item.BookId,
                BookTitle = item.Book.Title,
                BookImageURL = item.Book.ImageURL,
                UnitPrice = item.Book.OnSale ? item.Book.DiscountPrice ?? item.Book.Price : item.Book.Price,
                Quantity = item.Quantity,
                Subtotal = (item.Book.OnSale ? item.Book.DiscountPrice ?? item.Book.Price : item.Book.Price) * item.Quantity
            }).ToList();

            var subtotal = items.Sum(i => i.Subtotal);
            var discountPercentage = CalculateDiscountPercentage(cart.UserId, items.Sum(i => i.Quantity));
            var finalTotal = subtotal * (1 - discountPercentage / 100);

            return new CartResponseDTO
            {
                CartId = cart.CartId,
                Items = items,
                SubTotal = subtotal,
                DiscountPercentage = discountPercentage,
                FinalTotal = finalTotal,
                UpdatedAt = cart.UpdatedAt
            };
        }

        private decimal CalculateDiscountPercentage(Guid userId, int itemCount)
        {
            decimal discount = 0;
            if (itemCount >= 5) discount += 5;

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
        [HttpPost("checkout")]
[Authorize(Roles = "Member")]
public async Task<ActionResult<OrderResponseDTO>> CheckoutCart()
{
    try
    {
        var userId = GetCurrentUserId();
        var now = DateTime.UtcNow; // 2025-05-06 18:13:30

        // Get cart with items
        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Book)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null || !cart.Items.Any())
            return NotFound("Cart not found or is empty");

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Create new order
            var order = new Order
            {
                UserId = userId,
                Status = OrderStatus.Pending,
                CreatedAt = now,
                UpdatedAt = now
            };

            // Convert cart items to order items
            decimal subtotal = 0;
            foreach (var cartItem in cart.Items)
            {
                // Check stock availability
                if (cartItem.Book.StockQuantity < cartItem.Quantity)
                {
                    return BadRequest($"Not enough stock for book: {cartItem.Book.Title}");
                }

                var unitPrice = cartItem.Book.OnSale ? 
                    cartItem.Book.DiscountPrice ?? cartItem.Book.Price : 
                    cartItem.Book.Price;

                // Create order item
                var orderItem = new OrderItem
                {
                    BookId = cartItem.BookId,
                    Quantity = cartItem.Quantity,
                    UnitPrice = unitPrice
                };

                subtotal += unitPrice * cartItem.Quantity;

                // Update book stock
                cartItem.Book.StockQuantity -= cartItem.Quantity;

                order.Items.Add(orderItem);
            }

            // Calculate totals
            order.SubTotal = subtotal;
            order.DiscountPercentage = CalculateDiscountPercentage(userId, cart.Items.Sum(i => i.Quantity));
            order.FinalTotal = subtotal * (1 - order.DiscountPercentage / 100.0m);

            _context.Orders.Add(order);

            // Clear cart
            _context.Carts.Remove(cart);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Return order details using the fully qualified namespace
            var response = new Booklib.DTOs.Response.OrderResponseDTO
            {
                OrderId = order.OrderId,
                ClaimCode = order.ClaimCode,
                Status = order.Status.ToString(),
                Items = order.Items.Select(item => new Booklib.DTOs.Response.OrderItemResponseDTO
                {
                    BookId = item.BookId,
                    BookTitle = item.Book?.Title ?? "Unknown",
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    Subtotal = item.Quantity * item.UnitPrice
                }).ToList(),
                SubTotal = order.SubTotal,
                DiscountPercentage = order.DiscountPercentage,
                FinalTotal = order.FinalTotal,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                CancelledAt = null,
                CancellationReason = null
            };

            return Ok(response);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"An error occurred: {ex.Message}");
    }
}
    }
}