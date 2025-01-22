const jwt = require('jsonwebtoken');
const adminIPs = ['127.0.0.1', '::1'];
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const clientIP = req.ip === '::1' ? '127.0.0.1' : req.ip;

  
  console.log(clientIP)
  if (adminIPs.includes(clientIP)) {
    req.user = { role: 'admin' }; // Grant admin access
    return next();
  }


  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId: ..., email: ... }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
