import React, { useState, useEffect, useContext } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';

const Notifications = ({ isOpen, onClose }) => {
  const { token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n) => !n.read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/notifications/${notificationId}/read`);
      fetchNotifications(); // Refresh notifications
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/notifications/read-all');
      fetchNotifications(); // Refresh notifications
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold">Notifications</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          &times;
        </button>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-8rem)] p-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 mb-2 rounded-lg ${
                notification.read ? 'bg-gray-50' : 'bg-blue-50'
              }`}
            >
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {moment(notification.created_at).fromNow()}
              </p>
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                >
                  Mark as read
                </button>
              )}
            </div>
          ))
        )}
      </div>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={markAllAsRead}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
};

export default Notifications;