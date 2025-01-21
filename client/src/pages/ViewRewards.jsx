import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, Zap, Gift, Trophy, Star, Gem, Coins, BadgeCheck, Shield } from 'lucide-react';
import Mascot from '../assets/mascot.svg';

// Skeleton Loading Component
const SkeletonCard = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-pulse p-4 rounded-2xl bg-white shadow-sm">
    <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
  </motion.div>
);

const RewardTier = ({ title, xpRequired, currentXP, rewards, icon, color }) => {
  const progress = Math.min((currentXP / xpRequired) * 100, 100);
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`p-6 rounded-2xl bg-gradient-to-br ${color} shadow-lg text-white mb-6`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {icon}
          <h3 className="text-2xl font-bold">{title}</h3>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-90">Progress</p>
          <div className="text-xl font-bold">{Math.floor(progress)}%</div>
        </div>
      </div>
      
      <div className="h-3 bg-white/20 rounded-full mb-4">
        <div 
          className="h-full bg-white rounded-full transition-all duration-500" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          <span>{currentXP} / {xpRequired} XP</span>
        </div>
        <div className="flex gap-2">
          {rewards.map((reward, index) => (
            <div key={index} className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-2">
              {reward.icon}
              <span className="text-sm">{reward.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const ViewRewards = () => {
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const rewardTiers = [
    {
      title: "Bronze Tier",
      xpRequired: 1000,
      color: "from-amber-600 to-amber-400",
      icon: <Shield className="w-8 h-8" />,
      rewards: [
        { icon: <Star className="w-4 h-4" />, label: "Basic Badges" },
        { icon: <Coins className="w-4 h-4" />, label: "100 Coins" }
      ]
    },
    {
      title: "Silver Tier",
      xpRequired: 2500,
      color: "from-gray-600 to-gray-400",
      icon: <Gem className="w-8 h-8" />,
      rewards: [
        { icon: <BadgeCheck className="w-4 h-4" />, label: "Verified Status" },
        { icon: <Coins className="w-4 h-4" />, label: "500 Coins" }
      ]
    },
    {
      title: "Gold Tier",
      xpRequired: 5000,
      color: "from-yellow-600 to-yellow-400",
      icon: <Trophy className="w-8 h-8" />,
      rewards: [
        { icon: <Rocket className="w-4 h-4" />, label: "Priority Listings" },
        { icon: <Coins className="w-4 h-4" />, label: "1500 Coins" }
      ]
    }
  ];

  const availableRewards = [
    {
      title: "Profile Badge Pack",
      cost: 500,
      icon: <BadgeCheck className="w-12 h-12 text-blue-600" />,
      description: "Unlock 3 exclusive profile badges to showcase your achievements"
    },
    {
      title: "Priority Listing Boost",
      cost: 1000,
      icon: <Rocket className="w-12 h-12 text-purple-600" />,
      description: "Get your gigs boosted to the top of search results for 1 week"
    },
    {
      title: "Custom Mascot Avatar",
      cost: 2000,
      icon: <Gift className="w-12 h-12 text-green-600" />,
      description: "Unlock exclusive mascot customization options for your profile"
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-6 md:space-y-0">
            <div className="flex items-center space-x-4">
              <img src={Mascot} alt="Mascot" className="h-16 w-16 animate-bounce" />
              <div>
                <h1 className="text-4xl font-bold">Rewards Center</h1>
                <p className="text-lg opacity-90">Earn XP • Unlock Rewards • Boost Your Profile</p>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Zap className="w-5 h-5" />
              <span>{user?.xp || 0} XP Available</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Progress Tiers */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-600" />
              Achievement Tiers
            </h2>
            
            <AnimatePresence>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => <SkeletonCard key={idx} />)
              ) : (
                rewardTiers.map((tier, index) => (
                  <RewardTier
                    key={index}
                    {...tier}
                    currentXP={user?.xp || 0}
                  />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Available Rewards */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Gift className="w-6 h-6 text-green-600" />
              Redeemable Rewards
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, idx) => <SkeletonCard key={idx} />)
                ) : (
                  availableRewards.map((reward, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gray-100 p-3 rounded-xl">
                          {reward.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{reward.title}</h3>
                          <p className="text-gray-600 mb-4">{reward.description}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Zap className="w-5 h-5 text-yellow-500" />
                              <span className="font-bold">{reward.cost} XP</span>
                            </div>
                            <button 
                              disabled={(user?.xp || 0) < reward.cost}
                              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-500 hover:bg-blue-700 transition-colors"
                            >
                              Redeem Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewRewards;