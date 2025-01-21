const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const {
  createReport,
  getReports,
  getReportById,
} = require('../controllers/reportController');

// Route to create a new report
router.post('/', authenticate, createReport);

// Route to get all reports (admin use)
router.get('/', authenticate, getReports);

// Route to get a specific report by ID
router.get('/:id', authenticate, getReportById);

module.exports = router;
