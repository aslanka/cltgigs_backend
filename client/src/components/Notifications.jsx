// src/components/Notifications.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { 
  FiCheckCircle, 
  FiAward, 
  FiBell, 
  FiX, 
  FiTrash2, 
  FiStar, 
  FiZap 
} from 'react-icons/fi';

const Notifications = ({ isOpen, onClose, refreshNotifications }) => {
  // Use userData (cookie-based auth) instead of token
  const { userData } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userPoints, setUserPoints] = useState(1420); // Connect to your backend as needed
  const navigate = useNavigate();

  // Mock achievements data - replace with real API call if available
  const [achievements] = useState([
    { id: 1, name: 'Explorer', progress: 80, target: 100 },
    { id: 2, name: 'Socializer', progress: 45, target: 100 },
  ]);

  useEffect(() => {
    if (!userData || !isOpen) return;
    fetchNotifications();
  }, [userData, isOpen]);

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
      refreshNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/notifications/read-all');
      refreshNotifications();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/notifications/${notificationId}`);
      refreshNotifications();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
    if (!notification.read) {
      markAsRead(notification._id);
    }
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ boxShadow: '-8px 0 32px rgba(0,0,0,0.05)' }}
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FiBell className="text-yellow-300 animate-pulse" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-xs px-2 py-1 rounded-full ml-2">
                {unreadCount}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close notifications"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Gamification Status */}
        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FiStar className="text-yellow-300" />
              <span className="font-semibold">{userPoints} Points</span>
            </div>
            <FiZap className="text-yellow-300" />
          </div>
          <div className="space-y-2">
            {achievements.map((achievement) => (
              <div key={achievement.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{achievement.name}</span>
                  <span>{Math.round((achievement.progress / achievement.target) * 100)}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-300 transition-all duration-500"
                    style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto h-[calc(100vh-20rem)] p-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FiAward className="text-3xl mx-auto mb-2" />
            <p>No notifications yet!</p>
            <p className="text-sm mt-2">Complete tasks to earn rewards</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`group p-4 mb-3 rounded-xl transition-all duration-200 ${
                notification.read 
                  ? 'bg-gray-50 hover:bg-gray-100' 
                  : 'bg-blue-50 border-l-4 border-blue-500'
              } cursor-pointer shadow-sm hover:shadow-md`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex gap-3">
                <div className="mt-1">
                  {notification.type === 'achievement' ? (
                    <FiAward className="text-yellow-500 text-xl" />
                  ) : (
                    <FiCheckCircle className="text-blue-500 text-xl" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.message}
                      {notification.rewardPoints && (
                        <span className="ml-2 text-yellow-600">
                          (+{notification.rewardPoints}⭐)
                        </span>
                      )}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 -mt-1 -mr-1 transition-opacity"
                      aria-label="Delete notification"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {moment(notification.created_at).fromNow()}
                    </span>
                    {!notification.read && (
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer CTAs */}
      <div className="border-t border-gray-100 p-4 bg-white">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
            onClick={() => navigate('/rewards')}
          >
            <FiStar className="text-sm" />
            Earn Points
          </button>
          <button
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
            onClick={() => navigate('/achievements')}
          >
            <FiAward className="text-sm" />
            Achievements
          </button>
        </div>
        <button
          onClick={markAllAsRead}
          className="w-full text-gray-600 hover:text-blue-600 text-sm px-4 py-2 transition-colors"
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
};

export default Notifications;
