import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
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
  Bookmark,
  Edit,
  Award,
  Shield,
  ChevronLeft,
  ChevronRight,
  Loader2,
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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { token, userData } = useContext(AuthContext);
  const navigate = useNavigate();

  // Time formatting utilities
  const formatPostedTime = (dateString) => {
    const diffDays = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 'Posted Today' : `Posted ${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const formatMemberSince = (dateString) => {
    if (!dateString) return 'Member since unknown date';
    const joinDate = new Date(dateString);
    return isNaN(joinDate.getTime()) 
      ? 'Member since unknown date'
      : `Member since ${joinDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`;
  };

  // Bookmark functionality
  const handleBookmark = async () => {
    if (!token) {
      navigate('/login', { state: { from: `/gigs/${gigId}` } });
      return;
    }
    try {
      const method = isBookmarked ? 'delete' : 'post';
      await axios[method](`/bookmarks${isBookmarked ? `/${gigId}` : ''}`, { gigId });
      setIsBookmarked(!isBookmarked);
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  // Fetch gig data
  useEffect(() => {
    const fetchGigData = async () => {
      setIsLoading(true);
      try {
        const [gigRes, bookmarksRes] = await Promise.all([
          axios.get(`/gigs/${gigId}`),
          token ? axios.get(`/bookmarks/check/${gigId}`) : Promise.resolve({ data: { isBookmarked: false } }),
        ]);

        setGig(gigRes.data.gig);
        setAttachments(gigRes.data.attachments);
        setIsBookmarked(bookmarksRes.data.isBookmarked);

        // Only fetch bids if logged in
        if (token) {
          const bidsRes = await axios.get(`/bids/${gigId}`);
          setBids(bidsRes.data);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load gig details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGigData();
  }, [gigId, token]);

  // Bid handling
  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login', { state: { from: `/gigs/${gigId}`, formData: { bidAmount, bidMessage } } });
      return;
    }

    if (!bidAmount || isNaN(bidAmount)) {
      setError('Please enter a valid bid amount');
      return;
    }

    setIsPlacingBid(true);
    try {
      const res = await axios.post('/bids', {
        gig_id: gigId,
        amount: parseFloat(bidAmount),
        message: bidMessage
      });

      setBids(prev => [...prev, {
        ...res.data.newBid,
        user_id: {
          _id: userData.userId,
          name: userData.name,
          profile_pic_url: userData.profilePicUrl,
          rating: userData.rating
        }
      }]);
      
      setBidAmount('');
      setBidMessage('');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error placing bid');
    } finally {
      setIsPlacingBid(false);
    }
  };

  // Message user functionality
  const startConversation = async () => {
    if (!token) {
      navigate('/login', { state: { from: `/gigs/${gigId}` } });
      return;
    }
    try {
      const res = await axios.post('/conversations', { recipientId: gig.user_id._id, gigId });
      navigate(`/messages/${res.data.conversationId}`);
    } catch (err) {
      setError('Failed to start conversation');
    }
  };

  // Render rating stars
  const renderRatingStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating ?? 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!gig) return <div className="text-center p-8">Gig not found</div>;

  const isOwner = userData?.userId === gig?.user_id?._id;
  const userBid = token ? bids.find(bid => bid.user_id?._id === userData?.userId) : null;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Action Buttons */}
      <div className="fixed right-6 bottom-6 space-y-3 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
          onClick={handleBookmark}
        >
          <Bookmark
            className={`w-6 h-6 transition-colors ${
              isBookmarked ? 'text-blue-600 fill-current' : 'text-gray-600'
            }`}
          />
        </motion.button>
        {isOwner && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => navigate(`/edit-gig/${gigId}`)}
          >
            <Edit className="w-6 h-6" />
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gig Header */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">{gig.title}</h1>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-5 h-5" />
                  <span>{formatPostedTime(gig.createdAt)}</span>
                </div>
              </div>
              {!isOwner && (
                <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                  <Award className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">Earn 250 XP</span>
                </div>
              )}
            </div>

            {/* Image Gallery */}
            {attachments.length > 0 && (
              <div className="relative group rounded-xl overflow-hidden">
                <img
                  crossOrigin="anonymous"
                  src={`${import.meta.env.VITE_SERVER}/${attachments[currentImageIndex].file_url}`}
                  alt={gig.title}
                  className="w-full h-96 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                />
                {attachments.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setCurrentImageIndex(prev => (prev - 1 + attachments.length) % attachments.length)}
                      className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => (prev + 1) % attachments.length)}
                      className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Gig Details Sections */}
          <div className="space-y-8">
            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                Description
              </h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(gig.description) }}
              />
            </section>

            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Gig Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Budget Range</p>
                    <p className="font-medium">
                      {gig.is_volunteer ? 'Volunteer Position' : `$${gig.budget_range_min} - $${gig.budget_range_max}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{gig.zipcode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Team Size</p>
                    <p className="font-medium">{gig.team_size} people</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Safety Status</p>
                    <p className="font-medium">Verified & Protected</p>
                  </div>
                </div>
              </div>
            </section>

            {gig.gig_tasks.length > 0 && (
              <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  Included Services
                </h2>
                <div className="space-y-3">
                  {gig.gig_tasks.slice(0, showAllTasks ? undefined : 3).map((task, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      <p className="text-gray-700">{task}</p>
                    </div>
                  ))}
                </div>
                {gig.gig_tasks.length > 3 && (
                  <button
                    onClick={() => setShowAllTasks(!showAllTasks)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showAllTasks ? 'Show less' : `Show all ${gig.gig_tasks.length} tasks`}
                  </button>
                )}
              </section>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {!isOwner && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                {token ? (
                  userBid ? (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-900">Your Bid</h2>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Bid Amount</p>
                        <p className="text-lg font-semibold text-gray-900">${userBid.amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Your Message</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{userBid.message || 'No message provided'}</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handlePlaceBid} className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-900">Place Your Bid</h2>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bid Amount ($)</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          required
                          min="1"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message to Poster</label>
                        <textarea
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                          value={bidMessage}
                          onChange={(e) => setBidMessage(e.target.value)}
                          placeholder="Explain why you're the best choice..."
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isPlacingBid}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isPlacingBid ? 'Submitting Bid...' : 'Submit Bid'}
                      </button>
                    </form>
                  )
                ) : (
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold">Want to bid on this gig?</h3>
                    <p className="text-gray-600">Join our community to submit your proposal and connect with clients.</p>
                    <div className="space-y-3">
                      <button
                        onClick={() => navigate('/login', { state: { from: `/gigs/${gigId}` } })}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                      >
                        Login to Bid
                      </button>
                      <div className="text-sm text-gray-500">
                        Not a member yet?{' '}
                        <button
                          onClick={() => navigate('/register', { state: { from: `/gigs/${gigId}` } })}
                          className="text-blue-600 hover:underline"
                        >
                          Sign up free
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center gap-4">
                <ProfilePicture
                  profilePicUrl={gig.user_id.profile_pic_url}
                  name={gig.user_id.name}
                  size="14"
                  className="flex-shrink-0"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{gig.user_id.name}</h3>
                  <div className="flex items-center gap-2">
                    {renderRatingStars(gig.user_id.rating)}
                    <span className="text-sm text-gray-500">({gig.user_id.reviews?.length || 0} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Completed Gigs</p>
                  <p className="text-xl font-bold text-gray-900">{gig.user_id.completed_gigs || 0}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatMemberSince(gig.user_id.createdAt)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => token ? startConversation() : navigate('/login', { state: { from: `/gigs/${gigId}` } })}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                {token ? 'Contact User' : 'Login to Contact'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
}

export default GigDetails;