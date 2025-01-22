const User = require('../models/User');
const { resizeImage } = require('../middlewares/upload');

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
      social_media_links: this.validateSocialLinks(socialLinks)
    };

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true
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

exports.validateSocialLinks = (links) => {
  if (!Array.isArray(links)) return [];
  const validEntries = [];
  const allowedDomains = {
    github: 'github.com',
    linkedin: 'linkedin.com',
    twitter: 'twitter.com',
    website: ''
  };

  links.forEach(link => {
    if (typeof link === 'object' && link.type && link.url) {
      try {
        const urlObj = new URL(link.url);
        if (allowedDomains[link.type] && 
          (link.type === 'website' || urlObj.hostname.endsWith(allowedDomains[link.type]))
        ) {
          validEntries.push({
            type: link.type,
            url: link.url
          });
        }
      } catch (e) {
        // Invalid URL
      }
    }
  });

  return validEntries;
};