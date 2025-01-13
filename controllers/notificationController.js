// controllers/notificationController.js
const Notification = require('../models/Notification');

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.find({ user_id: userId })
      .sort({ created_at: -1 }) // Sort by most recent first
      .limit(50); // Limit to 50 notifications
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.updateMany(
      { user_id: userId, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndDelete(notificationId);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};