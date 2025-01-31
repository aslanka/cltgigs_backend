import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Globe, Edit, X, Plus, Github, Linkedin, Twitter, Youtube
} from 'lucide-react';

const socialIcons = {
    website: Globe,
    github: Github,
    linkedin: Linkedin,
    twitter: Twitter,
    youtube: Youtube
};

const SocialLinks = ({
    profile,
    isEditingLinks,
    setIsEditingLinks,
    userData,
    newLink,
    setNewLink,
    handleAddLink,
    handleDeleteLink,
    isSubmitting,
    error
}) => {
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (error) setValidationError(error);
        const timeout = setTimeout(() => setValidationError(''), 5000);
        return () => clearTimeout(timeout);
    }, [error]);

    const validateURL = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateURL(newLink.url)) {
            setValidationError('Please enter a valid URL');
            return;
        }
        handleAddLink();
    };

    return (
        <motion.div
            className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
            layout
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-blue-500" /> <span>Social Links</span>
                </h3>
                {userData?.userId === profile._id && !isEditingLinks && ( //Conditionally show edit button
                    <motion.button
                        onClick={() => setIsEditingLinks(true)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Edit className="w-4 h-4 text-gray-600" />
                    </motion.button>
                )}
            </div>

            <div className="space-y-3">
                {isEditingLinks ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-3">
                            <select
                                value={newLink.type}
                                onChange={(e) => setNewLink({ ...newLink, type: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {Object.keys(socialIcons).map((type) => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="url"
                                value={newLink.url}
                                onChange={(e) => {
                                    setNewLink({ ...newLink, url: e.target.value });
                                    setValidationError('');
                                }}
                                placeholder="https://example.com"
                                className="flex-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        {validationError && (
                            <p className="text-red-500 text-sm -mt-2">{validationError}</p>
                        )}

                        <div className="flex gap-2 justify-end">
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-all disabled:opacity-50"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </span>
                                ) : (
                                    'Add Link'
                                )}
                            </motion.button>
                            <motion.button
                                type="button"
                                onClick={() => setIsEditingLinks(false)}
                                className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Cancel
                            </motion.button>
                        </div>
                    </form>
                ) : (
                    profile.social_media_links?.map((link, index) => { // Corrected prop name
                        const Icon = socialIcons[link.type] || Globe;
                        return (
                            <motion.div
                                key={`${link.type}-${index}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-3 group"
                            >
                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-md transition-colors border border-gray-200"
                                >
                                    <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <span className="truncate text-gray-700 text-sm sm:text-base">{link.url}</span>
                                </a>
                                {userData?.userId === profile._id && (
                                    <motion.button
                                        onClick={() => handleDeleteLink(index)}
                                        className="opacity-0 group-hover:opacity-100 text-red-500 p-1 hover:bg-red-50 rounded-md transition-all"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <X className="w-4 h-4" />
                                    </motion.button>
                                )}
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
};

export default SocialLinks;