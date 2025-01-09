const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const {
  getAllConversationsForUser,
  getConversationMessages,
  sendMessage
} = require('../controllers/messageController');

// All user conversations
router.get('/', authenticate, getAllConversationsForUser);

// Messages in a specific conversation
router.get('/:conversationId', authenticate, getConversationMessages);

// Send a message in a conversation
router.post('/', authenticate, sendMessage);

module.exports = router;
