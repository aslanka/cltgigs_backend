import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Share2, Edit, Mail, Globe, Briefcase, Award, 
  CheckCircle, MessageCircle, X, DownloadCloud, Sparkles, Link2, Plus,
  Image as ImageIcon, Trash2, ExternalLink, User
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
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);
  const [newLink, setNewLink] = useState({ type: 'website', url: '' });
  const [portfolioFile, setPortfolioFile] = useState(null);

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

  const handlePortfolioUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('portfolio', portfolioFile);
    
    try {
      const res = await axios.put(`/users/${userId}/portfolio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile({ ...profile, portfolio: res.data.portfolio });
      setIsUploadingPortfolio(false);
      toast.success('Portfolio image uploaded!');
    } catch (err) {
      console.error(err);
      toast.error('Error uploading image');
    }
  };

  const handleDeletePortfolioItem = async (fileUrl) => {
    try {
      await axios.delete(`/users/${userId}/portfolio`, { data: { fileUrl } });
      setProfile({ ...profile, portfolio: profile.portfolio.filter(item => item !== fileUrl) });
      toast.success('Portfolio item removed');
    } catch (err) {
      console.error(err);
      toast.error('Error removing item');
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newLink.url.match(/^(http|https):\/\//)) {
      setError("Please enter a valid URL starting with http:// or https://");
      return;
    }
    
    try {
      const res = await axios.put(`/users/${userId}/links`, newLink);
      setProfile({ ...profile, links: [...profile.links, res.data] });
      setNewLink({ type: 'website', url: '' });
      setIsEditingLinks(false);
      toast.success('Link added successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error adding link');
    }
  };

  const handleDeleteLink = async (linkId) => {
    try {
      await axios.delete(`/users/${userId}/links/${linkId}`);
      setProfile({ ...profile, links: profile.links.filter(link => link._id !== linkId) });
      toast.success('Link removed successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Error removing link');
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Profile Section */}
          <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg relative">
              <ProfilePicture 
                profilePicUrl={profile.profile_pic_url} 
                name={profile.name}
                size="full"
                className="rounded-xl aspect-square object-cover shadow-inner"
              />
              
              {userData?.userId === userId && (
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md"
                >
                  <Edit className="w-5 h-5 text-gray-700" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Link 
                to={`/messages/${userId}`}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contact</span>
              </Link>
              <button className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200">
                <Share2 className="w-5 h-5" />
                <span>Share Profile</span>
              </button>
            </div>

            {/* Profile Details */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <span>{profile.location || 'Remote'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  <span>{profile.experience} years experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-gray-500" />
                  <span>Level {Math.floor(profile.xp / 1000)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full space-y-8">
            {/* Profile Info */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
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
              </div>

              {/* Skills & Badges */}
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
                  label={`Level ${Math.floor(profile.xp / 1000)}`}
                  className="bg-purple-50"
                />
              </div>

              {/* Bio Section */}
              {isEditing ? (
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="w-full p-3 border rounded-lg mb-4"
                  placeholder="Update your bio..."
                />
              ) : (
                <p className="text-gray-600 mb-6">{profile.bio || 'No bio provided'}</p>
              )}
            </div>

            {/* Portfolio Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Portfolio</h2>
                {userData?.userId === userId && (
                  <button 
                    onClick={() => setIsUploadingPortfolio(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Plus className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profile.portfolio?.map((item, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={item}
                      alt={`Portfolio item ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    />
                    {userData?.userId === userId && (
                      <button
                        onClick={() => handleDeletePortfolioItem(item)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white"
                      >
                        <X className="w-5 h-5 text-red-600" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Links Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Links</h2>
                {userData?.userId === userId && (
                  <button 
                    onClick={() => setIsEditingLinks(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Plus className="w-5 h-5 text-gray-600" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.links?.map((link) => (
                  <div key={link._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {renderLinkIcon(link.type)}
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {new URL(link.url).hostname}
                      </a>
                    </div>
                    {userData?.userId === userId && (
                      <button 
                        onClick={() => handleDeleteLink(link._id)}
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Reviews</h2>
                <RatingChart reviews={reviews} />
              </div>

              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="p-4 bg-gray-50 rounded-lg relative">
                    <div className="flex items-center gap-4 mb-3">
                      <ProfilePicture 
                        profilePicUrl={review.reviewer_id?.profile_pic_url} 
                        name={review.reviewer_id?.name}
                        size="10"
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
            </div>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {/* Add Link Modal */}
          {isEditingLinks && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Add New Link</h3>
                  <button
                    onClick={() => setIsEditingLinks(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddLink} className="space-y-4">
                  <select
                    value={newLink.type}
                    onChange={(e) => setNewLink({ ...newLink, type: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg"
                  >
                    <option value="website">Website</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="social">Social Media</option>
                    <option value="other">Other</option>
                  </select>

                  <input
                    type="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full p-3 border border-gray-200 rounded-lg"
                    required
                  />

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg"
                    >
                      Add Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingLinks(false)}
                      className="px-6 py-2 border border-gray-200 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Upload Portfolio Modal */}
          {isUploadingPortfolio && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Upload Portfolio Image</h3>
                  <button
                    onClick={() => setIsUploadingPortfolio(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handlePortfolioUpload} className="space-y-4">
                  <input
                    type="file"
                    onChange={(e) => setPortfolioFile(e.target.files[0])}
                    accept="image/*"
                    className="w-full p-3 border border-gray-200 rounded-lg"
                    required
                  />

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg"
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsUploadingPortfolio(false)}
                      className="px-6 py-2 border border-gray-200 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CommunityCard;