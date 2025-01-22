import React from 'react';
import { motion } from 'framer-motion';
import { MAX_BIO_LENGTH } from './constants';

const BioSection = ({ profile, isEditing, setProfile }) => (
  <motion.div className="bg-white rounded-2xl p-6 shadow-xl" layout>
    <h2 className="text-2xl font-bold mb-4">About</h2>
    {isEditing ? (
      <div className="space-y-4">
        <textarea
          value={profile.bio}
          onChange={(e) => setProfile({...profile, bio: e.target.value})}
          className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
        {profile.bio || 'No bio provided'}
      </p>
    )}
  </motion.div>
);

export default BioSection;