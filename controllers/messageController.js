// controllers/messageController.js
const { getIO } = require('../utils/socketIOInstance');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Gig = require('../models/Gig');
const Bid = require('../models/Bid');
const mongoose = require('mongoose');
// We'll emit to socket.io from within these methods:
const Notification = require('../models/Notification');
// We'll create a shared instance

// GET /api/messages (all conversations for user)
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

    // Populate conversation data
    for (let conv of conversations) {
      const gig = await Gig.findById(conv.gig_id).lean();
      conv.gigTitle = gig ? gig.title : 'No Title';

      const otherUserId = (conv.gig_owner_id.toString() === userId)
        ? conv.bidder_id
        : conv.gig_owner_id;
      const otherUser = await User.findById(otherUserId).lean();
      conv.otherUserName = otherUser?.name || 'Unknown User';
      conv.otherUserPic = otherUser?.profile_pic_url || '';

      // Mark if conversation is blocked for the current user
      if (conv.gig_owner_id.toString() === userId && conv.blocked_by_owner) {
        conv.isBlocked = true;
      } else if (conv.bidder_id.toString() === userId && conv.blocked_by_bidder) {
        conv.isBlocked = true;
      } else {
        conv.isBlocked = false;
      }
    }

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/messages/:conversationId
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check if user is part of this conversation
    if (
      conversation.gig_owner_id.toString() !== userId &&
      conversation.bidder_id.toString() !== userId
    ) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    // Check if user has blocked conversation
    if (
      (conversation.gig_owner_id.toString() === userId && conversation.blocked_by_owner) ||
      (conversation.bidder_id.toString() === userId && conversation.blocked_by_bidder)
    ) {
      return res.json([]); // Return empty if blocked from own side
    }

    const msgs = await Message.find({ conversation_id: conversationId })
      .sort({ created_at: 1 })
      .lean();

    res.json(msgs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content, file_url } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: 'Missing conversationId' });
    }

    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId).populate('gig_owner_id bidder_id');
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check if the user is part of the conversation
    if (
      conversation.gig_owner_id._id.toString() !== userId &&
      conversation.bidder_id._id.toString() !== userId
    ) {
      return res.status(403).json({ error: 'Not part of this conversation' });
    }

    // Check if the conversation is blocked
    if (
      (conversation.gig_owner_id._id.toString() === userId && conversation.blocked_by_owner) ||
      (conversation.bidder_id._id.toString() === userId && conversation.blocked_by_bidder)
    ) {
      return res.status(403).json({ error: 'Conversation blocked' });
    }

    // Create and save the new message
    const newMsg = new Message({
      conversation_id: conversationId,
      sender_id: userId,
      content,
      file_url,
    });
    await newMsg.save();

    // Emit the new message to the conversation room
    const io = getIO();
    io.to(conversationId).emit('newMessage', {
      _id: newMsg._id,
      conversation_id: newMsg.conversation_id,
      sender_id: userId,
      content: newMsg.content,
      file_url: newMsg.file_url,
      created_at: newMsg.created_at,
    });

    // Determine the recipient of the message
    const recipientId = conversation.gig_owner_id._id.toString() === userId
      ? conversation.bidder_id._id
      : conversation.gig_owner_id._id;

    // Create a notification for the recipient
    const notification = new Notification({
      user_id: recipientId,
      type: 'message',
      message: `You have a new message from ${req.user.name}`,
      link: `/messages/${conversationId}`,
    });
    await notification.save();

    // Emit the notification to the recipient
    io.to(recipientId.toString()).emit('newNotification', notification);

    return res.status(201).json({ message: 'Message sent', newMsg });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// In the deleteMessage function
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const msg = await Message.findById(messageId);
    if (!msg) {
      return res.status(404).json({ error: 'Message not found' });
    }
    // Only sender can delete
    if (msg.sender_id.toString() !== userId) {
      return res.status(403).json({ error: 'Cannot delete others messages' });
    }

    await Message.deleteOne({ _id: messageId });

    // Use getIO() instead of direct io
    const io = getIO();
    io.to(msg.conversation_id.toString()).emit('messageDeleted', { messageId });

    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/messages/:messageId/report
exports.reportMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const msg = await Message.findById(messageId);
    if (!msg) {
      return res.status(404).json({ error: 'Message not found' });
    }
    msg.reported = true;
    await msg.save();
    res.json({ message: 'Message reported' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/messages/:conversationId/block
exports.blockConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.gig_owner_id.toString() === userId) {
      conversation.blocked_by_owner = true;
    } else if (conversation.bidder_id.toString() === userId) {
      conversation.blocked_by_bidder = true;
    } else {
      return res.status(403).json({ error: 'Not part of this conversation' });
    }

    await conversation.save();
    res.json({ message: 'Conversation blocked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/messages/:conversationId/unblock
exports.unblockConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.gig_owner_id.toString() === userId) {
      conversation.blocked_by_owner = false;
    } else if (conversation.bidder_id.toString() === userId) {
      conversation.blocked_by_bidder = false;
    } else {
      return res.status(403).json({ error: 'Not part of this conversation' });
    }

    await conversation.save();
    res.json({ message: 'Conversation unblocked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
