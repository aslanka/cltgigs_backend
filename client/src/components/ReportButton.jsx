import React, { useState, useContext } from 'react';
import axios from "../api/axiosInstance";
import { AuthContext } from '../context/AuthContext';

const ReportButton = ({ contentId, contentType, creatorId, onClose }) => {
  const [reportReason, setReportReason] = useState(''); // Dropdown selection
  const [reportDetails, setReportDetails] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState(''); // Extra field based on content type
  const { userData } = useContext(AuthContext);

  const handleReport = async () => {
    if (!reportReason) {
      alert('Please select a reason for the report.');
      return;
    }
    try {
      const reportData = {
        reporterId: userData.userId,
        creatorId,
        contentId,
        contentType,
        reportReason,
        reportDetails,
        additionalInfo,
        timestamp: new Date().toISOString(),
      };
      console.log(reportData)
      await axios.post('/reports', reportData);

      // Reset form and close modal
      setReportReason('');
      setReportDetails('');
      setAdditionalInfo('');
      onClose();
      alert('Report submitted successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {contentType === 'gig' ? 'Report Gig' : 'Report Profile'}
        </h2>

        {/* Reason for Report */}
        <div className="mb-4">
          <label htmlFor="report-reason" className="block text-sm font-medium text-gray-700">
            Reason for Report
          </label>
          <select
            id="report-reason"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="" disabled>
              Select a reason
            </option>
            <option value="Spam">Spam</option>
            <option value="Harassment">Harassment</option>
            <option value="Fake Account">Fake Account</option>
            <option value="Inappropriate Content">Inappropriate Content</option>
            <option value="Copyright Infringement">Copyright Infringement</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Report Details */}
        <div className="mb-4">
          <label htmlFor="report-details" className="block text-sm font-medium text-gray-700">
            Description/Details
          </label>
          <textarea
            id="report-details"
            placeholder="Provide additional details about the issue..."
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows="4"
          />
        </div>

        {/* Additional Information Based on Content Type */}
        {contentType === 'gig' && (
          <div className="mb-4">
            <label htmlFor="additional-info" className="block text-sm font-medium text-gray-700">
              Additional Gig Details (Optional)
            </label>
            <textarea
              id="additional-info"
              placeholder="Provide more details about the gig issue..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows="3"
            />
          </div>
        )}
        {contentType === 'profile' && (
          <div className="mb-4">
            <label htmlFor="additional-info" className="block text-sm font-medium text-gray-700">
              Additional Profile Details (Optional)
            </label>
            <input
              id="additional-info"
              type="text"
              placeholder="E.g., fake account, impersonation"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleReport}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition focus:outline-none"
          >
            Submit Report
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportButton;
