// routes/attachmentRoutes.js
const express = require("express");
const router = express.Router();
const {
  uploadAttachmentGeneral,
  getAttachment,
  deleteAttachment,
} = require("../controllers/attachmentController");
const { authenticate } = require("../middlewares/auth");
const { uploadMiddleware } = require("../middlewares/upload");
const { validateAttachmentUpload, validateAttachmentId } = require("../middlewares/validation");

// Use validateAttachmentUpload on POST
router.post(
  "/",
  authenticate,
  uploadMiddleware.single("file"),
  validateAttachmentUpload,
  uploadAttachmentGeneral
);

// For GET and DELETE that expect :attachmentId in the URL
router.get("/:attachmentId", validateAttachmentId, getAttachment);
router.delete("/:attachmentId", authenticate, validateAttachmentId, deleteAttachment);

module.exports = router;
