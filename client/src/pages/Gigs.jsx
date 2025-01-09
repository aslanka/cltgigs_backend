import React, { useEffect, useState, useContext } from "react";
import axios from "../api/axiosInstance";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Gigs() {
  const { userData } = useContext(AuthContext);
  const [gigs, setGigs] = useState([]);
  const [selectedGig, setSelectedGig] = useState(null);
  const [showBidModal, setShowBidModal] = useState(false);
  // Bid form
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [bidFile, setBidFile] = useState(null);

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      const res = await axios.get("/gigs");
      setGigs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openBidModal = (gig) => {
    setSelectedGig(gig);
    setShowBidModal(true);
  };

  const closeBidModal = () => {
    setShowBidModal(false);
    setSelectedGig(null);
    setBidAmount("");
    setBidMessage("");
    setBidFile(null);
  };

  const handleBidSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("gig_id", selectedGig._id);
      formData.append("amount", bidAmount);
      formData.append("messageContent", bidMessage);
      if (bidFile) {
        formData.append("bidAttachment", bidFile);
      }

      const res = await axios.post("/bids", formData);
      alert("Bid placed successfully!");
      closeBidModal();
    } catch (err) {
      console.error(err);
      alert("Error placing bid");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">All Gigs</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gigs.map((gig) => {
          const isOwner = gig.user_id === userData?.userId;
          return (
            <div key={gig._id} className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold">{gig.title}</h3>
              <p>{gig.description}</p>
              <p className="text-gray-500">Price: ${gig.price}</p>
              <div className="mt-2 flex space-x-2">
                {isOwner ? (
                  <>
                    <Link
                      to={`/gigs/${gig._id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Edit Gig
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openBidModal(gig)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Place Bid
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bid Modal */}
      {showBidModal && selectedGig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">
              Bid on: {selectedGig.title}
            </h2>
            <div className="mb-2">
              <label className="block font-semibold">Amount ($)</label>
              <input
                type="number"
                className="border w-full p-2"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="block font-semibold">Message</label>
              <textarea
                className="border w-full p-2"
                rows="3"
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="block font-semibold">Attachment (optional)</label>
              <input
                type="file"
                onChange={(e) => setBidFile(e.target.files[0])}
              />
            </div>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={handleBidSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Submit Bid
              </button>
              <button
                onClick={closeBidModal}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gigs;
