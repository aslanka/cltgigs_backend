import { DotPattern } from "@/components/ui/dot-pattern";
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { Search, MapPin, Filter, ChevronLeft, ChevronRight, Tag, Users, Calendar, DollarSign, Heart, Package } from 'lucide-react';
import ProfilePicture from '../components/ProfilePicture';
import Mascot from '../assets/mascot.svg'

const SkeletonCard = () => (
  <div className="animate-pulse p-4 rounded-lg bg-gray-200">
    <div className="h-48 bg-gray-300 rounded mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
  </div>
);

// Helper function to get category-specific emoji and background color
const getCategoryDetails = (category) => {
  switch (category) {
    case 'Music':
      return { emoji: '🎵', color: '#FEF3C7' }; // Light yellow
    case 'Carpentry':
      return { emoji: '🪚', color: '#D1FAE5' }; // Light green
    case 'House Work':
      return { emoji: '🏠', color: '#DBEAFE' }; // Light blue
    case 'Cleaning':
      return { emoji: '🧹', color: '#FCE7F3' }; // Light pink
    case 'Photography':
      return { emoji: '📸', color: '#FEE2E2' }; // Light red
    case 'Plumbing':
      return { emoji: '🚰', color: '#E0E7FF' }; // Light indigo
    case 'Electrician':
      return { emoji: '🔌', color: '#FEF9C3' }; // Light amber
    default:
      return { emoji: '💼', color: '#F3F4F6' }; // Light gray (default)
  }
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
  const [showFilters, setShowFilters] = useState(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* ========== HEADER ========== */}
<header className="relative bg-white border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {/* Branding and Title */}
    <div className="text-center mb-8 flex items-center justify-center">
  <img src={Mascot} alt="Mascot" className="h-16 w-16 sm:h-20 sm:w-20 mr-4" />
  <h1 className="text-4xl sm:text-5xl font-bold text-blue-600">
    CharlotteGigs
  </h1>
</div>

    {/* Search and Filters Section */}
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search for gigs..."
          className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Location and Distance Filters */}
      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Enter Zip Code"
            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
          />
        </div>
        <select
          className="bg-gray-50 rounded-xl border-0 py-3 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
        >
          <option value="10">10mi</option>
          <option value="25">25mi</option>
          <option value="50">50mi</option>
          <option value="100">100mi</option>
          <option value="250">250mi</option>
        </select>
        <button
          onClick={handleZipSearch}
          className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Go
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="mt-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <input
            type="number"
            placeholder="Min Budget"
            className="w-full sm:w-1/2 px-4 py-2 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max Budget"
            className="w-full sm:w-1/2 px-4 py-2 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isVolunteer" className="text-sm text-gray-700">
            Volunteer Gigs Only
          </label>
        </div>
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          className="w-full px-4 py-2 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
    </div>
  </div>
</header>
{/* ========== END HEADER ========== */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          <button
            onClick={handleCreateGig}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg"
          >
            Post a Gig
          </button>
        </div>

        {/* Gigs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: limit }).map((_, idx) => <SkeletonCard key={idx} />)
            : gigs.map((gig) => {
                const { emoji, color } = getCategoryDetails(gig.category);

                return (
                  <Link
                    to={`/gigs/${gig._id}`}
                    key={gig._id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Image Section with Tags Overlay */}
                    <div className="relative">
                      {gig.attachment ? (
                        <img
                          loading="lazy"
                          crossOrigin="anonymous"
                          src={`${import.meta.env.VITE_SERVER}/${gig.attachment.file_url}`}
                          alt={gig.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-48 flex items-center justify-center"
                          style={{ backgroundColor: color }}
                        >
                          <span className="text-6xl">{emoji}</span>
                        </div>
                      )}
                      {/* Tags Overlay */}
                      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-2">
                        {gig.tags?.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold text-gray-900">{gig.title}</h2>
                        <div className="flex items-center gap-2">
                          <Users className="text-gray-500 w-5 h-5" />
                          <span className="text-gray-600">{gig.team_size}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 line-clamp-3">{gig.description}</p>

                      {/* Gig Features */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Tag className="text-gray-500 w-5 h-5" />
                          <span className="text-gray-600">Category: <span className="font-medium">{gig.category}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="text-gray-500 w-5 h-5" />
                          <span className="text-gray-600">Zip Code: <span className="font-medium">{gig.zipcode}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="text-gray-500 w-5 h-5" />
                          <span className="text-gray-600">Dates: <span className="font-medium">
                            {gig.start_date ? new Date(gig.start_date).toLocaleDateString() : 'N/A'} -{' '}
                            {gig.completion_date ? new Date(gig.completion_date).toLocaleDateString() : 'N/A'}
                          </span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          {gig.is_volunteer ? (
                            <Heart className="text-red-500 w-5 h-5" />
                          ) : (
                            <DollarSign className="text-gray-500 w-5 h-5" />
                          )}
                          <span className="text-gray-600">
                            {gig.is_volunteer ? 'Volunteer Work' : `Budget: $${gig.budget_range_min} - $${gig.budget_range_max}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
          }
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="flex items-center space-x-1 px-4 py-2 bg-gray-300 rounded disabled:opacity-50 text-lg"
          >
            <ChevronLeft />
            <span>Previous</span>
          </button>
          <span className="text-lg">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="flex items-center space-x-1 px-4 py-2 bg-gray-300 rounded disabled:opacity-50 text-lg"
          >
            <span>Next</span>
            <ChevronRight />
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;