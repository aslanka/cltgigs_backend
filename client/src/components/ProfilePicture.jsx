// src/components/ProfilePicture.jsx
import React from "react";
import { User as UserIcon } from "lucide-react";

const ProfilePicture = ({ profilePicUrl, profile_pic_url, name, size = "10", className = "" }) => {
  const sizeClass = `w-${size} h-${size}`;
  const imageUrl = profilePicUrl || profile_pic_url;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {imageUrl ? (
        <img
          crossOrigin="anonymous"
          src={`${import.meta.env.VITE_SERVER}${imageUrl}`}
          alt="Profile"
          className={`${sizeClass} rounded-full object-cover`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "";
          }}
        />
      ) : (
        <div className={`${sizeClass} rounded-full bg-gray-200 flex items-center justify-center`}>
          {name ? (
            <span className="text-xl font-bold text-gray-700">
              {name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <UserIcon className="text-gray-500 w-1/2 h-1/2" />
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
