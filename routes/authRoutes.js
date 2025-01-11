const express = require('express');
const passport = require('passport');
const { registerUser, loginUser } = require('../controllers/authController');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Existing email/password routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Helper to generate JWT after OAuth success
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET || 'supersecretkey',
    { expiresIn: '1d' }
  );
};

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Successful authentication, generate token and respond
    const token = generateToken(req.user);
    res.json({ message: 'Google login successful', token });
  }
);

// Apple OAuth routes
// For Apple, you typically use a POST request because Apple sends a JWT to your callback URL.
// Adjust these routes based on how your front-end interacts with Apple Sign In.
router.post(
  '/apple',
  passport.authenticate('apple', { session: false }),
  (req, res) => {
    // Successful authentication, generate token and respond
    const token = generateToken(req.user);
    res.json({ message: 'Apple login successful', token });
  }
);

module.exports = router;
