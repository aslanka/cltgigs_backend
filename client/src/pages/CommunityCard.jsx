import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';

function CommunityCard() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

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
    try {
      const res = await axios.post(`/reviews/user/${userId}`, newReview);
      setReviews([res.data, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Profile Header */}
      <section className="bg-white p-6 text-center shadow">
        <img 
          src={profile.profile_pic_url || 'https://via.placeholder.com/150'} 
          alt="Profile" 
          className="w-36 h-36 rounded-full mx-auto mb-4 border-4 border-blue-600 object-cover" 
        />
        <h2 className="text-3xl font-bold mb-2">{profile.name}</h2>
        <p className="text-gray-600 mb-2">{profile.bio || 'No bio available.'}</p>
        <p className="text-gray-500 mb-2">{profile.location || 'Location not specified'}</p>
        {/* Additional details like category, price, etc. can go here */}
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
                  <span className="font-medium">{review.reviewer_id?.name || 'Anonymous'}</span>
                  <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
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
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Review Form */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Leave a Review</h3>
          <form onSubmit={handleReviewSubmit} className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <label className="font-medium">Rating:</label>
              {/* Star rating input */}
              {[5,4,3,2,1].map((star) => (
                <React.Fragment key={star}>
                  <input 
                    type="radio" 
                    id={`star${star}`} 
                    name="rating" 
                    value={star} 
                    checked={newReview.rating === star} 
                    onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })} 
                    className="hidden" 
                  />
                  <label htmlFor={`star${star}`} className="cursor-pointer">
                    <i className={`fas fa-star text-${newReview.rating >= star ? 'yellow-500' : 'gray-300'} text-2xl`}></i>
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
      </section>
    </div>
  );
}

export default CommunityCard;
