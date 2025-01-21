// utils/socketIOInstance.js
const { Server } = require('socket.io');
require('dotenv').config();

let io;

function init(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      skipMiddlewares: true
    }
  });

  // Add ping/pong handling
  io.on('connection', (socket) => {
    socket.on('ping', (cb) => cb());
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