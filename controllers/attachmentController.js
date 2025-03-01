// controllers/attachmentController.js
const Attachment = require('../models/Attachment');
const fs = require('fs').promises;
const path = require('path');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { processImage } = require('../middlewares/upload');
const sanitize = require('mongo-sanitize');

exports.uploadAttachmentGeneral = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) await fs.unlink(req.file.path);
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Additional sanitization
    const type = sanitize(req.body.type);
    const foreign_key_id = sanitize(req.body.foreign_key_id);

    if (req.file.mimetype.startsWith('image/')) {
      await processImage(req.file.path);
    }

    const stats = await fs.stat(req.file.path);
    
    const attachment = new Attachment({
      type,
      foreign_key_id,
      file_url: `/uploads/${req.file.filename}`,
      uploaded_by: req.user._id,
      mime_type: req.file.mimetype,
      file_size: stats.size
    });

    await attachment.save();
    
    logger.info(`Attachment uploaded: ${attachment._id}`, {
      user: req.user._id,
      type: attachment.type
    });

    return res.status(201).json({
      message: 'Attachment uploaded',
      attachmentId: attachment._id,
      file_url: attachment.file_url
    });

  } catch (err) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    logger.error(`Upload error: ${err.message}`, { error: err });
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getAttachment = async (req, res) => {
  try {
    const attachmentId = sanitize(req.params.attachmentId);
    const attachment = await Attachment.findById(attachmentId)
      .lean()
      .setOptions({ sanitizeFilter: true });

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Set security headers
    res.set({
      'Content-Security-Policy': "default-src 'none'",
      'X-Content-Type-Options': 'nosniff',
      'Cross-Origin-Resource-Policy': 'same-site'
    });

    return res.json({ attachment });

  } catch (err) {
    logger.error(`Fetch error: ${err.message}`, { error: err });
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteAttachment = async (req, res) => {
  try {
    const attachmentId = sanitize(req.params.attachmentId);
    const attachment = await Attachment.findOne({
      _id: attachmentId,
      uploaded_by: req.user._id
    });

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const filePath = path.join(__dirname, '..', attachment.file_url);
    await fs.unlink(filePath).catch(err => {
      logger.warn(`File delete warning: ${err.message}`);
    });

    await Attachment.deleteOne({ _id: attachmentId });
    
    logger.info(`Attachment deleted: ${attachmentId}`, {
      user: req.user._id
    });

    return res.json({ message: 'Attachment deleted' });

  } catch (err) {
    logger.error(`Delete error: ${err.message}`, { error: err });
    return res.status(500).json({ error: 'Server error' });
  }
};