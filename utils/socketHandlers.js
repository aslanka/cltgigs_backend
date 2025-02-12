// utils/socketHandlers.js
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const Notification = require('../models/Notification');

// Store online users for notifications
let onlineUsers = {}; // { userId: socketId }

function setupSocketIO(io) {
  // Middleware to verify JWT from cookies on connection
  io.use((socket, next) => {
    console.log('Handshake cookies:', socket.handshake.headers.cookie);
    let token;
    if (socket.handshake.headers.cookie) {
      const cookies = cookie.parse(socket.handshake.headers.cookie);
      token = cookies.token;
    }
    if (!token) return next(new Error('No token provided'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      return next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.userId);

    // Store the socket for the connected user
    onlineUsers[socket.userId] = socket.id;

    // Join the user's room for real-time notifications
    socket.join(socket.userId);

    // --- Existing Chat Functionality ---
    socket.on('joinConversation', (conversationId) => {
      // The user joins a specific conversation room
      socket.join(conversationId);
    });

    // Listen for typing indicator
    socket.on('typing', ({ conversationId }) => {
      socket.to(conversationId).emit('typing', {
        userId: socket.userId,
        conversationId,
      });
    });

    // Listen for new message
    socket.on('newMessage', (messageData) => {
      // Broadcast to all other users in the room
      socket.to(messageData.conversationId).emit('newMessage', messageData);
    });

    // --- New Notification Functionality ---
    socket.on('newNotification', (notification) => {
      // Emit the notification to the recipient using their stored socket id
      const recipientSocketId = onlineUsers[notification.user_id];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('newNotification', notification);
      }
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.userId);
      delete onlineUsers[socket.userId];
    });
  });
}

module.exports = { setupSocketIO };
