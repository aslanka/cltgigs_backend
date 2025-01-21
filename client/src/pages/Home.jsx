import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { Search, MapPin, Flag, Filter, ClipboardList, ChevronLeft, ChevronRight, Tag, Users, Calendar, DollarSign, Heart, Star, Award, Rocket } from 'lucide-react';
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

// Category Details with Gradients
const getCategoryDetails = (category) => {
  const styles = {
    'Music': { emoji: '🎵', gradient: 'from-purple-100 to-purple-50' },
    'Carpentry': { emoji: '🪚', gradient: 'from-amber-100 to-amber-50' },
    'House Work': { emoji: '🏠', gradient: 'from-blue-100 to-blue-50' },
    'Cleaning': { emoji: '🧹', gradient: 'from-emerald-100 to-emerald-50' },
    'Photography': { emoji: '📸', gradient: 'from-pink-100 to-pink-50' },
    'Plumbing': { emoji: '🚰', gradient: 'from-cyan-100 to-cyan-50' },
    'Electrician': { emoji: '🔌', gradient: 'from-yellow-100 to-yellow-50' },
    'default': { emoji: '💼', gradient: 'from-gray-100 to-gray-50' }
  };
  return styles[category] || styles['default'];
};

const Home = () => {
  const [gigs, setGigs] = useState([]);
  const [totalGigs, setTotalGigs] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [zipCode, setZipCode] = useState('');
  const [distance, setDistance] = useState('100');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [tags, setTags] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [page, setPage] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const limit = 10;
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const categories = [
    'All', 'Music', 'Carpentry', 'House Work', 'Cleaning',
    'Photography', 'Plumbing', 'Electrician'
  ];

  useEffect(() => {
    fetchGigs();
  }, [searchTerm, category, sortBy, page, zipCode, distance, minBudget, maxBudget, isVolunteer, tags]);

  const fetchGigs = async () => {
    setIsLoading(true);
    try {
      const params = {
        searchTerm,
        category,
        sortBy,
        page,
        limit,
        zipCode,
        distance,
        minBudget,
        maxBudget,
        isVolunteer,
        tags,
      };
      const res = await axios.get('/gigs', { params });

      setGigs(res.data?.gigs || []);
      setTotalGigs(res.data?.total || 0);
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleZipSearch = () => {
    setPage(1);
    fetchGigs();
  };

  const handleCreateGig = () => {
    if (!token) {
      alert('You must be logged in to create a gig.');
      navigate('/login');
      return;
    }
    navigate('/create-gig');
  };

  const totalPages = Math.ceil(totalGigs / limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-6 md:space-y-0">
            <div className="flex items-center space-x-4">
              <img src={Mascot} alt="Mascot" className="h-16 w-16 animate-bounce" />
              <div>
                <h1 className="text-4xl font-bold">CharlotteGigs</h1>
                <p className="text-lg opacity-90">Find your next opportunity • Earn rewards • Make connections</p>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              onClick={handleCreateGig}
              className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Rocket className="w-5 h-5" />
              <span>Post a Gig</span>
            </motion.button>
          </div>

          {/* Search Section */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-white/80" />
                <input
                  type="text"
                  placeholder="Search gigs, skills, categories..."
                  className="w-full pl-12 pr-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-4 h-5 w-5 text-white/80" />
                  <input
                    type="text"
                    placeholder="Zip code"
                    className="w-full pl-12 pr-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
                <select
                  className="bg-white/10 rounded-xl border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                >
                  <option value="10">10mi</option>
                  <option value="25">25mi</option>
                  <option value="50">50mi</option>
                  <option value="100">100mi</option>
                </select>
              </div>

              <button
                onClick={handleZipSearch}
                className="w-full bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
              >
                <Search className="w-5 h-5" />
                <span>Find Gigs</span>
              </button>
            </div>

            {/* Advanced Filters */}
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between text-sm cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
                <span className="font-medium">Advanced Filters</span>
                <ChevronRight className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
              </div>
              
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                      <input
                        type="number"
                        placeholder="Min Budget"
                        className="w-full sm:w-1/2 px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white"
                        value={minBudget}
                        onChange={(e) => setMinBudget(e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Max Budget"
                        className="w-full sm:w-1/2 px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white"
                        value={maxBudget}
                        onChange={(e) => setMaxBudget(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isVolunteer"
                        checked={isVolunteer}
                        onChange={(e) => setIsVolunteer(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="isVolunteer" className="text-sm">
                        Volunteer Gigs Only
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="Tags (comma-separated)"
                      className="w-full px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Gamification Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Award className="w-6 h-6" />
            <span className="font-medium">Earn 500 XP for your first gig completion!</span>
          </div>
          <button className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition">
            <span>View Rewards</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div className="flex items-center space-x-4 bg-white p-3 rounded-xl shadow-sm">
            <Filter className="h-6 w-6 text-blue-600" />
            <select
              className="bg-transparent text-lg font-medium focus:outline-none"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <option value="date_desc">🔥 Newest First</option>
              <option value="date_asc">⏳ Oldest First</option>
              <option value="price_asc">💸 Low to High</option>
              <option value="price_desc">💰 High to Low</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
              {/* Leaderboard Link */}
<Link 
  to="/leaderboard" 
  className="bg-white p-3 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
>
  <span className="text-lg font-medium hover:text-blue-600">👑 Top Gigster This Week:</span>
  <span className="ml-2 text-blue-600 hover:text-blue-700">SarahM (2450 XP)</span>
</Link>
          </div>
        </div>

{/* Gig Cards Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <AnimatePresence>
    {isLoading ? (
      Array.from({ length: limit }).map((_, idx) => <SkeletonCard key={idx} />)
    ) : (
      gigs.map((gig) => {
        const { emoji, gradient } = getCategoryDetails(gig.category);
        const daysAgo = Math.floor((new Date() - new Date(gig.created_at)) / (1000 * 60 * 60 * 24));
        const taskCount = gig.gig_tasks?.length || 0;
        const progress = Math.min(gig.bids || 0, 10) * 10;

        return (
          <motion.div
            key={gig._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            layout
          >
            <Link
              to={`/gigs/${gig._id}`}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col relative"
            >
              {/* Report Button */}
              <button 
                className="absolute top-3 right-3 z-10 text-gray-400 hover:text-red-500 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Handle report logic here
                }}
              >
                <Flag className="w-5 h-5" />
              </button>

              {/* Image/Category Section */}
              <div className={`relative bg-gradient-to-br ${gradient} h-48 flex items-center justify-center`}>
                {gig.attachment ? (
                  <img
                    crossOrigin='anonymous'
                    src={`${import.meta.env.VITE_SERVER}/${gig.attachment.file_url}`}
                    alt={gig.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-7xl transform transition group-hover:scale-110">{emoji}</span>
                )}
                <div className="absolute top-3 left-3 flex space-x-2">
                  {gig.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white/90 text-xs font-medium rounded-full backdrop-blur-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{gig.title}</h3>
                  <div className="flex items-center space-x-1">
                    {gig.user_rating > 0 && (
                      <>
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{gig.user_rating.toFixed(1)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Subtasks */}
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <ClipboardList className="w-4 h-4" />
                  <span>{taskCount} subtasks</span>
                </div>

                <p className="text-gray-600 mb-3 line-clamp-2 flex-1">{gig.description}</p>

                {/* Progress Bar */}
<div className="mb-3">
  <div className="h-2 bg-gray-200 rounded-full">
    <div 
      className="h-2 bg-blue-500 rounded-full transition-all"
      style={{ width: `${Math.min(gig.bidCount || 0, 10) * 10}%` }}
    />
  </div>
  <div className="text-sm text-gray-500 mt-1">
    {gig.bidCount || 0}/10 bids
  </div>
</div>

                {/* Days Ago and Bids */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{gig.bidCount || 0} bids</span>
                  </div>
                </div>

                {/* Gig Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{gig.zipcode}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {gig.is_volunteer ? (
                      <Heart className="w-4 h-4 text-red-500" />
                    ) : (
                      <DollarSign className="w-4 h-4 text-green-500" />
                    )}
                    <span className={gig.is_volunteer ? 'text-red-600' : 'text-green-600'}>
                      {gig.is_volunteer ? 'Volunteer Opportunity' : `$${gig.budget_range_min}-$${gig.budget_range_max}`}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })
    )}
  </AnimatePresence>
</div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-4 mt-12">
          <motion.button
            whileHover={{ scale: 1.1 }}
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="flex items-center space-x-2 px-6 py-2 bg-white rounded-xl shadow-sm hover:shadow-md disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Previous</span>
          </motion.button>
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-lg ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'} hover:bg-blue-100`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="flex items-center space-x-2 px-6 py-2 bg-white rounded-xl shadow-sm hover:shadow-md disabled:opacity-50"
          >
            <span className="font-medium">Next</span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Floating CTA */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateGig}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-xl flex items-center space-x-2 z-50"
        >
          <Rocket className="w-6 h-6" />
          <span className="font-bold">Post a Gig</span>
        </motion.button>
      </main>
    </div>
  );
};

export default Home;