const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const User = require('../models/User');

// Public profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Private user profile (dashboard) - example
router.get('/me/dashboard', authenticate, async (req, res) => {
  // Return user data + stats for private dashboard
  // ...
});

module.exports = router;
