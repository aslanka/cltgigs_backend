const express = require('express');
const router = express.Router();
const {
  uploadAttachmentGeneral,
  getAttachment,
  deleteAttachment
} = require('../controllers/attachmentController');

const { authenticate } = require('../middlewares/auth');
const { messageUpload } = require('../middlewares/upload');
const { validateAttachmentUpload } = require('../middlewares/validation');

// General file upload endpoint
router.post('/', authenticate, messageUpload.single('file'), validateAttachmentUpload, uploadAttachmentGeneral);
router.get('/:attachmentId', getAttachment);
router.delete('/:attachmentId', authenticate, deleteAttachment);

module.exports = router;