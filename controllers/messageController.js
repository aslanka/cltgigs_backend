const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Attachment = require('../models/Attachment');
const Gig = require('../models/Gig');
const Bid = require('../models/Bid');
const { resizeImage } = require('../middlewares/upload');

/*
  Creates or finds a conversation between
  (1) the gig owner
  (2) the bidder
  for a particular gig
*/
async function findOrCreateConversation(gigId, gigOwnerId, bidderId) {
  let conversation = await Conversation.findOne({
    gig_id: gigId,
    gig_owner_id: gigOwnerId,
    bidder_id: bidderId
  });
  if (!conversation) {
    conversation = new Conversation({
      gig_id: gigId,
      gig_owner_id: gigOwnerId,
      bidder_id: bidderId
    });
    await conversation.save();
  }
  return conversation;
}

exports.sendMessage = async (req, res) => {
  try {
    const { gigId, bidId, content } = req.body;
    const senderId = req.user.userId;

    // Validate the gig and the bid
    const gig = await Gig.findById(gigId);
    const bid = await Bid.findById(bidId);
    if (!gig || !bid) {
      return res.status(400).json({ error: 'Invalid gig or bid' });
    }

    // Determine gigOwnerId and bidderId from gig & bid
    const gigOwnerId = gig.user_id.toString();
    const bidderId = bid.user_id.toString();

    // Check if the sender is either the gig owner or the bidder
    if (senderId !== gigOwnerId && senderId !== bidderId) {
      return res.status(403).json({ error: 'You are not part of this conversation' });
    }

    // Find or create conversation
    const conversation = await findOrCreateConversation(gigId, gigOwnerId, bidderId);

    // Create message
    const message = new Message({
      conversation_id: conversation._id,
      sender_id: senderId,
      content
    });
    await message.save();

    // If there's an attachment, save it
    if (req.file) {
      // If it's an image, resize
      if (req.file.mimetype.startsWith('image/')) {
        await resizeImage(req.file.path);
      }
      const attachment = new Attachment({
        type: 'message',
        foreign_key_id: message._id,
        file_url: req.file.path
      });
      await attachment.save();
    }

    return res.status(201).json({ message: 'Message sent' });
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

    // Ensure the requesting user is part of this conversation
    if (
      req.user.userId !== conversation.gig_owner_id.toString() &&
      req.user.userId !== conversation.bidder_id.toString()
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const messages = await Message.find({ conversation_id: conversationId }).sort({ created_at: 1 });
    // Attachments can be fetched separately or aggregated
    // For simplicity, we just return messages; you can fetch attachments by message ID
    return res.json(messages);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};
