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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">My Gigs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gigs.map((gig) => (
          <div key={gig._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{gig.title}</h3>
              <p className="text-gray-600 mb-4">${gig.price}</p>
              <div className="flex space-x-2">
                <Link
                  to={`/gigs/${gig._id}/edit`}
                  className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Edit
                </Link>
                <button
                  onClick={() => viewBids(gig._id)}
                  className="flex-1 text-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  View Bids
                </button>
              </div>
            </div>

            {selectedGigId === gig._id && (
              <div className="p-6 border-t">
                <h4 className="text-lg font-semibold mb-4">Bids</h4>
                {bids.length === 0 ? (
                  <p className="text-gray-500">No bids yet.</p>
                ) : (
                  <div className="space-y-4">
                    {bids.map((bid) => (
                      <div
                        key={bid._id}
                        className="p-4 bg-gray-50 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between"
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
                            <p className="font-semibold">
                              <Link
                                to={`/profile/${bid.user_id?._id}`}
                                className="text-blue-600 hover:underline"
                              >
                                {bid.user_id?.name || 'Unknown'}
                              </Link>
                            </p>
                            {bid.user_id?.rating && renderStarRating(bid.user_id.rating)}
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:text-right">
                          <p className="text-gray-700">${bid.amount}</p>
                          <p className="text-sm text-gray-500">{bid.message}</p>
                          <button
                            onClick={() => handleMessage(bid)}
                            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                          >
                            Message
                          </button>
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