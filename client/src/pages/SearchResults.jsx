// src/pages/SearchResults.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SkeletonCard = () => (
  <div className="animate-pulse p-4 rounded-lg bg-gray-200">
    <div className="h-48 bg-gray-300 rounded mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
  </div>
);

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [gigs, setGigs] = useState([]);
  const [totalGigs, setTotalGigs] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const limit = 10;
  const totalPages = Math.ceil(totalGigs / limit);

  // Extract search parameters from query string
  const searchTerm = queryParams.get('term') || '';
  const category = queryParams.get('category') || 'All';
  const zipCode = queryParams.get('zipCode') || '';
  const distance = queryParams.get('distance') || '100';
  const sortBy = queryParams.get('sortBy') || 'date_desc';

  useEffect(() => {
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

    fetchGigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, category, sortBy, zipCode, distance, page]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4">
        <h1 className="text-3xl font-bold text-center">Search Results</h1>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: limit }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <div key={gig._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                {gig.attachment ? (
                  <img
                    loading="lazy"
                    src={`${import.meta.env.VITE_SERVER || ''}${gig.attachment.file_url}`}
                    alt={gig.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
                <div className="p-4 space-y-3">
                  <h2 className="text-lg font-semibold text-gray-800">{gig.title}</h2>
                  <p className="text-gray-700 text-sm line-clamp-3">{gig.description}</p>
                  <div className="flex justify-between items-center text-gray-800 text-sm font-medium">
                    <span>${gig.price}</span>
                    {gig.distance !== undefined && (
                      <span>{gig.distance.toFixed(1)} miles away</span>
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
            ))}
          </div>
        )}

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

export default SearchResults;
