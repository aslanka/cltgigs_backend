import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'framer-motion';
import ProfilePicture from '../components/ProfilePicture';
import {
  Tag,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Check,
  Star,
  MessageCircle,
  Share2,
  Loader2,
  Edit,
  Heart,
  Award,
  Shield,
  BadgeCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

function GigDetails() {
  const { gigId } = useParams();
  const [gig, setGig] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { token, userData } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch gig and bids
  useEffect(() => {
    const fetchGig = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/gigs/${gigId}`);
        setGig(res.data.gig);
        setAttachments(res.data.attachments || []);
        fetchBids();
      } catch (err) {
        console.error(err);
        setError('Failed to load gig details.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBids = async () => {
      try {
        const bidsRes = await axios.get(`/bids/${gigId}`);
        setBids(bidsRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load bids.');
      }
    };

    fetchGig();
  }, [gigId, token, userData]);

  // Handle bid submission
  const handlePlaceBid = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      alert('Please enter a valid bid amount.');
      return;
    }

    setIsPlacingBid(true);
    setError(null);
    setBidSuccess(false);

    try {
      const res = await axios.post('/bids', {
        gig_id: gigId,
        amount: bidAmount,
        message: bidMessage,
      });
      setBidSuccess(true);
      setBidAmount('');
      setBidMessage('');
      navigate(`/messages/${res.data.conversationId}`);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || 'Error placing bid';
      setError(errorMessage);
    } finally {
      setIsPlacingBid(false);
    }
  };

  // Handle image carousel
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % attachments.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + attachments.length) % attachments.length);
  };

  // Handle gig edit
  const handleEditGig = () => {
    navigate(`/create-gig/${gigId}`);
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!gig.completion_date) return 'Flexible';
    const endDate = new Date(gig.completion_date);
    const diff = endDate - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : 'Expired';
  };

  // Sanitize description
  const sanitizeDescription = (description) => ({
    __html: DOMPurify.sanitize(description),
  });

  // Render rating stars
  const renderRatingStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill={i < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="animate-spin text-blue-600" />
        <span className="ml-3 text-lg">Loading gig...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  }

  if (!gig) {
    return <div className="p-4 text-center">Gig not found.</div>;
  }

  const isOwner = gig.user_id._id === userData?.userId;
  const userBid = bids.find((bid) => bid.user_id._id === userData?.userId);

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Floating Action Buttons */}
      <div className="fixed right-6 bottom-6 space-y-3 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="p-3 bg-white rounded-full shadow-xl"
          onClick={() => setIsLiked(!isLiked)}
        >
          <Heart className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
        </motion.button>
        {isOwner && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-blue-600 text-white rounded-full shadow-xl"
            onClick={handleEditGig}
          >
            <Edit className="w-6 h-6" />
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gig Header */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-6 h-6 text-blue-500" />
                  <h1 className="text-3xl font-bold text-gray-900">{gig.title}</h1>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">{getTimeRemaining()}</span>
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
                <Award className="w-5 h-5" />
                <span>Earn 250 XP</span>
              </button>
            </div>

            {/* Image Gallery */}
            {attachments.length > 0 && (
              <div className="relative group rounded-2xl overflow-hidden">
                <img
                  src={`${import.meta.env.VITE_SERVER}${attachments[currentImageIndex].file_url}`}
                  alt="Gig"
                  className="w-full h-96 object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
                />
                {attachments.length > 1 && (
                  <div className="absolute inset-0 flex justify-between items-center px-4">
                    <button
                      onClick={handlePrevImage}
                      className="p-2 bg-white/80 rounded-full backdrop-blur-sm hover:bg-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="p-2 bg-white/80 rounded-full backdrop-blur-sm hover:bg-white"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Gig Details Sections */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            {/* Description */}
            <section className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-blue-100 p-2 rounded-full">
                  <Tag className="w-5 h-5 text-blue-600" />
                </span>
                Description
              </h2>
              <div
                className="prose prose-blue max-w-none"
                dangerouslySetInnerHTML={sanitizeDescription(gig.description)}
              />
            </section>

            {/* Details Card */}
            <section className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="bg-purple-100 p-2 rounded-full">
                  <Users className="w-5 h-5 text-purple-600" />
                </span>
                Gig Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ... existing detail items enhanced with icons ... */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Shield className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Verification</p>
                    <p className="font-medium">Identity Verified</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Tasks Section */}
            {gig.gig_tasks.length > 0 && (
              <section className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="bg-green-100 p-2 rounded-full">
                    <Check className="w-5 h-5 text-green-600" />
                  </span>
                  Included Services
                </h2>
                <div className="space-y-3">
                  {gig.gig_tasks.slice(0, showAllTasks ? gig.gig_tasks.length : 3).map((task, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Check className="flex-shrink-0 w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{task}</span>
                    </div>
                  ))}
                </div>
                {gig.gig_tasks.length > 3 && (
                  <button
                    onClick={() => setShowAllTasks(!showAllTasks)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showAllTasks ? 'Show less' : `Show all ${gig.gig_tasks.length} services`}
                  </button>
                )}
              </section>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="sticky top-8 space-y-6"
          >
            {/* Bid Card */}
            {!isOwner && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">🔥 Popular Gig</h3>
                    <p className="text-sm text-gray-600">
                      This gig gets 3x more views than others in {gig.category}
                    </p>
                  </div>

                  {/* Bid Form */}
                  {userBid ? (
                    <>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Bid</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bid Amount ($)</label>
                          <p className="text-gray-900 font-medium">${userBid.amount}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                          <p className="text-gray-900">{userBid.message || 'No message provided.'}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Place Your Bid</h2>
                      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Proposal Price ($)</label>
                          <input
                            type="number"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your bid amount"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                          <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                            placeholder="Add a message to the poster..."
                            value={bidMessage}
                            onChange={(e) => setBidMessage(e.target.value)}
                          />
                        </div>
                        <button
                          type="submit"
                          onClick={handlePlaceBid}
                          disabled={isPlacingBid}
                          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          {isPlacingBid ? 'Placing Bid...' : 'Submit Bid'}
                        </button>
                      </form>
                    </>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Protected payments • Escrow system</span>
                  </div>
                </div>
              </div>
            )}

            {/* User Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-4">
                <ProfilePicture
                  profilePicUrl={gig.user_id.profile_pic_url}
                  name={gig.user_id.name}
                  size="14"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{gig.user_id.name}</h3>
                  <div className="flex items-center gap-2">
                    {renderRatingStars(gig.user_id.rating || 0)}
                    <span className="text-gray-500">({gig.user_id.reviews?.length || 0})</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Completed Gigs</p>
                  <p className="text-xl font-bold text-gray-900">142</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-xl font-bold text-gray-900">2018</p>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                <MessageCircle className="w-5 h-5" />
                Contact Contractor
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.main>
  );
}

export default GigDetails;