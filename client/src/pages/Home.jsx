import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { Search, MapPin, Flag, Filter, ClipboardList, ChevronLeft, ChevronRight, Tag, Users, Calendar, DollarSign, Heart, Star, Award, Rocket } from 'lucide-react';
import Mascot from '../assets/mascot.svg';
import { Helmet } from 'react-helmet';
import ReportButton from '../components/ReportButton'

// Optimized Skeleton Loading Component with aria labels
const SkeletonCard = React.memo(() => (
  <motion.div 
    role="status"
    aria-label="Loading gig..."
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="animate-pulse p-4 rounded-2xl bg-white shadow-sm"
  >
    <div className="h-48 bg-gray-200 rounded-xl mb-4" aria-hidden="true"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" aria-hidden="true"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6 mb-3" aria-hidden="true"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3" aria-hidden="true"></div>
    <span className="sr-only">Loading content...</span>
  </motion.div>
));

// Memoized category details
const categoryDetails = {
  'Music': { emoji: '🎵', gradient: 'from-purple-100 to-purple-50' },
  'Carpentry': { emoji: '🪚', gradient: 'from-amber-100 to-amber-50' },
  'House Work': { emoji: '🏠', gradient: 'from-blue-100 to-blue-50' },
  'Cleaning': { emoji: '🧹', gradient: 'from-emerald-100 to-emerald-50' },
  'Photography': { emoji: '📸', gradient: 'from-pink-100 to-pink-50' },
  'Plumbing': { emoji: '🚰', gradient: 'from-cyan-100 to-cyan-50' },
  'Electrician': { emoji: '🔌', gradient: 'from-yellow-100 to-yellow-50' },
  'default': { emoji: '💼', gradient: 'from-gray-100 to-gray-50' }
};

const getCategoryDetails = (category) => 
  categoryDetails[category] || categoryDetails.default;

const Home = () => {
  const [state, setState] = useState({
    gigs: [],
    totalGigs: 0,
    searchTerm: '',
    category: 'All',
    zipCode: '',
    distance: '100',
    minBudget: '',
    maxBudget: '',
    isVolunteer: false,
    serviceOffered: false,
    tags: '',
    sortBy: 'date_desc',
    page: 1,
    showAdvanced: false,
    isLoading: false
  });

  const limit = 10;
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedContent, setSelectedContent] = useState(null);

  const categories = useMemo(() => [
    'All', 'Music', 'Carpentry', 'House Work', 'Cleaning',
    'Photography', 'Plumbing', 'Electrician'
  ], []);

  const openReportModal = (gig) => {
    setSelectedContent({
      contentId: gig._id,
      contentType: "gig",
      creatorId: gig.user_id,
    });
  };

  const closeReportModal = () => {
    setSelectedContent(null);
  };

  // Memoized fetch function
  const fetchGigs = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const params = {
        searchTerm: state.searchTerm,
        category: state.category,
        sortBy: state.sortBy,
        page: state.page,
        limit,
        // Only include filter parameters when they have values
        ...(state.zipCode && { zipCode: state.zipCode }),
        ...(state.distance && { distance: state.distance }),
        ...(state.minBudget !== '' && { minBudget: state.minBudget }),
        ...(state.maxBudget !== '' && { maxBudget: state.maxBudget }),
        ...(state.isVolunteer && { isVolunteer: true }),
        // Only include serviceOffered when explicitly checked
        ...(state.serviceOffered && { serviceOffered: true }),
        ...(state.tags && { tags: state.tags }),
      };
  
      const res = await axios.get('/gigs', { 
        params,
        headers: { 'Cache-Control': 'max-age=300' }
      });
  
      setState(prev => ({
        ...prev,
        gigs: res.data?.gigs || [],
        totalGigs: res.data?.total || 0,
        isLoading: false
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state, limit]);

  useEffect(() => {
    const debounceTimer = setTimeout(fetchGigs, 300);
    return () => clearTimeout(debounceTimer);
  }, [
    state.searchTerm, 
    state.category, 
    state.sortBy, 
    state.page, 
    state.zipCode, 
    state.distance, 
    state.minBudget, 
    state.maxBudget, 
    state.isVolunteer, 
    state.serviceOffered,
    state.tags
  ]);

  const handleCreateGig = useCallback(() => {
    if (!token) {
      alert('You must be logged in to create a gig.');
      navigate('/login');
      return;
    }
    navigate('/create-gig');
  }, [token, navigate]);

  const totalPages = Math.ceil(state.totalGigs / limit);

  // SEO Metadata
  const seoTitle = "CharlotteGigs | Find Local Opportunities & Services";
  const seoDescription = "Discover local gigs, services, and opportunities in Charlotte. Post your own gig and connect with skilled professionals in your community.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Header with ARIA landmarks */}
      <header 
        role="banner"
        className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-6 md:space-y-0">
            <div className="flex items-center space-x-4">
              <img 
                src={Mascot} 
                alt="CharlotteGigs Mascot" 
                className="h-16 w-16 animate-bounce"
                role="img"
                aria-label="Website mascot" 
              />
              <div>
                <h1 className="text-4xl font-bold">CharlotteGigs</h1>
                <p className="text-lg opacity-90">
                  Find your next opportunity • Earn rewards • Make connections
                </p>
              </div>
            </div>
            <motion.button 
              aria-label="Post a new gig"
              role="button"
              whileHover={{ scale: 1.05 }}
              onClick={handleCreateGig}
              className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Rocket className="w-5 h-5" />
              <span>Post a Gig</span>
            </motion.button>
          </div>

          {/* Search Section */}
          <SearchSection 
            state={state}
            setState={setState}
            handleCreateGig={handleCreateGig}
            fetchGigs={fetchGigs}
          />
        </div>
      </header>

      {/* Gamification Banner */}
      <GamificationBanner />

      {/* Main Content */}
      <main role="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FiltersAndLeaderboard 
          state={state}
          setState={setState}
        />

        {/* Gig Cards Grid */}
        <div 
          role="region" 
          aria-label="Gig listings"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {state.isLoading ? (
              Array.from({ length: limit }).map((_, idx) => (
                <SkeletonCard key={idx} />
              ))
            ) : (
              state.gigs.map((gig) => (
                <GigCard 
                  key={gig._id}
                  gig={gig}
                  handleCreateGig={handleCreateGig}
                  openReportModal={openReportModal} // Add this prop
                />
              ))
            )}
          </AnimatePresence>
        </div>

        <Pagination 
          state={state}
          setState={setState}
          totalPages={totalPages}
        />

        {/* Floating CTA */}
        <motion.button
          aria-label="Post a new gig"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateGig}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-xl flex items-center space-x-2 z-50"
        >
          <Rocket className="w-6 h-6" />
          <span className="font-bold">Post a Gig</span>
        </motion.button>
      </main>
      {selectedContent && (
  <ReportButton
    contentId={selectedContent.contentId}
    contentType={selectedContent.contentType}
    creatorId={selectedContent.creatorId}
    onClose={closeReportModal}
  />
)}
    </div>
  );
};

// Extracted Search Section Component
const SearchSection = ({ state, setState, fetchGigs }) => (
  <motion.div 
    role="search"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
  >
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="relative">
        <label htmlFor="searchInput" className="sr-only">Search gigs</label>
        <Search className="absolute left-4 top-4 h-5 w-5 text-white/80" />
        <input
          id="searchInput"
          type="text"
          placeholder="Search gigs, skills, categories..."
          className="w-full pl-12 pr-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white"
          value={state.searchTerm}
          onChange={(e) => setState(prev => ({
            ...prev,
            searchTerm: e.target.value,
            page: 1
          }))}
          aria-label="Search gigs"
        />
      </div>
      
      <div className="flex gap-4">
        <div className="relative flex-1">
          <label htmlFor="zipCode" className="sr-only">Zip code</label>
          <MapPin className="absolute left-4 top-4 h-5 w-5 text-white/80" />
          <input
            id="zipCode"
            type="text"
            placeholder="Zip code"
            className="w-full pl-12 pr-4 py-3 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white"
            value={state.zipCode}
            onChange={(e) => setState(prev => ({ ...prev, zipCode: e.target.value }))}
            aria-label="Enter zip code"
          />
        </div>
        <label htmlFor="distance" className="sr-only">Select distance</label>
        <select
          id="distance"
          className="bg-white/10 rounded-xl border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white"
          value={state.distance}
          onChange={(e) => setState(prev => ({ ...prev, distance: e.target.value }))}
          aria-label="Select search distance"
        >
          <option value="10">10mi</option>
          <option value="25">25mi</option>
          <option value="50">50mi</option>
          <option value="100">100mi</option>
        </select>
      </div>

      <button
        onClick={fetchGigs}
        className="w-full bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
        aria-label="Search for gigs"
      >
        <Search className="w-5 h-5" />
        <span>Find Gigs</span>
      </button>
    </div>

    <AdvancedFilters 
      state={state}
      setState={setState}
    />
  </motion.div>
);

// Extracted Advanced Filters Component
const AdvancedFilters = ({ state, setState }) => (
  <div className="mt-4 space-y-4">
    <button
      className="w-full flex items-center justify-between text-sm cursor-pointer"
      onClick={() => setState(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }))}
      aria-expanded={state.showAdvanced}
      aria-controls="advanced-filters"
    >
      <span className="font-medium">Advanced Filters</span>
      <ChevronRight className={`transition-transform ${state.showAdvanced ? 'rotate-90' : ''}`} />
    </button>
    
    <AnimatePresence>
      {state.showAdvanced && (
        <motion.div
          id="advanced-filters"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 overflow-hidden"
          role="region"
          aria-label="Advanced filters"
        >
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
    <input
      type="number"
      placeholder="Min Budget"
      className="w-full sm:w-1/2 px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white"
      value={state.minBudget || ''}
      onChange={(e) => setState(prev => ({ 
        ...prev, 
        minBudget: e.target.value === '' ? '' : Number(e.target.value) 
      }))}
      aria-label="Minimum budget"
    />
    <input
      type="number"
      placeholder="Max Budget"
      className="w-full sm:w-1/2 px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white"
      value={state.maxBudget || ''}
      onChange={(e) => setState(prev => ({ 
        ...prev, 
        maxBudget: e.target.value === '' ? '' : Number(e.target.value) 
      }))}
      aria-label="Maximum budget"
    />
  </div>
          <div className="flex items-center space-x-2">
  <input
    type="checkbox"
    id="serviceOffered"
    checked={state.serviceOffered}
    onChange={(e) => setState(prev => ({ 
      ...prev, 
      serviceOffered: e.target.checked 
    }))}
    className="w-4 h-4 rounded border-white/20 text-blue-600 focus:ring-blue-500"
    aria-label="Service offered only"
  />
  <label htmlFor="serviceOffered" className="text-sm">
    Services Offered Only
  </label>
</div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isVolunteer"
              checked={state.isVolunteer}
              onChange={(e) => setState(prev => ({ ...prev, isVolunteer: e.target.checked }))}
              className="w-4 h-4 rounded border-white/20 text-blue-600 focus:ring-blue-500"
              aria-label="Volunteer gigs only"
            />
            <label htmlFor="isVolunteer" className="text-sm">
              Volunteer Gigs Only
            </label>
          </div>
          <input
            type="text"
            placeholder="Tags (comma-separated)"
            className="w-full px-4 py-2 bg-white/10 rounded-xl border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white"
            value={state.tags}
            onChange={(e) => setState(prev => ({ ...prev, tags: e.target.value }))}
            aria-label="Filter by tags"
          />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
  
);

// Extracted Gamification Banner Component
const GamificationBanner = () => (
  <div 
    role="region" 
    aria-label="Gamification status"
    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Award className="w-6 h-6" aria-hidden="true" />
        <span className="font-medium">Earn 500 XP for your first gig completion!</span>
      </div>
      <Link
  to="/rewards"
  className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition"
  aria-label="View rewards"
>
  <span>View Rewards</span>
  <ChevronRight className="w-4 h-4" aria-hidden="true" />
</Link>
    </div>
  </div>
);

// Extracted Filters and Leaderboard Component
const FiltersAndLeaderboard = ({ state, setState }) => (
  <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
    <div className="flex items-center space-x-4 bg-white p-3 rounded-xl shadow-sm">
      <Filter className="h-6 w-6 text-blue-600" aria-hidden="true" />
      <select
  className="bg-white text-gray-900 text-lg font-medium focus:outline-none rounded-lg px-2 py-1"
  value={state.sortBy}
  onChange={(e) => setState(prev => ({
    ...prev,
    sortBy: e.target.value,
    page: 1
  }))}
  aria-label="Sort gigs by"
>
        <option value="date_desc">🔥 Newest First</option>
        <option value="date_asc">⏳ Oldest First</option>
        <option value="price_asc">💸 Low to High</option>
        <option value="price_desc">💰 High to Low</option>
      </select>
    </div>

    <Link 
      to="/leaderboard" 
      className="bg-white p-3 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
      aria-label="View leaderboard"
    >
      <span className="text-lg font-medium hover:text-blue-600">👑 Top Gigster This Week:</span>
      <span className="ml-2 text-blue-600 hover:text-blue-700">SarahM (2450 XP)</span>
    </Link>
  </div>
);

// Memoized Gig Card Component
const GigCard = React.memo(({ gig, handleCreateGig, openReportModal }) => {
  const { emoji, gradient } = getCategoryDetails(gig.category);
  const daysAgo = Math.floor((new Date() - new Date(gig.created_at)) / (1000 * 60 * 60 * 24));
  const taskCount = gig.gig_tasks?.length || 0;
  const isService = gig.service_offered;

  // Dynamic classes based on service type
  const cardClasses = `group rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col relative ${
    isService 
      ? 'border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-white' 
      : 'border border-gray-100 bg-white'
  }`;

  const budgetDisplay =  `$${gig.budget_range_min}-$${gig.budget_range_max}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      layout
      role="article"
      aria-labelledby={`gig-title-${gig._id}`}
    >
      <Link
        to={`/gigs/${gig._id}`}
        className={cardClasses}
        aria-label={`View ${gig.title} ${isService ? 'service' : 'gig'} details`}
      >
        {/* Service Offered Badge */}
        {isService && (
          <div className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center z-10">
            <Rocket className="w-4 h-4 mr-2" />
            Service Offered
          </div>
        )}

        {/* Report Button */}
        <button 
          className="absolute top-3 right-3 z-10 text-gray-400 hover:text-red-500 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openReportModal(gig);
          }}
          aria-label={`Report ${gig.title} ${isService ? 'service' : 'gig'}`}
        >
          <Flag className="w-5 h-5" />
        </button>

        {/* Image/Emoji Section */}
        <div className={`relative bg-gradient-to-br ${gradient} h-48 flex items-center justify-center`}>
          {gig.attachment ? (
            <img
              crossOrigin="anonymous"
              src={`${import.meta.env.VITE_SERVER}/${gig.attachment.file_url}`}
              alt={gig.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span 
              className="text-7xl transform transition group-hover:scale-110"
              role="img"
              aria-label={gig.category}
            >
              {emoji}
            </span>
          )}
          {/* Tags */}
          <div className="absolute top-3 left-3 flex space-x-2">
            {gig.tags?.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white/90 text-xs font-medium rounded-full backdrop-blur-sm"
                aria-label={`Tag: ${tag}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 id={`gig-title-${gig._id}`} className="text-xl font-bold text-gray-900">
              {gig.title}
              {isService && <span className="ml-2 text-blue-500">✨</span>}
            </h3>
            <div className="flex items-center space-x-1">
              {gig.user_rating > 0 && (
                <>
                  <Star className="w-4 h-4 text-yellow-500" aria-hidden="true" />
                  <span className="font-medium">{gig.user_rating.toFixed(1)}</span>
                </>
              )}
            </div>
          </div>

          {/* Subtasks (hidden for services) */}
          {!isService && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <ClipboardList className="w-4 h-4" aria-hidden="true" />
              <span>{taskCount} subtasks</span>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-600 mb-3 line-clamp-2 flex-1">{gig.description}</p>

          {/* Progress Bar (only for regular gigs) */}
          {!isService && (
            <div className="mb-3">
              <div 
                className="h-2 bg-gray-200 rounded-full"
                role="progressbar"
                aria-valuenow={Math.min(gig.bidCount || 0, 10) * 10}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div 
                  className="h-2 bg-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min(gig.bidCount || 0, 10) * 10}%` }}
                />
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {gig.bidCount || 0}/10 bids
              </div>
            </div>
          )}

          {/* Meta Information */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
              </div>
              {!isService && (
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" aria-hidden="true" />
                  <span>{gig.bidCount || 0} bids</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" aria-hidden="true" />
              <span>{gig.zipcode}</span>
            </div>

            <div className="flex items-center space-x-2">
              {gig.is_volunteer ? (
                <Heart className="w-4 h-4 text-red-500" aria-hidden="true" />
              ) : (
                <DollarSign className="w-4 h-4 text-green-500" aria-hidden="true" />
              )}
              <span className={gig.is_volunteer ? 'text-red-600' : 'text-green-600'}>
                {gig.is_volunteer ? 'Volunteer Opportunity' : budgetDisplay}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

// Extracted Pagination Component
const Pagination = ({ state, setState, totalPages }) => (
  <div 
    role="navigation"
    aria-label="Pagination"
    className="flex justify-center items-center space-x-4 mt-12"
  >
    <motion.button
      whileHover={{ scale: 1.1 }}
      disabled={state.page === 1}
      onClick={() => setState(prev => ({ ...prev, page: prev.page - 1 }))}
      className="flex items-center space-x-2 px-6 py-2 bg-white rounded-xl shadow-sm hover:shadow-md disabled:opacity-50"
      aria-label="Previous page"
    >
      <ChevronLeft className="w-5 h-5" aria-hidden="true" />
      <span className="font-medium">Previous</span>
    </motion.button>
    
    <div className="flex items-center space-x-2">
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => setState(prev => ({ ...prev, page: i + 1 }))}
          className={`w-10 h-10 rounded-lg ${state.page === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'} hover:bg-blue-100`}
          aria-label={`Page ${i + 1}`}
          aria-current={state.page === i + 1 ? 'page' : undefined}
        >
          {i + 1}
        </button>
      ))}
    </div>

    <motion.button
      whileHover={{ scale: 1.1 }}
      disabled={state.page === totalPages}
      onClick={() => setState(prev => ({ ...prev, page: prev.page + 1 }))}
      className="flex items-center space-x-2 px-6 py-2 bg-white rounded-xl shadow-sm hover:shadow-md disabled:opacity-50"
      aria-label="Next page"
    >
      <span className="font-medium">Next</span>
      <ChevronRight className="w-5 h-5" aria-hidden="true" />
    </motion.button>
</div>
);

export default Home;