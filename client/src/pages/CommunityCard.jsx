import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';

function CommunityCard() {
  const { userId } = useParams();
  const { token, userData } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchReviews();
    // eslint-disable-next-line
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/users/${userId}`);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/reviews/user/${userId}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Prevent self-review
    if (userData?.userId === userId) {
      setError("You cannot review yourself.");
      return;
    }

    try {
      const res = await axios.post(`/reviews/user/${userId}`, newReview);
      setReviews([res.data, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error submitting review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter(review => review._id !== reviewId));
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings';

  if (!profile) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Profile Header */}
      <section className="bg-white p-6 text-center shadow">
        <img 
          src={profile.profile_pic_url || 'https://via.placeholder.com/150'} 
          alt={`${profile.name} Profile`} 
          className="w-36 h-36 rounded-full mx-auto mb-4 border-4 border-blue-600 object-cover" 
        />
        <h2 className="text-3xl font-bold mb-2">{profile.name}</h2>
        {profile.location && (
          <p className="text-gray-500 mb-2">{profile.location}</p>
        )}
        {/* Display average rating */}
        <div className="flex justify-center items-center mb-2">
          {averageRating !== 'No ratings' ? (
            <>
              <div className="flex items-center text-yellow-500 mr-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <i 
                    key={i} 
                    className={`fas fa-star ${i < Math.round(averageRating) ? '' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-gray-700 font-semibold">{averageRating} / 5</span>
            </>
          ) : (
            <span className="text-gray-700">No ratings yet</span>
          )}
        </div>
        <p className="text-gray-600 mb-2">{profile.bio || 'No bio available.'}</p>
      </section>

      {/* Description Section */}
      <section className="bg-white p-6 mt-6 max-w-3xl mx-auto shadow rounded">
        <h2 className="text-2xl font-semibold mb-4">About Me</h2>
        <p className="text-gray-700 leading-relaxed">
          {profile.bio || 'No description available.'}
        </p>
      </section>

      {/* Reviews Section */}
      <section className="bg-white p-6 mt-6 max-w-3xl mx-auto shadow rounded">
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        <div>
          {reviews.length === 0 ? (
            <p>No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-200 py-4">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center space-x-2">
                    {review.reviewer_id?.profile_pic_url ? (
                      <img 
                        src={review.reviewer_id.profile_pic_url} 
                        alt={review.reviewer_id.name} 
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs text-white">
                        {review.reviewer_id?.name ? review.reviewer_id.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <span className="font-medium text-blue-600">
                      {review.reviewer_id?.name || 'Anonymous'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  {/* Render star rating */}
                  {Array.from({ length: 5 }, (_, i) => (
                    <i 
                      key={i} 
                      className={`fas fa-star ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-2">{review.comment}</p>
                {/* Show delete option if current user owns the review */}
                {token && userData?.userId === review.reviewer_id?._id && (
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Delete Review
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Review Form */}
        {token && userData?.userId !== userId ? (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-3">Leave a Review</h3>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleReviewSubmit} className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <label className="font-medium">Rating:</label>
                {/* Interactive Star Rating Input */}
                {[5,4,3,2,1].map((star) => (
                  <React.Fragment key={star}>
                    <input 
                      type="radio" 
                      id={`star${star}`} 
                      name="rating" 
                      value={star} 
                      checked={newReview.rating === star} 
                      onChange={() => setNewReview({ ...newReview, rating: star })} 
                      className="hidden" 
                    />
                    <label 
                      htmlFor={`star${star}`} 
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                    >
                      <i 
                        className={`fas fa-star text-2xl ${
                          hoveredRating >= star || newReview.rating >= star 
                            ? 'text-yellow-500' 
                            : 'text-gray-300'
                        }`}
                      ></i>
                    </label>
                  </React.Fragment>
                ))}
              </div>
              <textarea 
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Write your review..." 
                required 
                className="p-2 border border-gray-300 rounded resize-none h-24"
              />
              <button 
                type="submit" 
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 self-start"
              >
                Submit Review
              </button>
            </form>
          </div>
        ) : !token ? (
          <p className="mt-6 text-center text-gray-600">
            Please log in to leave a review.
          </p>
        ) : null}
      </section>
    </div>
  );
}

export default CommunityCard;
