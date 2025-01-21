import { motion } from 'framer-motion';

const SkillBadge = ({ icon, label, className = '' }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-all ${className}`}
    >
      <span className="text-blue-600">{icon}</span>
      {label}
    </motion.div>
  );
};

export default SkillBadge;