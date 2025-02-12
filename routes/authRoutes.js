// routes/authRoutes.js  (Also set domain in OAuth callbacks)
const express = require('express');
const passport = require('passport');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Email/Password
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Helper function (remains the same)
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Facebook OAuth - DOMAIN FIX
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
      domain: '.golockedin.com', // Set the domain
    });
    res.redirect(`${process.env.FRONTEND_ORIGIN}`);
  }
);

// Google OAuth - DOMAIN FIX
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })
);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_ORIGIN}/login?error=google` }),
  (req, res) => {
    const token = generateToken(req.user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
      domain: '.golockedin.com',  // Set the domain
    });
    res.redirect(`${process.env.FRONTEND_ORIGIN}`);
  }
);

router.get('/check-session', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ isAuthenticated: false });

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ isAuthenticated: true });
  } catch {
    res.json({ isAuthenticated: false });
  }
});

// Apple OAuth - DOMAIN FIX
router.post(
  '/apple',
  passport.authenticate('apple', { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
      domain: '.golockedin.com', // Set the domain
    });
    res.redirect(`${process.env.FRONTEND_ORIGIN}`);
  }
);

module.exports = router;