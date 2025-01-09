const Bid = require('../models/Bid');
const Gig = require('../models/Gig');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

exports.createBid = async (req, res) => {
  try {
    const { gig_id, amount, message } = req.body;
    const userId = req.user.userId;

    const gig = await Gig.findById(gig_id);
    if (!gig) {
      return res.status(404).json({ error: 'Gig not found' });
    }
    if (gig.user_id.toString() === userId) {
      return res.status(403).json({ error: 'Cannot bid on your own gig.' });
    }

    const newBid = new Bid({
      gig_id,
      user_id: userId,
      amount,
      message
    });
    await newBid.save();

    let conversation = await Conversation.findOne({
      gig_id,
      gig_owner_id: gig.user_id,
      bidder_id: userId
    });
    if (!conversation) {
      conversation = new Conversation({
        gig_id,
        gig_owner_id: gig.user_id,
        bidder_id: userId
      });
      await conversation.save();
    }

    const newMessage = new Message({
      conversation_id: conversation._id,
      sender_id: userId,
      content: message || `Hi, I'm placing a bid of $${amount}`
    });
    await newMessage.save();

    return res.status(201).json({
      message: 'Bid placed successfully',
      bidId: newBid._id,
      conversationId: conversation._id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
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
