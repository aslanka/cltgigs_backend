const Gig = require('../models/Gig');
const Attachment = require('../models/Attachment');
const { resizeImage } = require('../middlewares/upload');

exports.getAllGigs = async (req, res) => {
  try {
    const gigs = await Gig.find().sort({ created_at: -1 });
    return res.json(gigs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createGig = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    const userId = req.user.userId;

    // Create gig
    const gig = new Gig({
      user_id: userId,
      title,
      description,
      price
    });
    await gig.save();

    // If user attached an image, resize and store
    if (req.file) {
      // Resize
      await resizeImage(req.file.path);

      // Create attachment
      const attachment = new Attachment({
        type: 'gig',
        foreign_key_id: gig._id,
        file_url: req.file.path
      });
      await attachment.save();
    }

    return res.status(201).json({ message: 'Gig created', gigId: gig._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getGigDetails = async (req, res) => {
  try {
    const { gigId } = req.params;
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Find attachments
    const attachments = await Attachment.find({ type: 'gig', foreign_key_id: gigId });
    return res.json({ gig, attachments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.updateGig = async (req, res) => {
  try {
    const { gigId } = req.params;
    const { title, description, price } = req.body;
    const gig = await Gig.findById(gigId);

    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }
    if (gig.user_id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (title) gig.title = title;
    if (description) gig.description = description;
    if (price) gig.price = price;

    await gig.save();
    return res.json({ message: 'Gig updated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteGig = async (req, res) => {
  try {
    const { gigId } = req.params;
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }
    if (gig.user_id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Delete gig
    await Gig.deleteOne({ _id: gigId });
    // Optionally delete attachments in DB and from disk
    await Attachment.deleteMany({ type: 'gig', foreign_key_id: gigId });

    return res.json({ message: 'Gig deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
