import React from 'react';

const Attachment = ({ fileUrl, className = '' }) => {
  if (!fileUrl) return null;

  const serverUrl = import.meta.env.VITE_SERVER;

  return (
    <div className={`mt-2 space-y-1 ${className}`}>
      <img
        crossOrigin="anonymous"
        src={`${serverUrl}${fileUrl}`}
        alt="Attachment"
        className="max-w-full h-auto rounded-lg"
      />
    </div>
  );
};

export default Attachment;
