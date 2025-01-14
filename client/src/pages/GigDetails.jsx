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
        setAttachments(res.data.attachments || []);
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

  const handleEditClick = () => setIsEditing(true);

  const handleSave = async () => {
    try {
      const res = await axios.put(`/gigs/${gigId}`, {
        title: editedTitle,
        description: editedDescription,
        price: editedPrice,
      });
      setGig(res.data.gig);
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
      <div className="flex justify-center items-center p-6">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-600" />
        <span className="ml-3 text-lg">Loading gig...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  }

  if (!gig) {
    return <div className="p-4 text-center">Gig not found.</div>;
  }

  const isOwner = gig.user_id._id === userData?.userId;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 lg:p-8 my-6">
      {/* Gig Title Section */}
      <div className="mb-6">
        {isOwner && isEditing ? (
          <div
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleInputChange(titleRef, setEditedTitle)}
            className="text-2xl sm:text-3xl font-bold text-gray-900 border-b pb-2 focus:outline-none"
            aria-label="Edit gig title"
          >
            {editedTitle}
          </div>
        ) : (
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{gig.title}</h1>
        )}
      </div>

      {/* Poster Info */}
      <div className="flex items-center space-x-4 mb-6">
        <Link to={`/communitycard/${gig.user_id._id}`} className="flex-shrink-0">
          <img
            src={gig.user_id.profile_pic_url || '/placeholder-profile.jpg'}
            alt={gig.user_id.name}
            className="w-14 h-14 rounded-full object-cover"
          />
        </Link>
        <div>
          <Link to={`/communitycard/${gig.user_id._id}`}>
            <p className="text-lg font-semibold text-blue-600 hover:underline">{gig.user_id.name}</p>
          </Link>
          <p className="text-sm text-gray-500">Rating: {gig.user_id.rating || 'N/A'}</p>
        </div>
      </div>

      {/* Attachments Carousel */}
      {attachments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Attachments</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {attachments.map((att) => (
              <img
                key={att._id}
                src={att.file_url}
                alt="Attachment"
                className="w-full h-48 object-cover rounded-lg border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Gig Description */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        {isOwner && isEditing ? (
          <div
            ref={descriptionRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleInputChange(descriptionRef, setEditedDescription)}
            className="p-2 border rounded text-gray-700 focus:outline-none"
            aria-label="Edit gig description"
          >
            {editedDescription}
          </div>
        ) : (
          <div
            className="prose prose-blue max-w-none"
            dangerouslySetInnerHTML={sanitizeDescription(gig.description)}
          />
        )}
      </section>

      {/* Price Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Price</h2>
        {isOwner && isEditing ? (
          <div
            ref={priceRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleInputChange(priceRef, setEditedPrice)}
            className="text-2xl font-bold text-green-600 focus:outline-none"
            aria-label="Edit gig price"
          >
            ${editedPrice}
          </div>
        ) : (
          <p className="text-2xl font-bold text-green-600">${gig.price}</p>
        )}
      </section>

      {/* Owner Edit Controls */}
      {isOwner && (
        <div className="flex space-x-4 mb-6">
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit Gig
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <FontAwesomeIcon icon={faCheck} className="mr-2" /> Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" /> Cancel
              </button>
            </>
          )}
        </div>
      )}

      {/* Bids Section for Owner */}
      {isOwner && bids.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Bids Received</h2>
          <ul className="space-y-4">
            {bids.map((bid) => (
              <li key={bid._id} className="p-4 border rounded-lg hover:shadow-md">
                <p className="font-medium text-gray-800">{bid.user_id.name} bid ${bid.amount}</p>
                {bid.message && <p className="text-gray-600 mt-1">{bid.message}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Bid Placement for Non-Owners */}
      {!isOwner && (
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Place a Bid</h2>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {bidSuccess && <div className="text-green-500 mb-2">Bid placed successfully!</div>}

          <div className="mb-4">
            <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              id="bidAmount"
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="bidMessage" className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              id="bidMessage"
              rows="4"
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={bidMessage}
              onChange={(e) => setBidMessage(e.target.value)}
            />
          </div>

          <button
            onClick={handlePlaceBid}
            disabled={isPlacingBid}
            className={`w-full flex justify-center items-center px-4 py-2 rounded text-white font-semibold focus:outline-none focus:ring-2 ${
              isPlacingBid
                ? 'bg-green-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            }`}
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
        </section>
      )}
    </div>
  );
}

export default GigDetails;
