const Bid = require('../models/Bid');
const Gig = require('../models/Gig');
const { getIO } = require('../utils/socketIOInstance');
const Notification = require('../models/Notification')
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

exports.createBid = async (req, res) => {
  try {
    const { gig_id, amount, message } = req.body;
    const userId = req.user.userId;

    const gig = await Gig.findById(gig_id).populate('user_id');
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    // Create a new bid
    const newBid = new Bid({
      gig_id,
      user_id: userId,
      amount,
      message,
    });
    await newBid.save();

    // Create a notification for the gig owner
    const notification = new Notification({
      user_id: gig.user_id._id,
      type: 'bid',
      message: `You have a new bid of $${amount} on your gig: ${gig.title}`,
      link: `/gig/${gig_id}`,
    });
    await notification.save();

    // Emit the notification to the gig owner via Socket.IO
    const io = getIO();
    io.to(gig.user_id._id.toString()).emit('newNotification', notification);

    res.status(201).json({ message: 'Bid placed successfully', newBid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Only the gig owner sees all bids; non-owner sees only their own
exports.getBidsForGig = async (req, res) => {
  try {
    const { gigId } = req.params;
    const userId = req.user.userId;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }

    if (gig.user_id.toString() === userId) {
      const bids = await Bid.find({ gig_id: gigId }).populate('user_id', 'name');
      return res.json(bids);
    } else {
      const yourBid = await Bid.findOne({ gig_id: gigId, user_id: userId })
        .populate('user_id', 'name');
      if (!yourBid) return res.json([]);
      return res.json([yourBid]);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Accept a bid (gig owner only)
exports.acceptBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const userId = req.user.userId;
    const bid = await Bid.findById(bidId).populate('gig_id');
    if (!bid) return res.status(404).json({ error: 'Bid not found' });

    if (bid.gig_id.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Only gig owner can accept bids' });
    }

    // Mark bid as accepted
    bid.accepted = true;
    await bid.save();

    // Update gig assignment if needed
    bid.gig_id.assigned_bid = bid._id;
    await bid.gig_id.save();

    res.json({ message: 'Bid accepted', bidId: bid._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Deny a bid (gig owner only)
exports.denyBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const userId = req.user.userId;
    const bid = await Bid.findById(bidId).populate('gig_id');
    if (!bid) return res.status(404).json({ error: 'Bid not found' });

    if (bid.gig_id.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Only gig owner can deny bids' });
    }

    // Mark bid as rejected instead of deleting
    bid.rejected = true;
    await bid.save();

    // Optionally, remove related conversation or mark it inactive
    // For example:
    // await Conversation.findOneAndDelete({ gig_id: bid.gig_id._id, bidder_id: bid.user_id });

    res.json({ message: 'Bid denied', bidId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Optional undeny endpoint to revert a rejection
exports.undenyBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const userId = req.user.userId;
    const bid = await Bid.findById(bidId).populate('gig_id');
    if (!bid) return res.status(404).json({ error: 'Bid not found' });

    if (bid.gig_id.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Only gig owner can undeny bids' });
    }

    bid.rejected = false;
    await bid.save();

    res.json({ message: 'Bid undenied', bidId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMyBids = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bids = await Bid.find({ user_id: userId })
      .populate('gig_id', 'title description price user_id')
      .populate('user_id', 'name profile_pic_url rating');

    res.json(bids);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
