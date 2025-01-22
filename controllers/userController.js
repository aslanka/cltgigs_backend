const User = require('../models/User');
const { resizeImage } = require('../middlewares/upload');
const path = require('path');
const fs = require('fs');

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

exports.checkBlockStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user.userId);
    
    const isBlocked = currentUser.blockedUsers.includes(userId);
    res.json({ isBlocked });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

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
    const {
      name,
      bio,
      location,
      experience,
      socialLinks,
      tagline,
      skills
    } = req.body;

    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData = {
      name,
      bio,
      location,
      experience: Math.max(0, parseInt(experience)) || 0,
      tagline,
      skills: Array.isArray(skills) ? skills : [],
      social_media_links: Array.isArray(socialLinks) ? socialLinks : []
    };

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.uploadPortfolio = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const processedFiles = await Promise.all(
      req.files.map(async (file) => {
        await resizeImage(file.path, 1200, 800);
        return `/uploads/${file.filename}`;
      })
    );

    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { portfolio: { $each: processedFiles } } },
      { new: true, select: '-password' }
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

    // Delete physical file
    const filePath = path.join(__dirname, '..', fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { portfolio: fileUrl } },
      { new: true, select: '-password' }
    );

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user.profile_pic_url) {
      return res.status(400).json({ error: 'No profile picture to delete' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', user.profile_pic_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    user.profile_pic_url = null;
    await user.save();
    
    res.json({ message: 'Profile picture deleted', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.addSocialLink = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, url } = req.body;

    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    user.social_media_links.push({ type, url });
    await user.save();
    
    res.json({ 
      message: 'Social link added', 
      links: user.social_media_links 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteSocialLink = async (req, res) => {
  try {
    const { userId, index } = req.params;

    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (index < 0 || index >= user.social_media_links.length) {
      return res.status(400).json({ error: 'Invalid link index' });
    }

    user.social_media_links.splice(index, 1);
    await user.save();
    
    res.json({ 
      message: 'Social link deleted', 
      links: user.social_media_links 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};