const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Gig = require('../models/Gig');

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

    // Populate other user + gig info
    for (let conv of conversations) {
      const gig = await Gig.findById(conv.gig_id).lean();
      conv.gigTitle = gig ? gig.title : 'Unknown Gig';

      let otherUserId = conv.gig_owner_id.toString() === userId
        ? conv.bidder_id
        : conv.gig_owner_id;
      let otherUser = await User.findById(otherUserId).lean();
      conv.otherUserName = otherUser ? otherUser.name : 'Unknown';

      // Keep conversationId consistent
      conv.conversationId = conv._id;
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

    const newMsg = new Message({
      conversation_id: conversationId,
      sender_id: userId,
      content
    });
    await newMsg.save();

    return res.status(201).json({ message: 'Message sent' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
