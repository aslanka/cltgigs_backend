import React from 'react';
import { User } from 'lucide-react'; // Import the User icon

const ProfilePicture = ({ profilePicUrl, profile_pic_url, name, size = '10', className = '' }) => {
  // Ensure the size is a valid Tailwind class
  const sizeClass = `w-${size} h-${size}`;

  // Use profilePicUrl if available, otherwise fall back to profile_pic_url
  const imageUrl = profilePicUrl || profile_pic_url;

  console.log('ProfilePicture props:', { profilePicUrl, profile_pic_url, name, size, className }); // Debugging

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {imageUrl ? (
        <img
          crossOrigin="anonymous"
          src={`${import.meta.env.VITE_SERVER}${imageUrl}`}
          alt="Profile"
          className={`${sizeClass} rounded-full object-cover`}
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = ''; // Clear the src to show the fallback
            console.error('Failed to load profile picture:', imageUrl); // Debugging
          }}
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