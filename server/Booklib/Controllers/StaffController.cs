using System;
using System.Linq;
using System.Threading.Tasks;
using Booklib.Data;
using Booklib.DTOs.Request;
using Booklib.Helpers;
using Booklib.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Net.WebSockets;
using System.Text.Json;
using Booklib.Middleware;
using Booklib.DTOs.Response;

namespace Booklib.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController(AppDBContext context, ILogger<StaffController> logger, INotificationService notificationService) : ControllerBase
    {
        private readonly AppDBContext _context = context;
        private readonly ILogger<StaffController> _logger = logger;
        private readonly INotificationService _notificationService = notificationService;
        private static readonly WebSocketConnectionManager _connectionManager = new();



        [HttpGet("orders/pending")]
        public async Task<ActionResult<List<OrderResponseDTO>>> GetPendingOrders()
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.Items)
                    .ThenInclude(i => i.Book)
                    .Where(o => o.Status == OrderStatus.Pending || o.Status == OrderStatus.Completed)
                    .OrderByDescending(o => o.CreatedAt)
                    .Select(o => new OrderResponseDTO
                    {
                        OrderId = o.OrderId,
                        UserId = o.User.Id,
                        UserName = $"{o.User.FirstName} {o.User.LastName}",
                        Status = o.Status.ToString(),
                        ClaimCode = o.ClaimCode,
                        CreatedAt = o.CreatedAt,
                        SubTotal = o.SubTotal,
                        DiscountPercentage = o.DiscountPercentage,
                        FinalTotal = o.FinalTotal,
                        Items = o.Items.Select(i => new OrderItemResponseDTO
                        {
                            BookId = i.BookId,
                            BookTitle = i.Book.Title,
                            Quantity = i.Quantity,
                            UnitPrice = i.UnitPrice,
                            Subtotal = i.Quantity * i.UnitPrice
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching orders");
                return StatusCode(500, new { Message = "Error fetching orders", Error = ex.Message });
            }
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

                var notificationDto = new CreateNotificationDTO
                {
                    UserId = order.User.Id,
                    Message = $"Your order #{order.OrderId} has been fulfilled successfully!",
                    Type = "Order",
                    OrderId = order.OrderId
                };

                await _notificationService.CreateNotification(notificationDto);
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

        public class ProcessClaimRequest
        {
            public required string ClaimCode { get; set; }
        }
    }
}