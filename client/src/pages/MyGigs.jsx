import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiDollarSign, FiStar, FiEdit, FiCalendar, FiTrash2, FiExternalLink, FiPlus } from 'react-icons/fi';
import { format } from 'date-fns';
import { Rocket, Award, ShieldCheck, BadgeInfo, Sparkles, ChevronDown, CheckCircle, XCircle } from 'lucide-react';

function MyGigs() {
  const [activeTab, setActiveTab] = useState('gigs');
  const [gigs, setGigs] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [selectedGigId, setSelectedGigId] = useState(null);
  const [bids, setBids] = useState([]);
  const [sortBy, setSortBy] = useState('price_desc');
  const [hoveredGig, setHoveredGig] = useState(null);
  const [xpProgress, setXpProgress] = useState(65); // Example XP progress
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch gigs and bids
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

  const handleDeleteBid = async (bidId) => {
    if (window.confirm('Are you sure you want to delete this bid?')) {
      try {
        await axios.delete(`/bids/${bidId}`);
        fetchMyBids();
        const updatedBids = bids.filter((bid) => bid._id !== bidId);
        setBids(updatedBids);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleStatusChange = async (bidId, status) => {
    try {
      await axios.patch(`/bids/${bidId}/status`, { status });
      const updatedBids = bids.map((bid) =>
        bid._id === bidId ? { ...bid, status } : bid
      );
      setBids(updatedBids);
    } catch (err) {
      console.error(err);
    }
  };

  // Render rating stars
  const renderStarRating = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const displayRating = Number.isInteger(rating) ? rating : rating?.toFixed(1);
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={`w-4 h-4 ${i < fullStars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({displayRating || 0})</span>
      </div>
    );
  };
  

  // Sort bids
  const sortedBids = [...bids].sort((a, b) => {
    if (sortBy === 'price_asc') return a.amount - b.amount;
    if (sortBy === 'price_desc') return b.amount - a.amount;
    if (sortBy === 'rating_asc') return (a.user_id?.rating || 0) - (b.user_id?.rating || 0);
    if (sortBy === 'rating_desc') return (b.user_id?.rating || 0) - (a.user_id?.rating || 0);
    return 0;
  });

  // XP Progress Bar
  const XpProgressBar = () => (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="font-semibold">Progress to Next Level (feature coming soon!)</h3>
        </div>
        <span className="text-sm text-gray-500">{xpProgress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${xpProgress}%` }}
        />
      </div>
    </div>
  );

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Rocket className="w-8 h-8 text-blue-600" />
              My Work Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              {activeTab === 'gigs'
                ? `Managing ${gigs.length} gig${gigs.length !== 1 ? 's' : ''}`
                : `Tracking ${myBids.length} bid${myBids.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <XpProgressBar />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 space-x-2">
          <button
            onClick={() => setActiveTab('gigs')}
            className={`px-6 py-3 flex items-center space-x-2 rounded-t-lg transition-colors ${
              activeTab === 'gigs'
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <FiCalendar className="w-5 h-5" />
            <span>My Gigs ({gigs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('bids')}
            className={`px-6 py-3 flex items-center space-x-2 rounded-t-lg transition-colors ${
              activeTab === 'bids'
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <FiDollarSign className="w-5 h-5" />
            <span>My Bids ({myBids.length})</span>
          </button>
        </div>

        {activeTab === 'gigs' && (
          <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <AnimatePresence>
              {gigs.map((gig) => (
                <motion.div
                  key={gig._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3 mb-2">
                          <Link
                            to={`/gigs/${gig._id}`}
                            className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {gig.title}
                          </Link>
                          {gig.is_volunteer && (
                            <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-sm flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              Volunteer
                            </span>
                          )}
                        </div>

                        <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600">
                          <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                            <FiCalendar className="w-4 h-4 mr-1" />
                            <span>Posted {format(new Date(gig.created_at), 'MMM dd')}</span>
                          </div>
                          {!gig.is_volunteer && (
                            <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                              <FiDollarSign className="w-4 h-4 mr-1" />
                              <span>Budget: ${gig.budget_range_min}-${gig.budget_range_max}</span>
                            </div>
                          )}
                        </div>

                        {gig.description && (
                          <p className="mt-3 text-gray-600 line-clamp-2">
                            {gig.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-2">
                          <Link
                            to={`/edit-gig/${gig._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FiEdit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteGig(gig._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <button
                          onClick={() => viewBids(gig._id)}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            selectedGigId === gig._id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {selectedGigId === gig._id ? 'Collapse' : 'View Bids'}
                        </button>
                      </div>
                    </div>

                    {selectedGigId === gig._id && (
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                            Bids Received
                          </h4>
                          <div className="flex items-center space-x-2">
                            <select
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value)}
                              className="px-3 py-1 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="price_desc">Price High-Low</option>
                              <option value="price_asc">Price Low-High</option>
                              <option value="rating_desc">Rating High-Low</option>
                              <option value="rating_asc">Rating Low-High</option>
                            </select>
                          </div>
                        </div>

                        {/* Bids List */}
                        {sortedBids.length === 0 ? (
                          <div className="text-center py-6 text-gray-500 text-sm">
                            <BadgeInfo className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p>No bids received yet</p>
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            {sortedBids.map((bid) => (
                              <motion.div
                                key={bid._id}
                                className="p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-100 transition-colors shadow-sm"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
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
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <Link
                                          to={`/profile/${bid.user_id?._id}`}
                                          className="font-medium text-gray-900 hover:text-blue-600 text-sm"
                                        >
                                          {bid.user_id?.name || 'Unknown User'}
                                        </Link>
                                        {renderStarRating(bid.user_id?.rating)}
                                      </div>
                                      {bid.message && (
                                        <p className="mt-2 text-gray-600 text-sm">
                                          "{bid.message}"
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="ml-4 text-right flex flex-col items-end">
                                    <p className="text-lg font-semibold text-gray-900">${bid.amount}</p>
                                    <span
                                      className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                                        bid.status === 'accepted'
                                          ? 'bg-green-100 text-green-800'
                                          : bid.status === 'rejected'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-blue-100 text-blue-800'
                                      }`}
                                    >
                                      {bid.status?.charAt(0).toUpperCase() + bid.status?.slice(1) || 'Pending'}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                  <select
                                    value={bid.status}
                                    onChange={(e) => handleStatusChange(bid._id, e.target.value)}
                                    className="px-3 py-1 border rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accept</option>
                                    <option value="rejected">Reject</option>
                                  </select>
                                  <button
                                    onClick={() => navigate(`/messages/${bid.conversation_id}`)}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm flex items-center gap-2"
                                  >
                                    <FiMessageSquare className="w-4 h-4" />
                                    <span>Message</span>
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Bids Tab Content */}
        {activeTab === 'bids' && (
          <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-1"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <AnimatePresence>
              {myBids.map((bid) => (
                <motion.div
                  key={bid._id}
                  variants={cardVariants}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link
                            to={`/gigs/${bid.gig_id?._id || ''}`}
                            className="font-semibold text-gray-900 text-sm hover:text-blue-600 flex items-center"
                          >
                            {bid.gig_id?.title || 'Deleted Gig'}
                            <FiExternalLink className="ml-2 w-4 h-4" />
                          </Link>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              bid.status === 'accepted'
                                ? 'bg-green-100 text-green-800'
                                : bid.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {bid.gig_id
                              ? bid.status?.charAt(0).toUpperCase() + bid.status?.slice(1) || 'Pending'
                              : 'Gig Deleted'}
                          </span>
                        </div>

                        <div className="flex items-center flex-wrap gap-3 text-sm text-gray-600">
                          <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                            <FiDollarSign className="w-4 h-4 mr-1" />
                            <span>Bid Amount: ${bid.amount}</span>
                          </div>
                          <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                            <FiCalendar className="w-4 h-4 mr-1" />
                            <span>{format(new Date(bid.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteBid(bid._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/messages/${bid.conversation_id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FiMessageSquare className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {myBids.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="max-w-md mx-auto">
                  <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Bids Placed Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start by browsing gigs and placing your first bid
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <FiPlus className="w-5 h-5" />
                    Browse Gigs
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Floating Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/create-gig')}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-xl flex items-center gap-2 z-50"
        >
          <FiPlus className="w-6 h-6" />
          <span className="font-semibold">New Gig</span>
        </motion.button>
      </div>
    </div>
  );
}

export default MyGigs;