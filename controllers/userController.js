const User = require('../models/User');

// Get public profile by userId
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user profile (only owner can update)
exports.updateProfile = async (req, res) => {
  try {
    if (req.user.userId !== req.params.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { profile_pic_url, name, bio, location, portfolio } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { profile_pic_url, name, bio, location, portfolio },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
