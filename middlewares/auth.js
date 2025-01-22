// middlewares/auth.js
const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const clientIP = req.ip.replace('::ffff:', '').replace('::1', '127.0.0.1');

  // Admin IP check
  if (process.env.ADMIN_IPS.split(',').includes(clientIP)) {
    req.user = { role: 'admin' };
    return next();
  }

  // JWT Authentication
  if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
  
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

exports.authorizeProfileUpdate = (req, res, next) => {
  if (req.params.userId !== req.user.userId) {
    return res.status(403).json({ error: 'Unauthorized profile access' });
  }
  next();
};