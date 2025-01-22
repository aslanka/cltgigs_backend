import React from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, X, Plus, Sparkles 
} from 'lucide-react';

const MAX_PORTFOLIO_ITEMS = 10;

const PortfolioSection = ({
  profile,
  userData,
  setIsUploadingPortfolio,
  handleDeletePortfolioItem
}) => (
  <motion.div 
    className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100/50 border border-gray-100/80 backdrop-blur-sm"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
  >
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-gray-900 bg-clip-text text-transparent">
          Portfolio
        </h2>
        {userData?.userId === profile._id && (
          <motion.button
            onClick={() => setIsUploadingPortfolio(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg shadow-blue-100/50"
            disabled={profile.portfolio?.length >= MAX_PORTFOLIO_ITEMS}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold text-sm tracking-tight">Add New</span>
          </motion.button>
        )}
      </div>

      {/* Portfolio Grid */}
      {profile.portfolio?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {profile.portfolio.map((item) => (
            <motion.div
              key={item}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative group aspect-square"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="relative w-full h-full overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                <img
                  crossOrigin="anonymous"
                  src={`${import.meta.env.VITE_SERVER}${item}`}
                  alt="Portfolio item"
                  className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  {userData?.userId === profile._id && (
                    <motion.button
                      onClick={() => handleDeletePortfolioItem(item)}
                      className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div 
          className="flex flex-col items-center justify-center p-8 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 hover:border-blue-500 transition-all duration-300 cursor-pointer"
          onClick={() => userData?.userId === profile._id && setIsUploadingPortfolio(true)}
        >
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Showcase your best work</h3>
          <p className="text-sm text-gray-500 text-center mb-4">Upload projects, case studies, or professional content</p>
          {userData?.userId === profile._id && (
            <motion.button
              onClick={() => setIsUploadingPortfolio(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 shadow-sm shadow-blue-100/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold text-sm">Upload First Project</span>
            </motion.button>
          )}
        </div>
      )}

      {/* Counter Badge */}
      {profile.portfolio?.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="text-sm text-gray-600 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200">
            Showing {profile.portfolio.length} of {MAX_PORTFOLIO_ITEMS} items
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

export default PortfolioSection;