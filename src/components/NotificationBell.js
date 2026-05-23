import React, { useEffect, useState } from 'react';
import API from '../services/api';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const iconForType = (type) => ({
    assignment: '📝',
    live: '🎥',
    grade: '✅',
    message: '💬',
    system: '⚙️',
  }[type] || '🔔');

  const toRelative = (ts) => {
    if (!ts) return '';
    const now = Date.now();
    const t = new Date(ts).getTime();
    const diff = Math.max(0, now - t);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // load from storage quickly, then refresh from API
  useEffect(() => {
    try {
      const cached = localStorage.getItem('notifications-cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        setNotifications(parsed);
      }
    } catch (err) {
      console.warn('Could not read cached notifications:', err.message);
    }
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/notifications');
      const list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      const mapped = list.map((n, idx) => ({
        id: n._id || n.id || idx + 1,
        type: n.type || 'message',
        title: n.title || n.subject || 'Notification',
        message: n.message || n.body || '',
        time: toRelative(n.createdAt || n.time || n.timestamp || Date.now()),
        read: !!n.read,
        icon: iconForType(n.type),
      }));
      setNotifications(mapped);
      localStorage.setItem('notifications-cache', JSON.stringify(mapped));
    } catch (err) {
      console.warn('Could not fetch notifications, showing cached or empty.', err.message);
      // keep cached if present
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('notifications-cache', JSON.stringify(next));
      return next;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const next = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('notifications-cache', JSON.stringify(next));
      return next;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    setIsOpen(false);
    localStorage.removeItem('notifications-cache');
  };

  return (
    <div className="relative">
      <button 
        className="relative p-2 rounded-lg transition-colors hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <span className="text-xl block">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-primary-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[999]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[calc(100%+8px)] right-0 w-96 max-h-[500px] bg-white rounded-xl shadow-soft-lg z-[1000] flex flex-col overflow-hidden animate-slideDown">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex gap-3">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline">
                    Clear all
                  </button>
                )}
                <button onClick={fetchNotifications} className="text-sm font-medium text-gray-600 hover:text-gray-800 hover:underline ml-auto">
                  Refresh
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px]">
              {loading ? (
                <div className="space-y-3 px-5 py-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse flex gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                        <div className="h-3 bg-gray-100 rounded w-full" />
                        <div className="h-3 bg-gray-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-16 px-5 text-center">
                  <span className="text-5xl block mb-3">✨</span>
                  <p className="text-base font-semibold text-gray-700 mb-1">No notifications</p>
                  <small className="text-sm text-gray-500">You're all caught up!</small>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`flex gap-3 px-5 py-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 relative ${
                      !notification.read ? 'bg-primary-50 hover:bg-primary-100/50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="text-2xl flex-shrink-0">{notification.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 mb-1">{notification.title}</div>
                      <div className="text-sm text-gray-600 mb-1 leading-relaxed">{notification.message}</div>
                      <div className="text-xs text-gray-500">{notification.time}</div>
                    </div>
                    {!notification.read && <div className="absolute top-5 right-4 w-2 h-2 bg-primary-600 rounded-full" />}
                  </div>
                ))
              )}
            </div>

            {notifications.length > 5 && (
              <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 text-center">
                <a href="/notifications" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline no-underline">
                  View all notifications →
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
