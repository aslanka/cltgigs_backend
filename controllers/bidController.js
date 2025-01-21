const Bid = require('../models/Bid');
const Gig = require('../models/Gig');
const { getIO } = require('../utils/socketIOInstance');
const Notification = require('../models/Notification')
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

exports.createBid = async (req, res) => {
  console.log('hid');
  try {
    const { gig_id, amount, message } = req.body;
    const userId = req.user.userId;

    // Check if the user has already placed a bid on this gig
    const existingBid = await Bid.findOne({ gig_id, user_id: userId });
    if (existingBid) {
      return res.status(400).json({ error: 'You have already placed a bid on this gig.' });
    }

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

    // Create a new conversation
    const newConversation = new Conversation({
      gig_id,
      gig_owner_id: gig.user_id._id,
      bidder_id: userId,
      bid_id: newBid._id,
    });
    await newConversation.save();

    // Add the conversation ID to the bid
    newBid.conversation_id = newConversation._id;
    await newBid.save();

    // Create the initial message in the conversation
    const initialMessage = new Message({
      conversation_id: newConversation._id,
      sender_id: userId,
      content: message,
    });
    await initialMessage.save();

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
      // Gig owner sees all bids with full user details
      const bids = await Bid.find({ gig_id: gigId })
        .populate('user_id', 'name profile_pic_url rating');
      return res.json(bids);
    } else {
      // Non-owner sees only their own bid with full details
      const yourBid = await Bid.findOne({ gig_id: gigId, user_id: userId })
        .populate('user_id', 'name profile_pic_url rating');
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
    const bids = await Bid.find({ 
      user_id: userId,
      gig_id: { $exists: true } // Add this filter
    })
    .populate({
      path: 'gig_id',
      select: 'title description price user_id',
      match: { _id: { $exists: true } } // Ensure gig exists
    })
    .populate('user_id', 'name profile_pic_url rating')
    .exec();

    // Filter out bids where gig_id was populated as null
    const validBids = bids.filter(bid => bid.gig_id !== null);
    
    res.json(validBids);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Add to bidController.js
exports.deleteBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const userId = req.user.userId;
    
    const bid = await Bid.findById(bidId);
    if (!bid) return res.status(404).json({ error: 'Bid not found' });

    if (bid.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Only bid creator can delete' });
    }

    await Bid.deleteOne({ _id: bidId });
    res.json({ message: 'Bid deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateBidStatus = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const bid = await Bid.findById(bidId).populate('gig_id');
    if (!bid) return res.status(404).json({ error: 'Bid not found' });

    if (bid.gig_id.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Only gig owner can update status' });
    }

    bid.status = status; // Add status field to Bid model
    await bid.save();
    
    res.json({ message: 'Bid status updated', bid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};