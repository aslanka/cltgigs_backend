import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function MyGigs() {
  const [gigs, setGigs] = useState([]);
  const [selectedGigId, setSelectedGigId] = useState(null);
  const [bids, setBids] = useState([]);
  const { userData } = useContext(AuthContext);

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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Gigs</h2>
      <div className="space-y-6">
        {gigs.map((gig) => (
          <div key={gig._id} className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-start">
              <div>
                <h3 className="font-bold text-xl">{gig.title}</h3>
                <p className="text-gray-500">${gig.price}</p>
              </div>
              <div className="flex space-x-2">
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
                {bids.length === 0 ? (
                  <p>No bids yet.</p>
                ) : (
                  <div className="space-y-3">
                    {bids.map((bid) => (
                      <div key={bid._id} className="border p-3 rounded">
                        <p>
                          <strong>Bidder:</strong>{' '}
                          <Link
                            to={`/profile/${bid.user_id?._id}`}
                            className="text-blue-600 underline"
                          >
                            {bid.user_id?.name}
                          </Link>
                        </p>
                        <p>
                          <strong>Amount:</strong> ${bid.amount}
                        </p>
                        <p className="text-gray-700">{bid.message}</p>
                        <button className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">
                          Message
                        </button>
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
