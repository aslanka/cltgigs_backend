import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import DOMPurify from 'dompurify';
import ProfilePicture from '../components/ProfilePicture'; // Ensure this component exists

// Import Lucide Icons
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
  const { token, userData } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGig = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/gigs/${gigId}`);
        setGig(res.data.gig);
        setAttachments(res.data.attachments || []);

        // Fetch bids for the gig
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

  const sanitizeDescription = (description) => ({
    __html: DOMPurify.sanitize(description),
  });

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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gig Details Section */}
        <div className="lg:col-span-2">
          {/* Gig Title and User Profile */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">{gig.title}</h1>
            <div className="flex items-center gap-2">
              <ProfilePicture
                profilePicUrl={gig.user_id.profile_pic_url}
                name={gig.user_id.name}
                size="10"
              />
              <span className="text-gray-700">
                Posted by <span className="font-medium">{gig.user_id.name}</span>
              </span>
            </div>
          </div>

          {/* Gig Image */}
          {attachments.length > 0 && (
            <div className="mb-8">
              <img
                src={`${import.meta.env.VITE_SERVER}${attachments[0].file_url}`}
                alt="Gig Image"
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Gig Description */}
          <section className="gig-details-section mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <div
              className="prose prose-blue max-w-none"
              dangerouslySetInnerHTML={sanitizeDescription(gig.description)}
            />
          </section>

          {/* Gig Details */}
          <section className="gig-details-section mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="text-gray-500 w-5 h-5" />
                <span className="text-gray-600">
                  Category: <span className="font-medium">{gig.category}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="text-gray-500 w-5 h-5" />
                <span className="text-gray-600">
                  Location: <span className="font-medium">{gig.zipcode}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="text-gray-500 w-5 h-5" />
                <span className="text-gray-600">
                  Dates:{' '}
                  <span className="font-medium">
                    {gig.start_date ? new Date(gig.start_date).toLocaleDateString() : 'N/A'} -{' '}
                    {gig.completion_date ? new Date(gig.completion_date).toLocaleDateString() : 'N/A'}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="text-gray-500 w-5 h-5" />
                <span className="text-gray-600">
                  Team Size: <span className="font-medium">{gig.team_size} needed</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="text-gray-500 w-5 h-5" />
                <span className="text-gray-600">
                  Budget:{' '}
                  <span className="font-medium">
                    ${gig.budget_range_min} - ${gig.budget_range_max}
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* Gig Tasks */}
          {gig.gig_tasks.length > 0 && (
            <section className="gig-details-section mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Gig Bundle</h2>
              <div className="space-y-3">
                {gig.gig_tasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="text-green-500 w-5 h-5" />
                    <span className="text-gray-600">{task}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar (Bid Form and User Info) */}
        <div className="lg:col-span-1">
          {/* Bid Form or User's Existing Bid */}
          {!isOwner && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
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
                    {/* Proposal Price */}
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

                    {/* Optional Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                      <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
                        placeholder="Add a message to the poster..."
                        value={bidMessage}
                        onChange={(e) => setBidMessage(e.target.value)}
                      />
                    </div>

                    {/* Bid Button */}
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
            </div>
          )}

          {/* User Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* User Profile */}
            <div className="flex items-center gap-4 mb-6">
              <ProfilePicture
                profilePicUrl={gig.user_id.profile_pic_url}
                name={gig.user_id.name}
                size="12"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{gig.user_id.name}</h3>
                <p className="text-gray-600">{gig.user_id.bio || 'Contractor'}</p>
              </div>
            </div>

            {/* User Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={i < (gig.user_id.rating || 0) ? 'text-yellow-400 w-5 h-5' : 'text-gray-300 w-5 h-5'}
                    fill={i < (gig.user_id.rating || 0) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="text-gray-600">{gig.user_id.rating || 0} ({gig.user_id.reviews?.length || 0} reviews)</span>
            </div>

            {/* Contact Button */}
            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mb-4">
              <MessageCircle className="inline-block w-5 h-5 mr-2" /> Contact Poster
            </button>

            {/* Share Button */}
            <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <Share2 className="inline-block w-5 h-5 mr-2" /> Share Gig
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default GigDetails;