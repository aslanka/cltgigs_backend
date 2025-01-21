import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Share2, Edit, Mail, Globe, Briefcase, Award, 
  CheckCircle, MessageCircle, X, DownloadCloud, Sparkles 
} from 'lucide-react';
import { toast } from 'react-toastify';
import ProfilePicture from '../components/ProfilePicture';
import SkillBadge from '../components/SkillBadge';
import RatingChart from '../components/RatingChart';

const CommunityCard = () => {
  const { userId } = useParams();
  const { token, userData } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState(82);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          axios.get(`/users/${userId}`),
          axios.get(`/reviews/user/${userId}`)
        ]);
        setProfile(profileRes.data);
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [userId]);

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

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length || 0;

  if (!profile) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-pulse text-2xl text-gray-500">Loading profile...</div>
    </div>
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Profile Header - Yelp-style */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Smaller Profile Image */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <ProfilePicture 
              profilePicUrl={profile.profile_pic_url} 
              name={profile.name}
              size="32"
              className="border-4 border-white shadow-lg rounded-lg"
              crossOrigin="anonymous"
            />
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill={i < Math.round(averageRating) ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium text-gray-700">
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>
                {profile.tagline && (
                  <p className="text-lg text-gray-600 mt-2">{profile.tagline}</p>
                )}
              </div>
              
              {userData?.userId === userId && (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <Edit className="w-6 h-6 text-gray-600" />
                </button>
              )}
            </div>

            {/* Gamification Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <SkillBadge 
                icon={<Briefcase className="w-4 h-4" />} 
                label={`${profile.experience}+ years`} 
              />
              <SkillBadge
                icon={<CheckCircle className="w-4 h-4 text-green-500" />}
                label={`${profile.completedGigs || 0} completed`}
                className="bg-green-50"
              />
              <SkillBadge
                icon={<Sparkles className="w-4 h-4 text-purple-500" />}
                label={`Level ${Math.floor(progress/20)}`}
                className="bg-purple-50"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700">
                <MessageCircle className="w-5 h-5" />
                Contact
              </button>
              <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>

            {/* Profile Details */}
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-500" />
                <span>{profile.location || 'Remote'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-500" />
                <span>{profile.experience} years experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <section className="mt-8 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {profile.portfolio?.map((fileUrl, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden">
                <img
                  src={fileUrl}
                  alt={`Portfolio item ${index + 1}`}
                  className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                  crossOrigin="anonymous"
                />
                {userData?.userId === userId && (
                  <button
                    onClick={() => handleDeleteReview(fileUrl)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white shadow-sm"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mt-8 border-t pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Reviews</h2>
            <div className="flex items-center gap-2">
              <RatingChart reviews={reviews} />
            </div>
          </div>

          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="p-4 bg-gray-50 rounded-lg relative">
                <div className="flex items-center gap-4 mb-3">
                  <ProfilePicture 
                    profilePicUrl={review.reviewer_id?.profile_pic_url} 
                    name={review.reviewer_id?.name}
                    size="10"
                    crossOrigin="anonymous"
                  />
                  <div>
                    <h4 className="font-medium">{review.reviewer_id?.name}</h4>
                    <div className="flex items-center gap-1 text-yellow-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">{review.comment}</p>
                
                {(userData?.userId === review.reviewer_id?._id || userData?.userId === userId) && (
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="absolute top-4 right-4 p-1 hover:bg-gray-200 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Review Form */}
          {token && userData?.userId !== userId && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-xl font-bold mb-6">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className={`p-2 rounded-lg transition-colors ${
                          (hoveredRating >= star || newReview.rating >= star) 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Star className="w-6 h-6" />
                      </button>
                    ))}
                  </div>
                  <span className="text-gray-500">
                    {hoveredRating || newReview.rating} Star Rating
                  </span>
                </div>

                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your experience..."
                  className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Submit Review
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
};

export default CommunityCard;