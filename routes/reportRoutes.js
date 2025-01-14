// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const Report = require('../models/Report'); // Assuming you have a Report model
const { authenticate } = require('../middlewares/auth');

router.post('/', authenticate, async (req, res) => {
  try {
    const { reporterId, creatorId, contentId, contentType, reportDetails, timestamp } = req.body;

    const newReport = new Report({
      reporterId,
      creatorId,
      contentId,
      contentType,
      reportDetails,
      timestamp,
    });

    await newReport.save();
    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

module.exports = router;