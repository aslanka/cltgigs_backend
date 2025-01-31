import React from 'react';
import { motion } from 'framer-motion';
import { MAX_BIO_LENGTH } from './constants';
import {
  Star, Edit, Globe, Briefcase, CheckCircle,
  MessageCircle, X, Plus, Sparkles, Github,
  Linkedin, Twitter, Youtube, PhoneCall, Mail
} from 'lucide-react';

const BioSection = ({ profile, isEditing, setProfile }) => (
    <motion.div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100" layout>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-purple-500" /> <span>About Me</span>
        </h2>
        {isEditing ? (
            <div className="space-y-4">
                <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    placeholder="Tell us about yourself..."
                    maxLength={MAX_BIO_LENGTH}
                />
                <div className="text-sm text-gray-500 text-right">
                    {profile.bio?.length || 0}/{MAX_BIO_LENGTH}
                </div>
            </div>
        ) : (
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {profile.bio || 'No bio provided.'}
            </p>
        )}
        {isEditing && (
            <div className="flex justify-end mt-4">
                <button onClick={() => setProfile({ ...profile, bio: profile.bio })} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Save Bio</button>
                <button onClick={() => isEditing && setProfile({ ...profile, bio: profile.bio })} className="ml-2 px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100">Cancel</button>
            </div>
        )}
    </motion.div>
);

export default BioSection;