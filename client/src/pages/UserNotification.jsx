import React, { useContext, useEffect } from 'react';
import { Bell, CheckCircle, Loader2 } from 'lucide-react';
import { OrderContext } from '../contexts/OrderContext';

const UserNotification = () => {
  const { notifications, loading, error, fetchNotifications, markNotificationAsRead } = useContext(OrderContext);

  useEffect(() => {
    fetchNotifications();
    localStorage.setItem('notificationsViewed', 'true');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7efe5] via-[#f5e9d4] to-[#f8f5e4] font-serif">
        <Loader2 className="animate-spin text-[#a9895a]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7efe5] via-[#f5e9d4] to-[#f8f5e4] font-serif py-8 px-4">
      <div className="max-w-[78rem] mx-auto">
        <div className="bg-[#fff8f0] shadow-lg rounded-2xl overflow-hidden border border-[#e5ccb5]">
          <div className="flex items-center gap-2 p-4 border-b border-[#e5ccb5]">
            <Bell className="text-[#a9895a]" size={24} />
            <h1 className="text-xl font-semibold text-[#7c5e3c]">Notifications</h1>
          </div>

          {error && (
            <div className="p-4 bg-[#f8e0e0] text-[#c97b63] border-b border-[#f3c6c6]">
              {error}
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="p-6 text-center text-[#7c5e3c]">
              No notifications found
            </div>
          ) : (
            <ul className="divide-y divide-[#e5ccb5]">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-4 flex items-start gap-3 transition-colors rounded-b-lg ${
                    notification.isRead ? 'bg-[#f5e9d4]' : 'bg-[#fff8f0]'
                  } hover:bg-[#f3e8d8]`}
                >
                  <CheckCircle
                    className={`mt-1 ${
                      notification.isRead ? 'text-[#c3b18a]' : 'text-[#a9895a]'
                    }`}
                    size={20}
                  />
                  <div className="flex-1">
                    <p className="text-[#7c5e3c]">{notification.message}</p>
                    <p className="text-sm text-[#a9895a] mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markNotificationAsRead(notification.id)}
                      className="text-sm text-[#a9895a] hover:text-[#7c5e3c] font-semibold"
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