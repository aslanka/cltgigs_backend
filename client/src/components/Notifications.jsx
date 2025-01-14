import React, { useState, useEffect, useContext } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const Notifications = ({ isOpen, onClose, refreshNotifications }) => {
  const { token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    fetchNotifications();
  }, [token, isOpen]); // Refresh notifications when the panel is opened

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n) => !n.read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Mark all notifications as read when the sidebar is opened
  useEffect(() => {
    if (isOpen) {
      markAllAsRead();
    }
  }, [isOpen]);

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/notifications/${notificationId}/read`);
      refreshNotifications(); // Refresh notifications after marking as read
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put('/notifications/read-all');
      refreshNotifications(); // Refresh notifications after marking all as read
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/notifications/${notificationId}`);
      refreshNotifications(); // Refresh notifications after deletion
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Handle clicking on a notification card
  const handleNotificationClick = (notification) => {
    if (notification.link) {
      navigate(notification.link); // Navigate to the link
      onClose(); // Close the notification sidebar
    }
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg transform transition-transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold">Notifications</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl p-2"
        >
          &times;
        </button>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto h-[calc(100vh-8rem)] p-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 mb-2 rounded-lg ${
                notification.read ? 'bg-gray-50' : 'bg-blue-50'
              } cursor-pointer`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm">
                    {notification.message || 'You have a new message'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {moment(notification.created_at).fromNow()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click event
                    deleteNotification(notification._id);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl p-1"
                >
                  &times;
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={markAllAsRead}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
};

export default Notifications;