// utils/socketIOInstance.js
const { Server } = require('socket.io');
require('dotenv').config();

let io;

function init(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN,// Allow your frontend origin
      methods: ['GET', 'POST'],        // Allowed HTTP methods
      credentials: true,               // Allow credentials (if needed)
    },
  });

  // Optional: Add event listeners for debugging
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = {
  init,
  getIO,
};