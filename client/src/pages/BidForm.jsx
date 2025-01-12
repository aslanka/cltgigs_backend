import React, { useState, useContext, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function BidForm() {
  const { gigId } = useParams();
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [gigData, setGigData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gigId) {
      setError('Gig ID is missing.');
      setLoading(false);
      return;
    }
    // Fetch gig details
    axios.get(`/gigs/${gigId}`)
      .then(res => {
        setGigData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Error fetching gig details.');
        setLoading(false);
      });
  }, [gigId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please log in to place a bid.');
      navigate('/login');
      return;
    }
    if (!gigId) {
      toast.error('Gig ID is missing.');
      return;
    }
    if (!amount) {
      toast.error('Amount is required.');
      return;
    }
    if (parseFloat(amount) <= 0) {
      toast.error('Amount must be a positive number.');
      return;
    }
    try {
      const res = await axios.post('/bids', {
        gig_id: gigId,
        amount,
        message
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Bid placed successfully!');
      navigate(`/messages/${res.data.conversationId}`);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error('Error placing bid.');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!gigData) {
    return <div>Gig not found.</div>;
  }

  // Prevent bidding on your own gig
  if (gigData.user_id.toString() === user._id.toString()) {
    return (
      <div className="max-w-md mx-auto mt-6 p-4 bg-white shadow rounded">
        <h2 className="text-xl font-bold mb-4">Place Bid</h2>
        <p>You cannot bid on your own gig.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-6 p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Place Bid</h2>
      <p className="mb-4">{gigData.title}</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="block font-semibold">Amount</label>
          <input
            type="number"
            className="border w-full p-2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="mb-2">
          <label className="block font-semibold">Message</label>
          <textarea
            className="border w-full p-2"
            rows="3"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit Bid
        </button>
      </form>
    </div>
  );
}

export default BidForm;