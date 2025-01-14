// components/CategoryBadge.jsx
import React from 'react';
import * as LucideIcons from 'lucide-react'; // Import all lucide-react icons

const CategoryBadge = ({ category, color, icon }) => {
  const IconComponent = LucideIcons[icon] || LucideIcons['Tag']; // Default to 'Tag' icon if not found

  return (
    <span className={`flex items-center px-2 py-1 text-xs font-semibold rounded ${color} text-white`}>
      <IconComponent className="h-3 w-3 mr-1" />
      {category}
    </span>
  );
};

export default CategoryBadge;
