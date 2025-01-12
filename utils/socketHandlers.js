// utils/socketHandlers.js
const jwt = require('jsonwebtoken');
const { getIO } = require('./socketIOInstance');

// We can store connected users by userId -> socketId if needed
let onlineUsers = {}; // { userId: socketId }

function setupSocketIO(io) {
    // Middleware to verify JWT on connection
    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token provided'));
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
        socket.userId = decoded.userId;
        return next();
      } catch (err) {
        return next(new Error('Invalid token'));
      }
    });
  
    io.on('connection', (socket) => {
      // Store the socket for the connected user
      onlineUsers[socket.userId] = socket.id;
  
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
  
      socket.on('disconnect', () => {
        // Cleanup
        delete onlineUsers[socket.userId];
      });
    });
  }
  
  module.exports = { setupSocketIO };
