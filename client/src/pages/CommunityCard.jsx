// src/pages/CommunityCard.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ProfilePicture from '../components/ProfilePicture';
import Attachment from '../components/Attachment';

function CommunityCard() {
  const { userId } = useParams();
  const { token, userData } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [certificationFiles, setCertificationFiles] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchReviews();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/users/${userId}`);
      setProfile(res.data);
      setEditedProfile(res.data);
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

    if (userData?.userId === userId) {
      setError("You cannot review yourself.");
      return;
    }

    if (newReview.rating === 0) {
      setError("Please select a rating.");
      return;
    }

    try {
      const res = await axios.post(`/reviews/user/${userId}`, newReview);
      setReviews([res.data, ...reviews]);
      setNewReview({ rating: 0, comment: '' });
      toast.success('Review submitted successfully!');
      fetchReviews();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error submitting review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter(review => review._id !== reviewId));
      toast.success('Review deleted successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProfile = async () => {
    try {
      // Exclude name from updating
      const { name, ...dataToUpdate } = editedProfile;
      const res = await axios.put(`/users/${userId}`, dataToUpdate);
      setProfile(res.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Error updating profile');
    }
  };

  const handlePortfolioUpload = async () => {
    try {
      const formData = new FormData();
      portfolioFiles.forEach((file) => {
        formData.append('portfolio', file);
      });
      const res = await axios.post(`/users/${userId}/portfolio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data);
      toast.success('Portfolio updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Error uploading portfolio');
    }
  };

  const handleCertificationUpload = async () => {
    try {
      const formData = new FormData();
      certificationFiles.forEach((file) => {
        formData.append('certifications', file);
      });
      const res = await axios.post(`/users/${userId}/certifications`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data);
      toast.success('Certifications updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Error uploading certifications');
    }
  };

  const handleRemovePortfolioItem = async (fileUrl) => {
    try {
      // Call your API to remove the portfolio item from user's portfolio
      const res = await axios.delete(`/users/${userId}/portfolio`, { data: { fileUrl } });
      setProfile(res.data);
      toast.success('Portfolio item removed successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Error removing portfolio item');
    }
  };

  const handleReportProfile = async () => {
    try {
      // Example API call to report profile
      await axios.post(`/reports`, { reportedUserId: userId });
      toast.success('Profile reported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Error reporting profile');
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings';

  if (!profile) return <div className="text-center mt-10">Loading...</div>;

  const shareProfile = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name}'s Profile`,
          text: profile.tagline || 'Check out this profile!',
          url: url
        });
      } catch (error) {
        console.error('Error sharing', error);
      }
    } else {
      toast.info(`Share this link: ${url}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      {/* Profile Header */}
      <section className="bg-white p-4 sm:p-6 text-center shadow rounded-lg">
        <ProfilePicture
          profilePicUrl={profile.profile_pic_url}
          name={profile.name}
          size="36"
          className="mx-auto mb-4 border-4 border-blue-600"
        />
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">{profile.name}</h2>
        {profile.tagline && (
          <p className="text-gray-500 mb-2">{profile.tagline}</p>
        )}
        <div className="flex justify-center items-center mb-2">
          {averageRating !== 'No ratings' ? (
            <>
              <div className="flex items-center mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`text-2xl ${
                      i < Math.round(averageRating) ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    {i < Math.round(averageRating) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <span className="text-gray-700 font-semibold ml-2">{averageRating} / 5</span>
            </>
          ) : (
            <span className="text-gray-700">No ratings yet</span>
          )}
        </div>
        <p className="text-gray-600 mb-2">{profile.bio || 'No bio available.'}</p>
        {token && userData?.userId === userId && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-2"
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        )}
        <button
          onClick={shareProfile}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mr-2"
        >
          Share Profile
        </button>
        {token && userData?.userId !== userId && (
          <button
            onClick={handleReportProfile}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Report Profile
          </button>
        )}
      </section>

      {/* Editable Sections */}
      {isEditing && token && userData?.userId === userId && (
        <section className="bg-white p-4 sm:p-6 mt-6 shadow rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>
          <div className="space-y-4">
            {/* Personal Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={editedProfile.name || ''}
                disabled
                className="mt-1 p-2 border border-gray-300 rounded w-full bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tagline</label>
              <input
                type="text"
                value={editedProfile.tagline || ''}
                onChange={(e) => setEditedProfile({ ...editedProfile, tagline: e.target.value })}
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
            </div>
            {/* ... rest of the edit form remains unchanged ... */}
            {/* Portfolio and Certifications Sections */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Portfolio</label>
              <input
                type="file"
                multiple
                onChange={(e) => setPortfolioFiles([...e.target.files])}
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
              <button
                onClick={handlePortfolioUpload}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-2"
              >
                Upload Portfolio
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Certifications</label>
              <input
                type="file"
                multiple
                onChange={(e) => setCertificationFiles([...e.target.files])}
                className="mt-1 p-2 border border-gray-300 rounded w-full"
              />
              <button
                onClick={handleCertificationUpload}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-2"
              >
                Upload Certifications
              </button>
            </div>

            <button
              onClick={handleEditProfile}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </section>
      )}

      {/* Public Profile Details */}
      <section className="bg-white p-4 sm:p-6 mt-6 shadow rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Profile Details</h2>
        {/* Display public profile details */}
        <p><strong>Location:</strong> {profile.location || 'Not specified'}</p>
        <p><strong>Service Area:</strong> {profile.service_area || 'Not specified'}</p>
        <p><strong>Services Offered:</strong> {profile.services_offered?.join(', ') || 'Not specified'}</p>
        <p><strong>Specializations:</strong> {profile.specializations?.join(', ') || 'Not specified'}</p>
        <p><strong>Experience:</strong> {profile.experience || 0} years</p>
        {/* Add more public details as needed */}
      </section>

      {/* Portfolio Section */}
      <section className="bg-white p-4 sm:p-6 mt-6 shadow rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Portfolio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {profile.portfolio?.length ? (
            profile.portfolio.map((fileUrl, index) => (
              <div key={index} className="relative group">
                <Attachment fileUrl={fileUrl} />
                {token && userData?.userId === userId && (
                  <button
                    onClick={() => handleRemovePortfolioItem(fileUrl)}
                    className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>No portfolio items yet.</p>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-white p-4 sm:p-6 mt-6 shadow rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        <div>
          {reviews.length === 0 ? (
            <p>No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-200 py-4">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center space-x-2">
                    <ProfilePicture
                      profilePicUrl={review.reviewer_id?.profile_pic_url}
                      name={review.reviewer_id?.name}
                      size="6"
                    />
                    <span className="font-medium text-blue-600">
                      {review.reviewer_id?.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={`text-2xl ${
                        i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      {i < review.rating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mb-2">{review.comment}</p>
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

        {/* Review Form */}
        {token && userData?.userId !== userId ? (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-3">Leave a Review</h3>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleReviewSubmit} className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <label className="font-medium">Rating:</label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <span
                        className={`text-3xl ${
                          hoveredRating >= star || newReview.rating >= star
                            ? 'text-yellow-500'
                            : 'text-gray-300'
                        }`}
                      >
                        {hoveredRating >= star || newReview.rating >= star ? '★' : '☆'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <textarea 
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Write your review..." 
                required 
                className="p-2 border border-gray-300 rounded resize-none h-24 w-full"
              />
              <button 
                type="submit" 
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
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
