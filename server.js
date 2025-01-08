require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');

// Security Middlewares
app.use(cors());              // Enable CORS
app.use(helmet());            // Secure HTTP headers
app.use(xssClean());          // XSS protection
app.use(express.json());      // Parse JSON bodies

// Rate limiting (e.g., max 100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// Connect to MongoDB
connectDB();

// Routes

const authRoutes = require('./routes/authRoutes');


app.use('/api/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
