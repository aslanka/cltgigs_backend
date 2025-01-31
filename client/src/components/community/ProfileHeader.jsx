import React from 'react';
import { motion } from 'framer-motion';
import SkillBadge from '../SkillBadge';
import {
    Star, Edit, Globe, Briefcase, CheckCircle,
    MessageCircle, X, Plus, Sparkles, Github,
    Linkedin, Twitter, Youtube
} from 'lucide-react';

const ProfileHeader = ({ profile, isEditing, isSubmitting, setIsEditing, setProfile, userData }) => (
    <motion.div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100" layout>
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">{profile.name}</h2>
                {userData?.userId === profile._id && !isEditing && ( // Only show edit if not already editing
                    <motion.button
                        onClick={() => setIsEditing(true)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Edit className="w-4 h-4 text-gray-600" />
                    </motion.button>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
                <SkillBadge
                    icon={<Briefcase className="w-4 h-4" />}
                    label={`${profile.experience}+ years exp`}
                />
                <SkillBadge
                    icon={<CheckCircle className="w-4 h-4 text-green-500" />}
                    label={`${profile.completedGigs || 0} jobs done`}
                    className="bg-green-50"
                />
                <SkillBadge
                    icon={<Sparkles className="w-4 h-4 text-purple-500" />}
                    label={`Level ${Math.floor(profile.xp / 1000)}`}
                    className="bg-purple-50"
                />
            </div>

            <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3 text-gray-600">
                    <Globe className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{profile.location || 'Remote'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                    <Briefcase className="w-5 h-5 flex-shrink-0" />
                    {isEditing ? (
                        <input
                            type="number"
                            value={profile.experience}
                            onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            min="0"
                        />
                    ) : (
                        <span>{profile.experience} years experience</span>
                    )}
                </div>
            </div>
            {isEditing && (
                <div className="flex justify-end mt-4">
                    <motion.button
                        onClick={() => handleSaveProfile()}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </motion.button>
                    <motion.button
                        onClick={() => setIsEditing(false)}
                        className="ml-2 px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Cancel
                    </motion.button>
                </div>
            )}
        </div>
    </motion.div>
);

export default ProfileHeader;