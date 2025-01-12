import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function MyGigs() {
  const [gigs, setGigs] = useState([]);
  const [selectedGigId, setSelectedGigId] = useState(null);
  const [bids, setBids] = useState([]);
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyGigs();
  }, []);

  const fetchMyGigs = async () => {
    try {
      const res = await axios.get('/gigs/mygigs/owner');
      setGigs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const viewBids = async (gigId) => {
    setSelectedGigId(gigId);
    try {
      const res = await axios.get(`/bids/${gigId}`);
      setBids(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessage = (bid) => {
    const conversationId = bid.conversationId;
    navigate(`/messages/conversation/${conversationId}`);
  };

  const handleAcceptBid = async (bidId) => {
    try {
      await axios.post(`/bids/${bidId}/accept`);
      alert('Bid accepted');
      viewBids(selectedGigId); // refresh bids
    } catch (err) {
      console.error(err);
      alert('Error accepting bid');
    }
  };

  const handleDenyBid = async (bidId) => {
    try {
      await axios.post(`/bids/${bidId}/deny`);
      alert('Bid denied');
      viewBids(selectedGigId); // refresh bids
    } catch (err) {
      console.error(err);
      alert('Error denying bid');
    }
  };

  const handleUndenyBid = async (bidId) => {
    try {
      await axios.post(`/bids/${bidId}/undeny`);
      alert('Bid undenied');
      viewBids(selectedGigId); // refresh bids
    } catch (err) {
      console.error(err);
      alert('Error undenying bid');
    }
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

  // Sort bids so that accepted bid appears first
  const sortedBids = [...bids].sort((a, b) => (b.accepted ? 1 : 0) - (a.accepted ? 1 : 0));

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Gigs</h2>
      <div className="space-y-6">
        {gigs.map((gig) => (
          <div key={gig._id} className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h3 className="font-bold text-xl">{gig.title}</h3>
                <p className="text-gray-500">${gig.price}</p>
              </div>
              <div className="flex space-x-2 mt-2 sm:mt-0">
                <Link
                  to={`/gigs/${gig._id}/edit`}
                  className="px-3 py-1 border rounded hover:bg-gray-50"
                >
                  Edit
                </Link>
                <button
                  onClick={() => viewBids(gig._id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  View Bids
                </button>
              </div>
            </div>
            {selectedGigId === gig._id && (
              <div className="p-4">
                <h4 className="font-semibold mb-2">Bids:</h4>
                {sortedBids.length === 0 ? (
                  <p>No bids yet.</p>
                ) : (
                  <div className="space-y-3">
                    {sortedBids.map((bid) => (
                      <div
                        key={bid._id}
                        className={`border p-3 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between ${
                          bid.accepted ? 'bg-gray-200' : bid.rejected ? 'bg-gray-100' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          {bid.user_id?.profile_pic_url ? (
                            <img
                              src={bid.user_id.profile_pic_url}
                              alt={bid.user_id.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold">
                              {bid.user_id?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <p>
                              <strong>Bidder:</strong>{' '}
                              <Link
                                to={`/profile/${bid.user_id?._id}`}
                                className="text-blue-600 underline"
                              >
                                {bid.user_id?.name || 'Unknown'}
                              </Link>
                            </p>
                            {bid.user_id?.rating && renderStarRating(bid.user_id.rating)}
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-0 sm:text-right">
                          <p>
                            <strong>Amount:</strong> ${bid.amount}
                          </p>
                          <p className="text-gray-700">{bid.message}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {!bid.accepted && !bid.rejected && (
                              <>
                                <button
                                  onClick={() => handleAcceptBid(bid._id)}
                                  className="bg-green-600 text-white px-3 py-1 rounded"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleDenyBid(bid._id)}
                                  className="bg-red-600 text-white px-3 py-1 rounded"
                                >
                                  Deny
                                </button>
                              </>
                            )}
                            {bid.rejected && (
                              <button
                                onClick={() => handleUndenyBid(bid._id)}
                                className="bg-yellow-600 text-white px-3 py-1 rounded"
                              >
                                Undeny
                              </button>
                            )}
                            {!bid.accepted && (
                              <button
                                onClick={() => handleMessage(bid)}
                                className="bg-blue-600 text-white px-3 py-1 rounded"
                              >
                                Message
                              </button>
                            )}
                            {bid.accepted && (
                              <p className="text-green-600 font-bold">
                                Accepted {bid.user_id.name}'s bid
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyGigs;
