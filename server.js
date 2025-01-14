require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const http = require('http'); // For Socket.io
const { init } = require('./utils/socketIOInstance'); // Import Socket.IO initialization
const { setupSocketIO } = require('./utils/socketHandlers'); // Import Socket.IO event handlers

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

// Initialize Express app
const app = express();
app.set('trust proxy', 1);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = init(server); // Initialize Socket.IO and get the io instance
console.log('Socket.IO initialized:', io !== undefined); // Debugging: Confirm initialization

// Set up Socket.IO event handlers
setupSocketIO(io);

app.set('io', io);

// CORS configuration
const allowedOrigins = ['http://localhost:5173', 'http://localhost:4000', 'https://cltgigs.golockedin.com', 'https://cltgigsbackend.golockedin.com/']; // Add other origins if needed
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(xss());
app.use(express.json());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Passport initialization
app.use(passport.initialize());

// Static folder for uploaded images
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173', 'https://cltgigs.golockedin.com', 'https://cltgigsbackend.golockedin.com/');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gig-platform', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
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

// In production, serve React build or other front-end (omitted for brevity)

// Start the server
const PORT = process.env.SERVER_PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});