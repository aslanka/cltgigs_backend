// server.js (Main application file) - CORS and Cookie Domain Fix
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const http = require('http');
const { init } = require('./utils/socketIOInstance');
const { setupSocketIO } = require('./utils/socketHandlers');
const cookieParser = require('cookie-parser');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const gigRoutes = require('./routes/gigRoutes');
const bidRoutes = require('./routes/bidRoutes');
const messageRoutes = require('./routes/messageRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');

const app = express();
app.set('trust proxy', 1);

// HTTP server + Socket.IO
const server = http.createServer(app);
const io = init(server);
setupSocketIO(io);
app.set('io', io);

// CORS Setup - Explicitly allow Cache-Control
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
    //console.log("Allowed Origins:", allowedOrigins);
    //console.log('hi');
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with', 'Cache-Control'] // ADD 'Cache-Control' here
};
app.use(cors(corsOptions));

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Temporarily disable for testing
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX, 10)         // 100 requests
});
app.use(limiter);

// Body Parsing
app.use(express.json());
app.use(cookieParser()); // Use cookie-parser middleware

// Passport initialization
app.use(passport.initialize());

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Passport Strategies
require('./strategies/passportStrategies');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// Start Server
const PORT = process.env.SERVER_PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for testing - Keeping this as it was in original code, assuming you still need it for tests
if (process.env.NODE_ENV === 'test') {
  module.exports = { app, server };
}