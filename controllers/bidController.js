const Bid = require('../models/Bid');
const Attachment = require('../models/Attachment');
const { resizeImage } = require('../middlewares/upload');

exports.getAllBidsForGig = async (req, res) => {
  try {
    const { gigId } = req.params;
    const bids = await Bid.find({ gig_id: gigId }).sort({ created_at: -1 });
    return res.json(bids);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.createBid = async (req, res) => {
  try {
    const { gig_id, amount } = req.body;
    const userId = req.user.userId;

    const bid = new Bid({
      gig_id,
      user_id: userId,
      amount
    });
    await bid.save();

    // If there's an attachment for the bid (optional)
    if (req.file) {
      // For a bid, we didn't restrict to images only, 
      // but let's assume you still want to resize if it's an image:
      if (req.file.mimetype.startsWith('image/')) {
        await resizeImage(req.file.path);
      }

      const attachment = new Attachment({
        type: 'bid',
        foreign_key_id: bid._id,
        file_url: req.file.path
      });
      await attachment.save();
    }

    return res.status(201).json({ message: 'Bid created', bidId: bid._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getBidDetails = async (req, res) => {
  try {
    const { bidId } = req.params;
    const bid = await Bid.findById(bidId);
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    const attachments = await Attachment.find({ type: 'bid', foreign_key_id: bidId });
    return res.json({ bid, attachments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
