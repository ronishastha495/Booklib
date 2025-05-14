using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Booklib.Controllers;
using Booklib.Data;
using Booklib.DTOs.Request;
using Booklib.DTOs.Response;
using Booklib.Middleware;
using Booklib.Models.Entities;
using Microsoft.EntityFrameworkCore;
using static Booklib.Controllers.StaffController;

namespace Booklib.Helpers
{
    public interface INotificationService
    {
        Task<NotificationResponseDTO> CreateNotification(CreateNotificationDTO dto);
        Task<List<NotificationResponseDTO>> GetUserNotifications(Guid userId);
        Task<bool> MarkAsRead(Guid notificationId, Guid userId);
        Task<bool> DeleteNotification(Guid notificationId, Guid userId);
    }

    public class NotificationService : INotificationService
    {
        private readonly AppDBContext _context;
        private readonly WebSocketConnectionManager _wsManager;

        public NotificationService(AppDBContext context, WebSocketConnectionManager wsManager)
        {
            _context = context;
            _wsManager = wsManager;
        }

public async Task<NotificationResponseDTO> CreateNotification(CreateNotificationDTO dto)
{
    var notification = new Notification
    {
        Id = Guid.NewGuid(),
        UserId = dto.UserId,
        Message = dto.Message,
        Type = dto.Type ?? "Order",
        OrderId = dto.OrderId ?? Guid.Empty,
        IsRead = false,
        CreatedAt = DateTime.UtcNow
    };

    _context.Notifications.Add(notification);
    await _context.SaveChangesAsync();

    var response = new NotificationResponseDTO
    {
        Id = notification.Id,
        Message = notification.Message,
        IsRead = notification.IsRead,
        CreatedAt = notification.CreatedAt
    };

    // Send real-time notification via WebSocket
    var message = JsonSerializer.Serialize(new
    {
        type = "NEW_NOTIFICATION",
        notification = response
    });

    await _wsManager.BroadcastAsync(message, dto.UserId.ToString());

    return response;
}

        public async Task<List<NotificationResponseDTO>> GetUserNotifications(Guid userId)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationResponseDTO
                {
                    Id = n.Id,
                    Message = n.Message,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<bool> MarkAsRead(Guid notificationId, Guid userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification == null) return false;

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteNotification(Guid notificationId, Guid userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification == null) return false;

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}