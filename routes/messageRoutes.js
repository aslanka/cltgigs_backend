// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const {
  getAllConversationsForUser,
  getConversationMessages,
  sendMessage,
  deleteMessage,
  reportMessage,
  blockConversation,
  unblockConversation
} = require('../controllers/messageController');

// GET all user conversations
router.get('/', authenticate, getAllConversationsForUser);

// GET messages for a specific conversation
router.get('/:conversationId', authenticate, getConversationMessages);

// POST a new message
router.post('/', authenticate, sendMessage);

// DELETE a specific message
router.delete('/:messageId', authenticate, deleteMessage);
router.post('/:messageId/report', authenticate, reportMessage);
router.post('/:conversationId/block', authenticate, blockConversation);
router.post('/:conversationId/unblock', authenticate, unblockConversation);


module.exports = router;
