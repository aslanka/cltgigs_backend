const express = require('express');
const router = express.Router();
const { sendMessage, getConversationMessages } = require('../controllers/messageController');
const { authenticate } = require('../middlewares/auth');
const { messageUpload } = require('../middlewares/upload');

// Send message (or attachment)
router.post('/', authenticate, messageUpload.single('messageAttachment'), sendMessage);

// Get conversation messages
router.get('/:conversationId', authenticate, getConversationMessages);

module.exports = router;
