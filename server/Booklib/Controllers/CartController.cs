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
    public class CartController(AppDBContext context) : ControllerBase
    {
        private readonly AppDBContext _context = context;
        private readonly int MaxRetries = 3;

        [HttpPost("items")]
        public async Task<ActionResult<CartResponseDTO>> AddToCart(CartItemRequestDTO itemDTO)
        {
            int currentRetry = 0;

            while (currentRetry < MaxRetries)
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
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

                    DateTime now = DateTime.UtcNow;

                    if (cart == null)
                    {
                        cart = new Cart
                        {
                            CartId = Guid.NewGuid(),
                            UserId = userId,
                            CreatedAt = now,
                            UpdatedAt = now,
                            Items = new List<CartItem>()
                        };
                        
                        // Add and save the cart first
                        _context.Carts.Add(cart);
                        await _context.SaveChangesAsync(); // Save to generate CartId
                    }

                    // Check for existing item
                    var existingItem = cart.Items.FirstOrDefault(i => i.BookId == itemDTO.BookId);
                    
                    if (existingItem != null)
                    {
                        existingItem.Quantity += itemDTO.Quantity;
                        _context.Entry(existingItem).State = EntityState.Modified;
                    }
                    else
                    {
                        var newItem = new CartItem
                        {
                            CartItemId = Guid.NewGuid(),
                            CartId = cart.CartId,
                            BookId = itemDTO.BookId,
                            Quantity = itemDTO.Quantity,
                            AddedAt = now
                        };

                        _context.CartItems.Add(newItem);
                    }

                    cart.UpdatedAt = now;
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
                    await transaction.RollbackAsync();
                    _context.ChangeTracker.Clear();
                    
                    currentRetry++;
                    if (currentRetry >= MaxRetries)
                    {
                        return StatusCode(409, "Cannot add item to cart due to concurrent modifications. Please try again.");
                    }
                    
                    await Task.Delay(100 * (int)Math.Pow(2, currentRetry));
                }
                catch (DbUpdateException ex)
                {
                    await transaction.RollbackAsync();
                    _context.ChangeTracker.Clear();
                    
                    var innerException = ex.InnerException?.Message ?? "No inner exception details";
                    return StatusCode(500, $"Database Error: {ex.Message}. Inner Exception: {innerException}");
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, $"An error occurred: {ex.Message}");
                }
            }

            return StatusCode(409, "Unable to process request after multiple attempts.");
        }

        [HttpPut("items/{cartItemId}/quantity")]
        public async Task<ActionResult<CartResponseDTO>> UpdateCartItemQuantity(
            Guid cartItemId, 
            [FromBody] UpdateCartItemDTO quantityDTO)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var userId = GetCurrentUserId();

                var cartItem = await _context.CartItems
                    .Include(ci => ci.Cart)
                    .Include(ci => ci.Book)
                    .FirstOrDefaultAsync(ci => ci.CartItemId == cartItemId);

                if (cartItem == null)
                    return NotFound("Cart item not found");

                if (cartItem.Cart.UserId != userId)
                    return Forbid();

                if (cartItem.Book.StockQuantity < quantityDTO.Quantity)
                    return BadRequest("Not enough stock available");

                cartItem.Quantity = quantityDTO.Quantity;
                cartItem.Cart.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var updatedCart = await _context.Carts
                    .Include(c => c.Items)
                    .ThenInclude(i => i.Book)
                    .FirstAsync(c => c.CartId == cartItem.CartId);

                return Ok(MapToCartResponseDTO(updatedCart));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpDelete("items/{cartItemId}")]
        public async Task<ActionResult<CartResponseDTO>> RemoveFromCart(Guid cartItemId)
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
                    .FirstOrDefaultAsync(c => c.CartId == cartItem.CartId);

                return Ok(MapToCartResponseDTO(updatedCart));
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
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
    }
}