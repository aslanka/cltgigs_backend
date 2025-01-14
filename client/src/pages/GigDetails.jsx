import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from '../api/axiosInstance';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import DOMPurify from 'dompurify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEdit, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

function GigDetails() {
  const { gigId } = useParams();
  const [gig, setGig] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedPrice, setEditedPrice] = useState('');
  const { token, userData } = useContext(AuthContext);
  const navigate = useNavigate();

  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const priceRef = useRef(null);

  useEffect(() => {
    const fetchGig = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/gigs/${gigId}`);
        setGig(res.data.gig);
        setAttachments(res.data.attachments);
        setEditedTitle(res.data.gig.title);
        setEditedDescription(res.data.gig.description);
        setEditedPrice(res.data.gig.price);

        // If the user is the gig owner, fetch the bids
        if (token && res.data.gig.user_id._id === userData?.userId) {
          fetchBids();
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load gig details.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBids = async () => {
      try {
        const bidsRes = await axios.get(`/bids/${gigId}`);
        setBids(bidsRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load bids.');
      }
    };

    fetchGig();
  }, [gigId, token, userData]);

  const handlePlaceBid = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      alert('Please enter a valid bid amount.');
      return;
    }

    setIsPlacingBid(true);
    setError(null);
    setBidSuccess(false);

    try {
      const res = await axios.post('/bids', {
        gig_id: gigId,
        amount: bidAmount,
        message: bidMessage,
      });
      setBidSuccess(true);
      setBidAmount('');
      setBidMessage('');
      navigate(`/messages/${res.data.conversationId}`);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || 'Error placing bid';
      setError(errorMessage);
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(`/gigs/${gigId}`, {
        title: editedTitle,
        description: editedDescription,
        price: editedPrice,
      });
      setGig(res.data.gig); // Update the gig data
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError('Failed to update gig.');
    }
  };

  const handleCancel = () => {
    setEditedTitle(gig.title);
    setEditedDescription(gig.description);
    setEditedPrice(gig.price);
    setIsEditing(false);
  };

  const sanitizeDescription = (description) => ({
    __html: DOMPurify.sanitize(description),
  });

  const handleInputChange = (ref, setter) => () => {
    setter(ref.current.innerText);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <span className="ml-2">Loading gig...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!gig) {
    return <div className="p-4">Gig not found.</div>;
  }

  const isOwner = gig.user_id._id === userData?.userId;

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
      {/* Title */}
      {isOwner && isEditing ? (
        <div
          ref={titleRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onBlur={handleInputChange(titleRef, setEditedTitle)}
          className="text-3xl font-bold text-gray-800 mb-4 focus:outline-none"
        >
          {editedTitle}
        </div>
      ) : (
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{gig.title}</h1>
      )}

      {/* Poster Info */}
      <div className="flex items-center mb-4">
        <Link to={`/communitycard/${gig.user_id._id}`}>
          <img
            src={gig.user_id.profile_pic_url || '/placeholder-profile.jpg'}
            alt={gig.user_id.name}
            className="w-12 h-12 rounded-full mr-4"
          />
        </Link>
        <div>
          <Link to={`/communitycard/${gig.user_id._id}`}>
            <p className="text-lg font-semibold text-gray-700 hover:underline">
              {gig.user_id.name}
            </p>
          </Link>
          <p className="text-sm text-gray-500">
            Rating: {gig.user_id.rating || 'N/A'}
          </p>
        </div>
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Attachments:</h3>
          {attachments.map((att) => (
            <img
              key={att._id}
              src={att.file_url}
              alt="Gig attachment"
              className="max-w-full h-auto border mb-2 rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Description */}
      {isOwner && isEditing ? (
        <div
          ref={descriptionRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onBlur={handleInputChange(descriptionRef, setEditedDescription)}
          className="text-gray-600 mb-4 focus:outline-none"
        >
          {editedDescription}
        </div>
      ) : (
        <div
          className="text-gray-600 mb-4"
          dangerouslySetInnerHTML={sanitizeDescription(gig.description)}
        />
      )}

      {/* Price */}
      {isOwner && isEditing ? (
        <div
          ref={priceRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onBlur={handleInputChange(priceRef, setEditedPrice)}
          className="text-xl font-bold text-blue-600 mb-6 focus:outline-none"
        >
          ${editedPrice}
        </div>
      ) : (
        <p className="text-xl font-bold text-blue-600 mb-6">${gig.price}</p>
      )}

      {/* Owner Controls */}
      {isOwner && (
        <div className="mb-6">
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Edit Gig
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
              >
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Cancel
              </button>
            </>
          )}
        </div>
      )}

      {/* Bids (for Gig Owner) */}
      {isOwner && bids.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Bids on this Gig:</h3>
          <ul>
            {bids.map((bid) => (
              <li key={bid._id} className="border-b py-2">
                <span className="font-medium">
                  {bid.user_id.name}
                </span>
                : ${bid.amount}
                {bid.message && (
                  <p className="text-gray-600 text-sm mt-1">{bid.message}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bid Placement (for Non-Owners) */}
      {!isOwner && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Place a Bid
          </h2>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {bidSuccess && (
            <div className="text-green-500 mb-2">Bid placed successfully!</div>
          )}

          <div className="mb-4">
            <label
              htmlFor="bidAmount"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Amount ($)
            </label>
            <input
              type="number"
              id="bidAmount"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="bidMessage"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Message (Optional)
            </label>
            <textarea
              id="bidMessage"
              rows="4"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={bidMessage}
              onChange={(e) => setBidMessage(e.target.value)}
            />
          </div>

          <button
            onClick={handlePlaceBid}
            disabled={isPlacingBid}
            className={`${
              isPlacingBid
                ? 'bg-green-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
          >
            {isPlacingBid ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Placing Bid...
              </>
            ) : (
              'Place Bid'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default GigDetails;