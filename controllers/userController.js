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

// controllers/userController.js
exports.uploadCertifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const files = req.files;

    const fileUrls = files.map((file) => `/uploads/${file.filename}`);
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { certifications: { $each: fileUrls } } },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedData = req.body;

    // Exclude fields that should not be updated directly
    delete updatedData.name; 

    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.uploadPortfolio = async (req, res) => {
  try {
    const { userId } = req.params;
    const files = req.files;

    const fileUrls = files.map((file) => `/uploads/${file.filename}`);
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { portfolio: { $each: fileUrls } } },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.removePortfolioItem = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fileUrl } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { portfolio: fileUrl } },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
