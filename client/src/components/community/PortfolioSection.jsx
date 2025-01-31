import React from 'react';
import { motion } from 'framer-motion';
import {
    Briefcase, X, Plus, Sparkles
} from 'lucide-react';

const MAX_PORTFOLIO_ITEMS = 12; // Increased to 12

const PortfolioSection = ({
    profile,
    userData,
    setIsUploadingPortfolio,
    handleDeletePortfolioItem
}) => (
    <motion.div
        className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
        <div className="flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-teal-500" /> <span>Portfolio</span>
                </h2>
                {userData?.userId === profile._id && (
                    <motion.button
                        onClick={() => setIsUploadingPortfolio(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                        disabled={profile.portfolio?.length >= MAX_PORTFOLIO_ITEMS}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="font-medium text-sm tracking-tight">Add Item</span>
                    </motion.button>
                )}
            </div>

            {/* Portfolio Grid */}
            {profile.portfolio?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profile.portfolio.map((item) => (
                        <motion.div
                            key={item}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative group aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <img
                                crossOrigin="anonymous"
                                src={`${import.meta.env.VITE_SERVER}${item}`}
                                alt="Portfolio item"
                                className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                            />

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-3">
                                {userData?.userId === profile._id && (
                                    <motion.button
                                        onClick={() => handleDeletePortfolioItem(item)}
                                        className="bg-white bg-opacity-70 hover:bg-opacity-90 p-2 rounded-full shadow-sm hover:shadow-md transition-colors"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <X className="w-4 h-4 text-red-600" />
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div
                    className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-500 transition-all duration-300 cursor-pointer bg-gray-50"
                    onClick={() => userData?.userId === profile._id && setIsUploadingPortfolio(true)}
                >
                    <div className="mb-4 p-4 bg-blue-500 text-white rounded-full shadow-md">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Showcase your work</h3>
                    <p className="text-sm text-gray-500 text-center mb-4">Upload projects, case studies, or examples of your skills.</p>
                    {userData?.userId === profile._id && (
                        <motion.button
                            onClick={() => setIsUploadingPortfolio(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Plus className="w-4 h-4" />
                            <span className="font-medium text-sm">Upload First Item</span>
                        </motion.button>
                    )}
                </div>
            )}

            {/* Counter Badge - Optional, can remove if not needed */}
            {profile.portfolio?.length > 0 && (
                <div className="flex justify-center mt-4">
                    <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                        {profile.portfolio.length} of {MAX_PORTFOLIO_ITEMS} items shown
                    </div>
                </div>
            )}
        </div>
    </motion.div>
);

export default PortfolioSection;