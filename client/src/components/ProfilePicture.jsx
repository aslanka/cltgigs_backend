import React from 'react';

const ProfilePicture = ({ profilePicUrl, name, size = '10', className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {profilePicUrl ? (
        <img
          crossOrigin="anonymous"
          src={`${import.meta.env.VITE_SERVER}${profilePicUrl}`}
          alt="Profile"
          className={`w-${size} h-${size} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`w-${size} h-${size} rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-700`}
        >
          {name ? name.charAt(0).toUpperCase() : '?'}
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;