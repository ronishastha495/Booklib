using System;
using System.Threading.Tasks;
using Booklib.DTOs.Response;
using Booklib.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Booklib.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController(
        INotificationService notificationService,
        ILogger<NotificationController> logger) : ControllerBase
    {
        private readonly INotificationService _notificationService = notificationService;
        private readonly ILogger<NotificationController> _logger = logger;

        [HttpGet]
        public async Task<ActionResult> GetUserNotifications()
        {
            try
            {
                var userId = GetCurrentUserId();
                var notifications = await _notificationService.GetUserNotifications(userId);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user notifications");
                return StatusCode(500, "An error occurred while retrieving notifications");
            }
        }

        [HttpPost("{id}/mark-read")]
        public async Task<ActionResult> MarkNotificationAsRead(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _notificationService.MarkAsRead(id, userId);

                if (!success)
                    return NotFound("Notification not found");

                return Ok("Notification marked as read");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification as read");
                return StatusCode(500, "An error occurred while updating the notification");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteNotification(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _notificationService.DeleteNotification(id, userId);

                if (!success)
                    return NotFound("Notification not found");

                return Ok("Notification deleted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting notification");
                return StatusCode(500, "An error occurred while deleting the notification");
            }
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