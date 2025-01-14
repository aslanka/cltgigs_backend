import React from 'react';
import { User } from 'lucide-react'; // Import the User icon

const ProfilePicture = ({ profilePicUrl, name, size = '10', className = '' }) => {
  // Ensure the size is a valid Tailwind class
  const sizeClass = `w-${size} h-${size}`;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {profilePicUrl ? (
        <img
          crossOrigin="anonymous"
          src={`${import.meta.env.VITE_SERVER}${profilePicUrl}`}
          alt="Profile"
          className={`${sizeClass} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizeClass} rounded-full bg-gray-200 flex items-center justify-center`}
        >
          {/* Display a user icon if no name is provided */}
          {name ? (
            <span className="text-xl font-bold text-gray-700">
              {name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User className="text-gray-500 w-1/2 h-1/2" /> // User icon as fallback
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;