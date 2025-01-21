import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { Trophy, Award, Zap, Clock, Flame, Star, Gem, Crown } from 'lucide-react';
import Mascot from '../assets/mascot.svg';

// Skeleton Loading Component
const SkeletonRow = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-pulse p-4 rounded-xl bg-white shadow-sm flex items-center">
    <div className="h-8 w-8 bg-gray-200 rounded-full mr-4"></div>
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-16"></div>
  </motion.div>
);

const getRankBadge = (rank) => {
  if (rank === 1) return { icon: <Crown className="w-6 h-6 text-yellow-500" />, bg: 'from-yellow-400 to-yellow-100' };
  if (rank === 2) return { icon: <Gem className="w-6 h-6 text-gray-400" />, bg: 'from-gray-300 to-gray-100' };
  if (rank === 3) return { icon: <Zap className="w-6 h-6 text-orange-500" />, bg: 'from-orange-400 to-orange-100' };
  return { icon: null, bg: 'bg-white' };
};

const TimeframeToggle = ({ timeframe, setTimeframe }) => {
  const options = [
    { value: 'weekly', label: 'Weekly', icon: <Flame className="w-4 h-4" /> },
    { value: 'monthly', label: 'Monthly', icon: <Star className="w-4 h-4" /> },
    { value: 'alltime', label: 'All-Time', icon: <Trophy className="w-4 h-4" /> },
  ];

  return (
    <div className="flex gap-2 bg-white p-2 rounded-xl shadow-sm">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTimeframe(opt.value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeframe === opt.value 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {opt.icon}
          <span className="font-medium">{opt.label}</span>
        </button>
      ))}
    </div>
  );
};

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [timeframe, setTimeframe] = useState('weekly');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`/leaderboard?timeframe=${timeframe}`);
        setLeaderboardData(res.data);
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
    };
    fetchLeaderboard();
  }, [timeframe]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-6 md:space-y-0">
            <div className="flex items-center space-x-4">
              <img src={Mascot} alt="Mascot" className="h-16 w-16 animate-bounce" />
              <div>
                <h1 className="text-4xl font-bold">Leaderboard</h1>
                <p className="text-lg opacity-90">Climb the ranks • Earn XP • Claim your rewards</p>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/rewards')}
              className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Award className="w-5 h-5" />
              <span>View Rewards</span>
            </motion.button>
          </div>

          {/* Current User Status */}
          {user && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl mt-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Your Position</h3>
                    <p className="opacity-90">{user.xp} XP</p>
                  </div>
                </div>
                <div className="text-right">
  <p className="text-sm opacity-75">Current Rank</p>
  <div className="text-2xl font-bold flex items-center gap-2">
    <Clock className="w-5 h-5" />
    #{user?.rank || '--'}
  </div>
</div>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <TimeframeToggle timeframe={timeframe} setTimeframe={setTimeframe} />
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, idx) => <SkeletonRow key={idx} />)
            ) : (
              leaderboardData.map((user, index) => {
                const rank = index + 1;
                const { icon, bg } = getRankBadge(rank);
                
                return (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    layout
                    className={`p-4 rounded-xl shadow-sm hover:shadow-md transition-all ${bg} bg-gradient-to-r`}
                  >
                    <div className="flex items-center">
                      <div className="w-12 text-center mr-4">
                        {icon ? (
                          <div className="relative">
                            {icon}
                            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-bold">
                              {rank}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-gray-600">#{rank}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center flex-1">
                        <img 
                          src={user.profile_pic_url || '/default-avatar.png'} 
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover mr-4"
                        />
                        <div>
                          <h3 className="font-bold text-lg">{user.name}</h3>
                          <p className="text-sm text-gray-600">
  {(user.badges || []).join(' • ')}
</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full">
  <Zap className="w-5 h-5 text-yellow-500" />
  <span className="font-bold">{user.xp || 0} XP</span>
</div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;