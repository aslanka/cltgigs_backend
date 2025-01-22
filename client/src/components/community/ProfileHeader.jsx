import React from 'react';
import { motion } from 'framer-motion';
import ProfilePicture from '../ProfilePicture';
import SkillBadge from '../SkillBadge';
import { 
    Star, Edit, Globe, Briefcase, CheckCircle, 
    MessageCircle, X, Plus, Sparkles, Github, 
    Linkedin, Twitter, Youtube 
  } from 'lucide-react';

const ProfileHeader = ({ profile, isEditing, setIsEditing, setProfile, userData }) => (
  <motion.div className="bg-white rounded-2xl p-6 shadow-xl" layout>
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
        {userData?.userId === profile._id && (
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <SkillBadge
          icon={<Briefcase className="w-4 h-4" />}
          label={`${profile.experience}+ years`}
        />
        <SkillBadge
          icon={<CheckCircle className="w-4 h-4 text-green-500" />}
          label={`${profile.completedGigs || 0} accepted`}
          className="bg-green-50"
        />
        <SkillBadge
          icon={<Sparkles className="w-4 h-4 text-purple-500" />}
          label={`Level ${Math.floor(profile.xp / 1000)}`}
          className="bg-purple-50"
        />
      </div>

      <div className="space-y-3">
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
              onChange={(e) => setProfile({...profile, experience: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              min="0"
            />
          ) : (
            <span>{profile.experience} years experience</span>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

export default ProfileHeader;