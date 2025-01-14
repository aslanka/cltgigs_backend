import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function BidsPage() {
  const [bids, setBids] = useState([]);
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    try {
      const res = await axios.get('/bids/my');
      setBids(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessage = (conversationId) => {
    if (!conversationId) {
      console.error('No conversationId found for this bid');
      return;
    }
    navigate(`/messages/${conversationId}`);
  };

  const renderStarRating = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) stars.push(<span key={i} className="text-yellow-400">★</span>);
      else stars.push(<span key={i} className="text-gray-300">★</span>);
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Your Bids</h2>
      {bids.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>You haven't placed any bids yet.</p>
          <Link to="/gigs" className="text-blue-600 hover:underline">
            Explore gigs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <div
              key={bid._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-4">
                {/* Gig Details */}
                <Link to={`/gigs/${bid.gig_id._id}`} className="block">
                  <h3 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                    {bid.gig_id.title}
                  </h3>
                  <p className="text-gray-600 mt-1">${bid.gig_id.price}</p>
                </Link>

                {/* Bid Details */}
                <div className="mt-4">
                  <p className="text-gray-700">
                    <span className="font-semibold">Your Bid:</span> ${bid.amount}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{bid.message}</p>
                </div>

                {/* Gig Owner Details */}
                <div className="mt-4 flex items-center space-x-3">
                  {bid.gig_id.user_id?.profile_pic_url ? (
                    <img
                      src={bid.gig_id.user_id.profile_pic_url}
                      alt={bid.gig_id.user_id.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold">
                      {bid.gig_id.user_id?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {bid.gig_id.user_id?.name || 'Unknown'}
                    </p>
                    {bid.gig_id.user_id?.rating && renderStarRating(bid.gig_id.user_id.rating)}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleMessage(bid.conversation_id)}
                    className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Message
                  </button>
                  <Link
                    to={`/gigs/${bid.gig_id._id}`}
                    className="flex-1 text-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Gig
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BidsPage;