import React, { useContext, useEffect } from 'react';
import { Bell, CheckCircle, Loader2 } from 'lucide-react';
import { OrderContext } from '../contexts/OrderContext';

const UserNotification = () => {
  const { notifications, loading, error, fetchNotifications, markNotificationAsRead } = useContext(OrderContext);

  useEffect(() => {
    fetchNotifications();
    // Set a flag in localStorage to indicate that notifications have been viewed
    localStorage.setItem('notificationsViewed', 'true');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-[78rem] mx-auto">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-gray-200">
            <Bell className="text-gray-600" size={24} />
            <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 border-b border-red-200">
              {error}
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-600">
              No notifications found
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                    notification.isRead ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <CheckCircle
                    className={`mt-1 ${
                      notification.isRead ? 'text-gray-400' : 'text-green-500'
                    }`}
                    size={20}
                  />
                  <div className="flex-1">
                    <p className="text-gray-800">{notification.message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markNotificationAsRead(notification.id)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark as Read
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserNotification;