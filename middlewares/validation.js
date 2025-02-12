// middlewares/validation.js
const { body, param } = require("express-validator");

// For upload endpoint (POST /attachments)
exports.validateAttachmentUpload = [
  body("type").isIn(["gig", "message", "bid", "profile", "portfolio"]),
  body("foreign_key_id").isMongoId(),
];

// For endpoints that include :attachmentId (GET, DELETE)
exports.validateAttachmentId = [
  param("attachmentId").isMongoId(),
];
