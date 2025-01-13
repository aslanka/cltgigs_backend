import React, { useState } from 'react';
import axios from 'axios'; // Assuming you have axios configured as shown in your setup
import { useAuth } from '../context/AuthContext'; // Assuming you have an AuthContext for user data

const ReportButton = ({ contentId, contentType, creatorId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportDetails, setReportDetails] = useState('');
  const { userData } = useAuth(); // Get the current user's data from AuthContext

  const handleReport = async () => {
    try {
      const reportData = {
        reporterId: userData.userId, // The person reporting
        creatorId, // The person who created the content
        contentId, // The ID of the content being reported
        contentType, // Type of content (e.g., 'message', 'gig', 'bid')
        reportDetails, // Additional details provided by the user
        timestamp: new Date().toISOString(), // Current time
      };

      // Send the report to the backend
      await axios.post('/reports', reportData);

      // Close the modal and reset the form
      setIsModalOpen(false);
      setReportDetails('');
      alert('Report submitted successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>Report</button>

      {isModalOpen && (
        <div style={modalStyles}>
          <h3>Report Content</h3>
          <textarea
            placeholder="Provide additional details..."
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            style={textAreaStyles}
          />
          <button onClick={handleReport}>Send Report</button>
          <button onClick={() => setIsModalOpen(false)}>Cancel</button>
        </div>
      )}
    </>
  );
};

// Inline styles for the modal (you can replace with CSS classes if preferred)
const modalStyles = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  zIndex: 1000,
};

const textAreaStyles = {
  width: '100%',
  height: '100px',
  marginBottom: '10px',
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

export default ReportButton;