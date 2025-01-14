// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

// Get all notifications for the authenticated user
router.get('/', authenticate, getNotifications);

// Mark a notification as read
router.put('/:notificationId/read', authenticate, markAsRead);

// Mark all notifications as read
router.put('/read-all', authenticate, markAllAsRead);

// Delete a notification
router.delete('/:notificationId', authenticate, deleteNotification);

module.exports = router;