import React, { useState, useContext, useEffect } from 'react'; 
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MapPin, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import ProfilePicture from '../components/ProfilePicture';
import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/ui/dot-pattern";

console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

const SkeletonCard = () => (
  <div className="animate-pulse p-4 rounded-lg bg-gray-200">
    <div className="h-48 bg-gray-300 rounded mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
  </div>
);

const Home = () => {
  const [gigs, setGigs] = useState([]);
  const [totalGigs, setTotalGigs] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [zipCode, setZipCode] = useState('');
  const [distance, setDistance] = useState('100');
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
  }, [searchTerm, category, sortBy, page]);

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
        distance
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
<div className="relative bg-white overflow-hidden">
  {/* Dot Pattern Background */}
  <DotPattern
  className="absolute inset-0 z-0"
  width={12} // Smaller spacing between dots
  height={12}
  cx={1.5} // Fine-tuned circle placement
  cy={1.5}
  cr={1} // Smaller dot size
/>


  <div className="relative z-10 bg-white bg-opacity-90 backdrop-blur-sm shadow-sm border-b">
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 text-center">
      <h1 className="text-3xl sm:text-4xl font-bold text-blue-600">
        CharlotteGigs
      </h1>
      <p className="text-gray-600 mt-2 max-w-md mx-auto">
        Your local marketplace for in-person services in Charlotte
      </p>
    </div>

    <div className="px-4 py-4 sm:py-6 space-y-4 max-w-2xl mx-auto">
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
    </div>

    {/* Toggle Filters on Mobile */}
    <div className="flex justify-end px-4 sm:hidden pb-4">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center px-4 py-2 bg-gray-200 rounded-full text-gray-700 hover:bg-gray-300 focus:outline-none"
      >
        <Filter className="h-5 w-5 mr-2" /> Filters
      </button>
    </div>

    {/* Filters Section */}
    <div className={`${showFilters ? 'block' : 'hidden'} sm:block mt-6 px-4 pb-6`}>
      {/* Categories */}
<div className="overflow-x-auto">
  <div className="flex justify-center space-x-2 pb-2">
    {categories.map((cat) => (
      <button
        key={cat}
        onClick={() => {
          setCategory(cat);
          setPage(1);
        }}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
          ${category === cat 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
      >
        {cat}
      </button>
    ))}
  </div>
</div>

    </div>
  </div>
</div>


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
            : gigs.map((gig) => (
                <div key={gig._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Image Section */}
                  {gig.attachment ? (
                    <img
                      loading="lazy"
                      crossOrigin="anonymous"
                      src={`${import.meta.env.VITE_SERVER}/${gig.attachment.file_url}`} 
                      alt={gig.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <ProfilePicture
                        profilePicUrl={gig.user_id?.profilePicUrl}
                        name={gig.user_id?.name || 'Unknown'}
                        size="10"
                        className="flex-shrink-0"
                      />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">{gig.title}</h2>
                        <p className="text-sm text-gray-500">{gig.user_id?.name}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm line-clamp-3">{gig.description}</p>

                    <div className="flex justify-between items-center text-gray-800 text-sm font-medium">
                      <span>${gig.price}</span>
                      {gig.distance !== undefined && (
                        <span>{gig.distance.toFixed(1)} miles away</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-gray-600 text-xs">
                      <span>ZIP: {gig.zipcode}</span>
                      {gig.bidCount !== undefined && (
                        <span>{gig.bidCount} bids</span>
                      )}
                    </div>

                    <Link
                      to={`/gigs/${gig._id}`}
                      className="block text-center mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
            ))
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
