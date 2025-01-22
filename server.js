if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: '.env.test' });
} else {
  require('dotenv').config();
}
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

// Import Routes
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

// Initialize Express app
const app = express();
app.set('trust proxy', 1);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = init(server);
setupSocketIO(io);
app.set('io', io);

// Environment variables
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: process.env.ALLOWED_METHODS.split(','),
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://*.golockedin.com"],
      connectSrc: ["'self'", process.env.FRONTEND_ORIGIN]
    }
    
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));

app.use(xss());
app.use(express.json());

// Rate Limiter
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW,
  max: parseInt(process.env.RATE_LIMIT_MAX)
});
app.use(limiter);

// Passport initialization
app.use(passport.initialize());

// Static folder with CORS headers
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ...(process.env.NODE_ENV === 'test' ? { 
    useCreateIndex: true,
    useFindAndModify: false 
  } : {})
};
mongoose.connect(process.env.MONGO_URI, mongooseOptions)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Passport strategies
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

// Server startup
const PORT = process.env.SERVER_PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

if (process.env.NODE_ENV === 'test') {
  module.exports = { app, server };
}