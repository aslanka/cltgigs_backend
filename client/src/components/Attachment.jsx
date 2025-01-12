import React from 'react';

const Attachment = ({ fileUrl, className = '' }) => {
  if (!fileUrl) return null;

  return (
    <div className={`mt-2 space-y-1 ${className}`}>
      <img
        crossOrigin="anonymous"
        src={`http://localhost:4000${fileUrl}`}
        alt="Attachment"
        className="max-w-full h-auto rounded-lg"
      />
    </div>
  );
};

export default Attachment;