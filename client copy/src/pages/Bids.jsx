import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useParams } from "react-router-dom";

function Bids() {
  const { gigId } = useParams();
  const [bids, setBids] = useState([]);
  const [amount, setAmount] = useState("");
  const [bidAttachment, setBidAttachment] = useState(null);

  useEffect(() => {
    fetchBids();
    // eslint-disable-next-line
  }, [gigId]);

  const fetchBids = async () => {
    try {
      const res = await axios.get(`/bids/${gigId}`);
      setBids(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBid = async () => {
    try {
      const formData = new FormData();
      formData.append("gig_id", gigId);
      formData.append("amount", amount);
      if (bidAttachment) {
        formData.append("bidAttachment", bidAttachment);
      }
      await axios.post("/bids", formData);
      alert("Bid created!");
      setAmount("");
      setBidAttachment(null);
      fetchBids();
    } catch (err) {
      console.error(err);
      alert("Error creating bid");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow space-y-4">
      <h2 className="text-xl font-semibold">Bids for Gig</h2>
      <div className="space-y-2">
        {bids.map((bid) => (
          <div key={bid._id} className="border p-2 rounded">
            <p>Amount: ${bid.amount}</p>
            <p>Bidder: {bid.user_id}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <h3 className="font-bold mb-2">Place a new bid</h3>
        <input
          type="text"
          placeholder="Bid amount"
          value={amount}
          className="border w-full p-2 mb-2"
          onChange={(e) => setAmount(e.target.value)}
        />
        <div>
          <label className="block">Attachment (optional)</label>
          <input
            type="file"
            onChange={(e) => setBidAttachment(e.target.files[0])}
          />
        </div>
        <button
          onClick={handleCreateBid}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
        >
          Submit Bid
        </button>
      </div>
    </div>
  );
}

export default Bids;
