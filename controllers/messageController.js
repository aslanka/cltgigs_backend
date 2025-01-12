const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Gig = require('../models/Gig');
const Bid = require('../models/Bid'); // Import Bid model

exports.getAllConversationsForUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversations = await Conversation.find({
      $or: [
        { gig_owner_id: userId },
        { bidder_id: userId }
      ]
    })
      .sort({ created_at: -1 })
      .lean();

    for (let conv of conversations) {
      const gig = await Gig.findById(conv.gig_id).lean();
      conv.gigTitle = gig ? gig.title : undefined;
      conv.gig_id = conv.gig_id; // preserve gig id for navigation

      let otherUserId = conv.gig_owner_id.toString() === userId
        ? conv.bidder_id
        : conv.gig_owner_id;
      let otherUser = await User.findById(otherUserId).lean();
      conv.otherUserName = otherUser ? otherUser.name : 'Unknown';
      conv.otherUserPic = otherUser ? otherUser.profile_pic_url : null;
      conv.otherUserId = otherUserId;

      conv.conversationId = conv._id;

      // Check if associated bid was rejected
      const bid = await Bid.findOne({ gig_id: conv.gig_id, bidder_id: conv.bidder_id });
      if (bid && bid.rejected) {
        conv.bidRejected = true;
      }
    }

    res.json(conversations);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    if (
      conversation.gig_owner_id.toString() !== req.user.userId &&
      conversation.bidder_id.toString() !== req.user.userId
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Check if associated bid was rejected
    const bid = await Bid.findOne({
      gig_id: conversation.gig_id,
      bidder_id: conversation.bidder_id,
      rejected: true
    });
    if (bid) {
      return res.json([]); // No messages for rejected bids
    }

    const messages = await Message.find({ conversation_id: conversationId })
      .sort({ created_at: 1 })
      .lean();

    for (let msg of messages) {
      const sender = await User.findById(msg.sender_id).lean();
      msg.senderName = sender ? sender.name : 'Unknown';
    }

    res.json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    if (
      conversation.gig_owner_id.toString() !== userId &&
      conversation.bidder_id.toString() !== userId
    ) {
      return res.status(403).json({ error: 'Not part of this conversation' });
    }

    // Prevent sending messages if bid was rejected
    const bid = await Bid.findOne({
      gig_id: conversation.gig_id,
      bidder_id: conversation.bidder_id,
      rejected: true
    });
    if (bid) {
      return res.status(403).json({ error: 'Cannot send message; bid was rejected' });
    }

    const newMsg = new Message({
      conversation_id: conversationId,
      sender_id: userId,
      content
    });
    await newMsg.save();

    res.status(201).json({ message: 'Message sent' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
