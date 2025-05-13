using System.Net.WebSockets;
using System.Text;

namespace Booklib.Middleware
{
    public class WebSocketConnectionManager
    {
        private readonly Dictionary<string, List<WebSocket>> _connections = new();

        public void AddConnection(string userId, WebSocket webSocket)
        {
            lock (_connections)
            {
                if (!_connections.ContainsKey(userId))
                    _connections[userId] = new List<WebSocket>();

                _connections[userId].Add(webSocket);
            }
        }

        public async Task BroadcastAsync(string message, string userId)
        {
            lock (_connections)
            {
                if (_connections.ContainsKey(userId))
                {
                    foreach (var ws in _connections[userId].ToList())
                    {
                        if (ws.State == WebSocketState.Open)
                        {
                            var buffer = Encoding.UTF8.GetBytes(message);
                            ws.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None).GetAwaiter().GetResult();
                        }
                        else
                        {
                            _connections[userId].Remove(ws);
                        }
                    }
                }
            }
        }

        public void RemoveConnection(string userId, WebSocket webSocket)
        {
            lock (_connections)
            {
                if (_connections.ContainsKey(userId))
                {
                    _connections[userId].Remove(webSocket);
                    if (!_connections[userId].Any())
                    {
                        _connections.Remove(userId);
                    }
                }
            }
        }
    }
}
