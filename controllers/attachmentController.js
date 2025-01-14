// controllers/attachmentController.js
const Attachment = require('../models/Attachment');
const fs = require('fs');
const path = require('path');

exports.uploadAttachmentGeneral = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type, foreign_key_id } = req.body;

    const attachment = new Attachment({
      type,
      foreign_key_id,
      file_url: `/uploads/${req.file.filename}`
    });
    await attachment.save();
    return res.status(201).json({ message: 'Attachment uploaded', attachmentId: attachment._id, file_url: attachment.file_url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const attachment = await Attachment.findById(attachmentId);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    return res.json({ attachment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const attachment = await Attachment.findById(attachmentId);
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    fs.unlink(path.join(__dirname, '..', attachment.file_url), (err) => {
      if (err) console.error(err);
    });

    await Attachment.deleteOne({ _id: attachmentId });
    return res.json({ message: 'Attachment deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};