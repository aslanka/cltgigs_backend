import React, { useState, useContext } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

function BidForm() {
  const { gigId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await axios.post('/bids', {
        gig_id: gigId,
        amount,
        message
      });
      alert('Bid placed successfully!');
      // maybe navigate to messages
      navigate(`/messages/${res.data.conversationId}`);
    } catch (err) {
      console.error(err);
      alert('Error placing bid.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Place Bid</h2>
      <div className="mb-2">
        <label className="block font-semibold">Amount</label>
        <input
          type="number"
          className="border w-full p-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
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
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit Bid
      </button>
    </div>
  );
}

export default BidForm;
