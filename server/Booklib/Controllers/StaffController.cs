using Booklib.Data;
using Booklib.DTOs.Response;
using Booklib.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Booklib.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class StaffController(AppDBContext context, ILogger<StaffController> logger) : ControllerBase
    {
        private readonly AppDBContext _context = context;
        private readonly ILogger<StaffController> _logger = logger;
[HttpGet("orders/{orderId}")]
public async Task<ActionResult<OrderResponseDTO>> GetOrderById(string orderId)
{
    if (!Guid.TryParse(orderId, out Guid orderGuid))
    {
        return BadRequest("Invalid Order ID format");
    }

    var order = await _context.Orders
        .Include(o => o.Items)
        .ThenInclude(i => i.Book)
        .Include(o => o.User)
        .FirstOrDefaultAsync(o => o.OrderId == orderGuid);

    if (order == null)
    {
        return NotFound("Order not found");
    }

    var response = new OrderResponseDTO
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
            BookTitle = item.Book?.Title ?? "Unknown Book",
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice,
            Subtotal = item.UnitPrice * item.Quantity
        }).ToList()
    };

    return Ok(response);
}
        [HttpGet("orders/pending")]
public async Task<ActionResult<IEnumerable<OrderResponseDTO>>> GetPendingOrders()
{
    var allOrders = await _context.Orders
        .Include(o => o.Items)
        .ThenInclude(i => i.Book)
        .Include(o => o.User)
        .OrderByDescending(o => o.CreatedAt)
        .ToListAsync(); // Remove the Where clause to include all orders

    var response = allOrders.Select(order => new OrderResponseDTO
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
        UserId = order.User?.Id ?? Guid.Empty,
        UserName = order.User != null ? $"{order.User.FirstName} {order.User.LastName}" : "Unknown",
        Items = order.Items.Select(item => new OrderItemResponseDTO
        {
            BookId = item.BookId,
            BookTitle = item.Book?.Title ?? "Unknown Book",
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice,
            Subtotal = item.UnitPrice * item.Quantity
        }).ToList()
    });

    return Ok(response);
}

        [HttpPost("process-claim")]
        public async Task<ActionResult> ProcessClaimCode([FromBody] ProcessClaimRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request?.ClaimCode))
                {
                    _logger.LogWarning("Empty claim code received");
                    return BadRequest("Claim code is required");
                }

                var order = await _context.Orders
                    .Include(o => o.Items)
                    .ThenInclude(i => i.Book)
                    .Include(o => o.User)
                    .FirstOrDefaultAsync(o => o.ClaimCode == request.ClaimCode);

                if (order == null)
                {
                    _logger.LogWarning("Order not found for claim code: {ClaimCode}", request.ClaimCode);
                    return NotFound("Invalid claim code");
                }

                if (order.Status != OrderStatus.Pending)
                {
                    _logger.LogWarning("Order {OrderId} has invalid status for processing: {Status}",
                        order.OrderId, order.Status);
                    return BadRequest($"Order cannot be processed. Current status: {order.Status}");
                }

                order.Status = OrderStatus.Completed;
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Order {OrderId} fulfilled successfully with claim code: {ClaimCode}",
                    order.OrderId, request.ClaimCode);

                return Ok(new
                {
                    Message = "Order fulfilled successfully",
                    OrderId = order.OrderId,
                    CustomerName = $"{order.User.FirstName} {order.User.LastName}"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing claim code: {ClaimCode}", request?.ClaimCode);
                return StatusCode(500, "An error occurred while processing the claim");
            }
        }
    }
    public class ProcessClaimRequest
    {
        public required string ClaimCode { get; set; }
    }

}   