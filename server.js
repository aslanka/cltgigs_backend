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

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://cltgigs.golockedin.com',
      'https://cltgigsbackend.golockedin.com',
    ];

    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'cache-control', // Add cache-control
    'x-requested-with', // Add x-requested-with for common usage
    'x-content-type-options'
  ],
  credentials: true,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));


// Security Middleware
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

// Rate Limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW,
  max: parseInt(process.env.RATE_LIMIT_MAX)
});
app.use(limiter);

// Passport initialization
app.use(passport.initialize());

// Static Files Handling
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

// Passport Strategies
require('./strategies/passportStrategies');

// Route Handlers
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

// Server Startup
const PORT = process.env.SERVER_PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for testing
if (process.env.NODE_ENV === 'test') {
  module.exports = { app, server };
}