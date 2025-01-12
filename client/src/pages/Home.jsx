import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MapPin, Filter } from 'lucide-react';

const Home = () => {
  const [gigs, setGigs] = useState([]);
  const [totalGigs, setTotalGigs] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [zipCode, setZipCode] = useState('');
  const [distance, setDistance] = useState('100');
  const [sortBy, setSortBy] = useState('date_desc');
  const [page, setPage] = useState(1);
  const limit = 20;
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const categories = [
    'All', 'Music', 'Carpentry', 'House Work', 'Cleaning',
    'Photography', 'Plumbing', 'Electrician'
  ];

  useEffect(() => {
    fetchGigs();
  }, [searchTerm, category, sortBy, page]);

  const fetchGigs = async () => {
    try {
      const params = { 
        searchTerm, 
        category, 
        sortBy, 
        page, 
        limit,
        zipCode,    // include zipCode parameter
        distance    // include distance parameter
      };
      const res = await axios.get('/gigs', { params });
  
      setGigs(res.data?.gigs || []);
      setTotalGigs(res.data?.total || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleZipSearch = () => {
    // Reset to first page and re-fetch gigs when user clicks "Go"
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
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-blue-600 text-center">CharlotteGigs</h1>
          <p className="text-center text-gray-600 mt-2">
            Your local marketplace for in-person services in Charlotte
          </p>
          
          {/* Location and Search */}
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="relative flex items-center">
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter Zip Code"
                  className="pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
                <button
                  onClick={handleZipSearch}
                  className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Go
                </button>
              </div>
              <select
                className="px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
              >
                <option value="10">Within 10 miles</option>
                <option value="25">Within 25 miles</option>
                <option value="50">Within 50 miles</option>
                <option value="100">Within 100 miles</option><option value="250">Within 250 miles</option>
              </select>
            </div>
            
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for gigs..."
                className="w-full pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Post a Gig
          </button>
        </div>

        {/* Gigs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {gigs.map((gig) => (
            <Card key={gig._id} className="hover:shadow-lg transition-shadow p-2">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">{gig.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                {gig.attachment && (
                  <img
                    crossOrigin='anonymous'
                    src={`http://localhost:4000/${gig.attachment.file_url}`} 
                    alt={gig.title}
                    className="w-full h-32 object-cover mb-2 rounded"
                  />
                )}
                <p className="text-gray-600 mb-2 text-xs line-clamp-2">{gig.description}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-600 font-semibold text-sm">${gig.price}</span>
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  ZIP: {gig.zipcode}
                </div>
                {gig.distance !== undefined && (
                  <div className="text-xs text-gray-500 mb-1">
                    Distance: {gig.distance.toFixed(1)} miles
                  </div>
                )}
                {/* Assuming gig.bidCount contains number of bids */}
                {gig.bidCount !== undefined && (
                  <div className="text-xs text-gray-500 mb-1">
                    Bids: {gig.bidCount}
                  </div>
                )}
                <Link
                  to={`/gigs/${gig._id}`}
                  className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-200 transition-colors"
                >
                  View Details
                </Link>
                <div className="mt-1 text-xs text-gray-500">
                  Posted by: {gig.user_id?.name || 'Unknown'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 text-xs"
          >
            Previous
          </button>
          <span className="text-xs">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 text-xs"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
