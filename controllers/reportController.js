// controllers/reportController.js
const Report = require('../models/Report');

exports.createReport = async (req, res) => {
  try {
    const { reporterId, creatorId, contentId, contentType, reportReason, reportDetails, additionalInfo } = req.body;

    if (!reportReason || !reportDetails) {
      return res.status(400).json({ error: 'Reason and details are required.' });
    }

    const newReport = new Report({
      reporterId,
      creatorId,
      contentId,
      contentType,
      reportReason,
      reportDetails,
      additionalInfo,
    });

    await newReport.save();

    res.status(201).json({ message: 'Report submitted successfully.' });
  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({ error: 'Failed to submit report.' });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('reporterId', 'name').populate('creatorId', 'name');
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id).populate('reporterId', 'name').populate('creatorId', 'name');

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report.' });
  }
};
