using System;
using System.IdentityModel.Tokens.Jwt;
using System.Net.WebSockets;
using System.Security.Claims;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace Booklib.Middleware
{
    public class WebSocketMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly WebSocketConnectionManager _connectionManager;

        public WebSocketMiddleware(RequestDelegate next, WebSocketConnectionManager connectionManager)
        {
            _next = next;
            _connectionManager = connectionManager;
        }

       public async Task InvokeAsync(HttpContext context)
{
    if ((context.Request.Path == "/ws/notifications" || context.Request.Path == "/ws/orders") 
        && context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        
        // Wait for authentication message
        var buffer = new byte[1024 * 4];
        var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
        
        if (result.MessageType == WebSocketMessageType.Text)
        {
            var message = System.Text.Encoding.UTF8.GetString(buffer, 0, result.Count);
            var authData = JsonSerializer.Deserialize<AuthMessage>(message);
            
            if (authData?.Type == "auth" && !string.IsNullOrEmpty(authData.Token))
            {
                var userId = GetUserIdFromToken(authData.Token);
                if (!string.IsNullOrEmpty(userId))
                {
                    _connectionManager.AddConnection(userId, webSocket);
                    
                    // Keep the connection alive
                    while (webSocket.State == WebSocketState.Open)
                    {
                        try
                        {
                            result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                            if (result.MessageType == WebSocketMessageType.Close)
                            {
                                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                                break;
                            }
                        }
                        catch
                        {
                            break;
                        }
                    }
                    
                    _connectionManager.RemoveConnection(userId, webSocket);
                    return;
                }
            }
        }
        
        await webSocket.CloseAsync(WebSocketCloseStatus.PolicyViolation, 
            "Authentication required", CancellationToken.None);
    }
    else
    {
        await _next(context);
    }
}
private string GetUserIdFromToken(string token)
{
    try
    {
        token = token.Replace("Bearer ", "");
        
        var handler = new JwtSecurityTokenHandler();
        var jsonToken = handler.ReadToken(token) as JwtSecurityToken;
        
        return jsonToken?.Claims.FirstOrDefault(claim => 
            claim.Type == ClaimTypes.NameIdentifier || 
            claim.Type == "sub")?.Value;
    }
    catch
    {
        return null;
    }
}

private class AuthMessage
{
    public string Type { get; set; }
    public string Token { get; set; }
}
        private async Task HandleWebSocketAsync(WebSocket webSocket, string userId)
        {
            var buffer = new byte[1024 * 4];
            while (webSocket.State == WebSocketState.Open)
            {
                var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Close)
                {
                    _connectionManager.RemoveConnection(userId, webSocket);
                    await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                    break;
                }
            }
        }
    }

    public static class WebSocketMiddlewareExtensions
    {
        public static IApplicationBuilder UseWebSocketMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<WebSocketMiddleware>();
        }
    }
}
