using System.Net.WebSockets;
using Booklib.Middleware;

public class OrderWebSocketMiddleware
{
    private readonly RequestDelegate _next;
    private readonly WebSocketConnectionManager _connectionManager;

    public OrderWebSocketMiddleware(RequestDelegate next, WebSocketConnectionManager connectionManager)
    {
        _next = next;
        _connectionManager = connectionManager;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path == "/ws/orders" && context.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            await HandleOrderWebSocket(webSocket);
        }
        else
        {
            await _next(context);
        }
    }

    private async Task HandleOrderWebSocket(WebSocket webSocket)
    {
        var buffer = new byte[1024 * 4];
        while (webSocket.State == WebSocketState.Open)
        {
            var result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            if (result.MessageType == WebSocketMessageType.Close)
            {
                await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", CancellationToken.None);
                break;
            }
        }
    }
}

public static class OrderWebSocketMiddlewareExtensions
{
    public static IApplicationBuilder UseOrderWebSocketMiddleware(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<OrderWebSocketMiddleware>();
    }
}