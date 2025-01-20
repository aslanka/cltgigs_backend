import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiDollarSign, FiStar, FiCalendar, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';

function MyGigs() {
  const [activeTab, setActiveTab] = useState('gigs');
  const [gigs, setGigs] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [selectedGigId, setSelectedGigId] = useState(null);
  const [bids, setBids] = useState([]);
  const [sortBy, setSortBy] = useState('price_desc');
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyGigs();
    fetchMyBids();
  }, []);

  const fetchMyGigs = async () => {
    try {
      const res = await axios.get('/gigs/mygigs/owner');
      setGigs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyBids = async () => {
    try {
      const res = await axios.get('/bids/my');
      setMyBids(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const viewBids = async (gigId) => {
    setSelectedGigId(gigId === selectedGigId ? null : gigId);
    if (gigId !== selectedGigId) {
      try {
        const res = await axios.get(`/bids/${gigId}`);
        setBids(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteGig = async (gigId) => {
    if (window.confirm('Are you sure you want to delete this gig?')) {
      try {
        await axios.delete(`/gigs/${gigId}`);
        fetchMyGigs();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const renderStarRating = (rating) => {
    const fullStars = Math.floor(rating || 0);
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={`w-4 h-4 ${i < fullStars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating?.toFixed(1) || 0})</span>
      </div>
    );
  };

  const sortedBids = [...bids].sort((a, b) => {
    if (sortBy === 'price_asc') return a.amount - b.amount;
    if (sortBy === 'price_desc') return b.amount - a.amount;
    if (sortBy === 'rating_asc') return (a.user_id?.rating || 0) - (b.user_id?.rating || 0);
    if (sortBy === 'rating_desc') return (b.user_id?.rating || 0) - (a.user_id?.rating || 0);
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Work</h1>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('gigs')}
            className={`px-4 py-2 flex items-center space-x-2 ${
              activeTab === 'gigs' 
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiCalendar className="w-5 h-5" />
            <span>My Gigs ({gigs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('bids')}
            className={`px-4 py-2 flex items-center space-x-2 ${
              activeTab === 'bids' 
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiDollarSign className="w-5 h-5" />
            <span>My Bids ({myBids.length})</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'gigs' ? (
          <div className="space-y-4">
            {gigs.map((gig) => (
              <div key={gig._id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 md:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link 
                        to={`/gigs/${gig._id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {gig.title}
                      </Link>
                      <div className="mt-2 text-sm text-gray-600 flex items-center space-x-4">
                        <div className="flex items-center">
                          <FiCalendar className="w-4 h-4 mr-1" />
                          <span>{format(new Date(gig.created_at), 'MMM dd, yyyy')}</span>
                        </div>
                        {gig.is_volunteer ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                            Volunteer Opportunity
                          </span>
                        ) : (
                          <div className="flex items-center">
                            <FiDollarSign className="w-4 h-4 mr-1" />
                            <span>
                              Budget: ${gig.budget_range_min} - ${gig.budget_range_max}
                            </span>
                          </div>
                        )}
                      </div>
                      {gig.description && (
                        <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                          {gig.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleDeleteGig(gig._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => viewBids(gig._id)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        {selectedGigId === gig._id ? 'Hide Bids' : 'View Bids'}
                      </button>
                    </div>
                  </div>

                  {selectedGigId === gig._id && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Bids Received</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Sort by:</span>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-2 py-1 border rounded-md bg-white text-sm"
                          >
                            <option value="price_desc">Price (High to Low)</option>
                            <option value="price_asc">Price (Low to High)</option>
                            <option value="rating_desc">Rating (High to Low)</option>
                            <option value="rating_asc">Rating (Low to High)</option>
                          </select>
                        </div>
                      </div>

                      {sortedBids.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-sm">
                          No bids received yet
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {sortedBids.map((bid) => (
                            <div key={bid._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                  {bid.user_id?.profile_pic_url ? (
                                    <img
                                      src={bid.user_id.profile_pic_url}
                                      alt={bid.user_id.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-gray-500 text-sm">
                                      {bid.user_id?.name?.charAt(0) || 'U'}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <Link
                                    to={`/profile/${bid.user_id?._id}`}
                                    className="font-medium text-gray-900 hover:text-blue-600 text-sm"
                                  >
                                    {bid.user_id?.name || 'Unknown User'}
                                  </Link>
                                  {bid.user_id?.rating && renderStarRating(bid.user_id.rating)}
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">${bid.amount}</p>
                                <button
                                  onClick={() => navigate(`/messages/${bid.conversation_id}`)}
                                  className="mt-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm flex items-center space-x-1"
                                >
                                  <FiMessageSquare className="w-3 h-3" />
                                  <span>Message</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {myBids.map((bid) => (
              <div key={bid._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{bid.gig_id?.title}</h3>
                    <div className="mt-1 text-xs text-gray-600 flex items-center space-x-2">
                      <span>Bid: ${bid.amount}</span>
                      <span>•</span>
                      <span>{format(new Date(bid.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                      bid.accepted 
                        ? 'bg-green-100 text-green-800'
                        : bid.rejected
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {bid.accepted ? 'Accepted' : bid.rejected ? 'Declined' : 'Pending'}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/messages/${bid.conversation_id}`)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <FiMessageSquare className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(activeTab === 'gigs' && gigs.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            You haven't posted any gigs yet
          </div>
        )}

        {(activeTab === 'bids' && myBids.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            You haven't placed any bids yet
          </div>
        )}
      </div>
    </div>
  );
}

export default MyGigs;