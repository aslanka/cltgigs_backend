import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function GigDetails() {
  const { gigId } = useParams();
  const [gig, setGig] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const { token, userData } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGig();
    // eslint-disable-next-line
  }, [gigId]);

  const fetchGig = async () => {
    try {
      const res = await axios.get(`/gigs/${gigId}`);
      setGig(res.data.gig);
      setAttachments(res.data.attachments);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaceBid = async () => {
    if (!token) {
      alert('You must be logged in to bid.');
      navigate('/login');
      return;
    }
    try {
      const res = await axios.post('/bids', {
        gig_id: gigId,
        amount: bidAmount,
        message: bidMessage
      });
      alert('Bid placed successfully!');
      // go to messages
      navigate(`/messages`);
    } catch (err) {
      console.error(err);
      alert('Error placing bid');
    }
  };

  if (!gig) return <div>Loading gig...</div>;

  const isOwner = gig.user_id._id === userData?.userId;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-2xl font-bold mb-2">{gig.title}</h2>
      <p className="text-gray-600 mb-2">{gig.description}</p>
      <p className="text-blue-600 font-semibold mb-4">${gig.price}</p>
      <p className="text-sm text-gray-500 mb-2">Owner: {gig.user_id.name}</p>

      {attachments.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Attachments:</h3>
          {attachments.map((att) => (
            <img
              key={att._id}
              src={`/${att.file_url}`}
              alt="Gig"
              className="max-w-xs border mb-2"
            />
          ))}
        </div>
      )}

      {isOwner ? (
        <div className="flex space-x-2">
          <Link
            to={`/gigs/${gigId}/edit`}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Edit Gig
          </Link>
        </div>
      ) : (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Place a Bid</h3>
          <div className="mb-2">
            <label className="block font-semibold">Amount</label>
            <input
              type="number"
              className="border p-2 w-full"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold">Message</label>
            <textarea
              className="border p-2 w-full"
              rows="3"
              value={bidMessage}
              onChange={(e) => setBidMessage(e.target.value)}
            />
          </div>
          <button
            onClick={handlePlaceBid}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Bid
          </button>
        </div>
      )}
    </div>
  );
}

export default GigDetails;
