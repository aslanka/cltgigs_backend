// middlewares/auth.js
const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  const token = req.cookies.token;
  console.log('Received token:', token); // Debug logging

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug logging
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(403).json({ error: 'Invalid token' });
  }
};


exports.authorizeProfileUpdate = (req, res, next) => {
  if (req.params.userId !== req.user.userId) {
    return res.status(403).json({ error: 'Unauthorized profile access' });
  }
  next();
};