import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function MyBids() {
  const { userData } = useContext(AuthContext);
  const [bids, setBids] = useState([]);
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

  const handleMessage = (bid) => {
    if (bid.conversationId) {
      navigate(`/messages/${bid.conversationId}`);
    } else {
      alert('No active conversation for this bid.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Bids</h2>
      {bids.length === 0 ? (
        <p>You haven't placed any bids yet.</p>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <div key={bid._id} className="border p-4 rounded-lg bg-white shadow">
              <h3 className="font-semibold text-lg">
                Gig: {bid.gig_id?.title || 'Unknown'}
              </h3>
              <p>
                <strong>Amount:</strong> ${bid.amount}
              </p>
              <p>{bid.message}</p>
              {bid.accepted ? (
                <p className="text-green-600 font-bold">Bid Accepted - Moved On</p>
              ) : (
                <button
                  onClick={() => handleMessage(bid)}
                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Message
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBids;
