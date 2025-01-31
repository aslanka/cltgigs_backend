const { body, param } = require('express-validator');

exports.validateAttachmentUpload = [
  body('type').isIn(['gig', 'message', 'bid', 'profile', 'portfolio']),
  body('foreign_key_id').isMongoId(),
  param('attachmentId').isMongoId()
];