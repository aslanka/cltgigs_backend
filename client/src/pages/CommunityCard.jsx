import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  Star, Share2, Edit, Mail, Globe, Briefcase, Award, 
  CheckCircle, MessageCircle, X, DownloadCloud, Sparkles, Link2, Plus,
  Image as ImageIcon, Trash2, ExternalLink, User, Github, Linkedin, Twitter, Youtube
} from 'lucide-react';
import { toast } from 'react-toastify';
import ProfilePicture from '../components/ProfilePicture';
import SkillBadge from '../components/SkillBadge';
import RatingChart from '../components/RatingChart';
import Attachment from '../components/Attachment';

const socialIcons = {
  website: Globe,
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube
};

const MAX_BIO_LENGTH = 500;
const MAX_PORTFOLIO_ITEMS = 12;
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const CommunityCard = () => {
  const { userId } = useParams();
  const { token, userData } = useContext(AuthContext);
  const navigate = useNavigate();
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
  const [isBlocked, setIsBlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const averageRating = useMemo(() => 
    reviews.length > 0 
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
      : 0
  , [reviews]);

  const loadData = useCallback(async () => {
    try {
      const [profileRes, reviewsRes] = await Promise.all([
        axios.get(`/users/${userId}`),
        axios.get(`/reviews/user/${userId}?sort=-createdAt&limit=10`)
      ]);
      
      if (token) {
        const blockStatusRes = await axios.get(`/users/${userId}/block-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsBlocked(blockStatusRes.data.isBlocked);
      }

      setProfile(profileRes.data);
      setReviews(reviewsRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile data');
    }
  }, [userId, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (userData?.userId === userId) {
      setError("You cannot review yourself.");
      setIsSubmitting(false);
      return;
    }

    if (newReview.rating === 0) {
      setError("Please select a rating.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await axios.post(`/reviews/user/${userId}`, newReview, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReviews([res.data, ...reviews]);
      setNewReview({ rating: 0, comment: '' });
      toast.success('Review submitted successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error submitting review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePortfolioUpload = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!portfolioFile) {
      toast.error('Please select a file');
      setIsSubmitting(false);
      return;
    }

    if (!ACCEPTED_FILE_TYPES.includes(portfolioFile.type)) {
      toast.error('Invalid file type');
      setIsSubmitting(false);
      return;
    }

    if (portfolioFile.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 5MB limit');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('portfolio', portfolioFile);
    
    try {
      const res = await axios.put(`/users/${userId}/portfolio`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setProfile({ ...profile, portfolio: res.data.portfolio });
      setIsUploadingPortfolio(false);
      setPortfolioFile(null);
      toast.success('Portfolio item uploaded!');
    } catch (err) {
      console.error(err);
      toast.error('Error uploading file');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePortfolioItem = async (fileUrl) => {
    try {
      await axios.delete(`/users/${userId}/portfolio`, { 
        data: { fileUrl },
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile({ ...profile, portfolio: profile.portfolio.filter(item => item !== fileUrl) });
      toast.success('Portfolio item removed');
    } catch (err) {
      console.error(err);
      toast.error('Error removing item');
    }
  };

  const handleSaveProfile = async () => {
    setIsSubmitting(true);
    try {
      await axios.put(`/users/${userId}`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
      loadData();
    } catch (err) {
      toast.error('Error updating profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLinkUpdate = async (type, url) => {
    if (!url.match(/^(http|https):\/\//)) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }

    try {
      await axios.put(`/users/${userId}/social`, { [type]: url }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Social links updated');
      setIsEditingLinks(false);
      loadData();
    } catch (err) {
      toast.error('Error updating social links');
    }
  };

  const handleAddLink = async () => {
    if (!newLink.url.match(/^(http|https):\/\//)) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    
    try {
      await axios.post(`/users/${userId}/links`, newLink, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(prev => ({
        ...prev,
        links: [...(prev.links || []), newLink]
      }));
      setNewLink({ type: 'website', url: '' });
      toast.success('Link added successfully');
    } catch (err) {
      toast.error('Error adding link');
    }
  };

  const handleDeleteLink = async (index) => {
    try {
      await axios.delete(`/users/${userId}/links/${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(prev => ({
        ...prev,
        links: prev.links.filter((_, i) => i !== index)
      }));
      toast.success('Link removed');
    } catch (err) {
      toast.error('Error removing link');
    }
  };

  const handleContact = () => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (isBlocked) {
      toast.error('You cannot contact this user');
    } else {
      navigate(`/messages/${userId}`);
    }
  };

  if (!profile) return (
    <div className="flex justify-center items-center h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full max-w-6xl px-4"
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </motion.div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Profile Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 h-48 sm:h-56">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="absolute -bottom-16 left-4 sm:left-8"
            layoutId="profilePicture"
          >
            <ProfilePicture 
              profilePicUrl={profile.profile_pic_url} 
              name={profile.name}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border-4 border-white shadow-xl"
            />
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <LayoutGroup>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div 
                className="bg-white rounded-2xl p-6 shadow-xl"
                layout
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                    {userData?.userId === userId && (
                      <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5 text-gray-600" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
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

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Globe className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{profile.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Briefcase className="w-5 h-5 flex-shrink-0" />
                      {isEditing ? (
                        <input
                          type="number"
                          value={profile.experience}
                          onChange={(e) => setProfile({...profile, experience: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                          min="0"
                        />
                      ) : (
                        <span>{profile.experience} years experience</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white rounded-2xl p-6 shadow-xl"
                layout
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Social Links</h3>
                  {userData?.userId === userId && (
                    <button 
                      onClick={() => setIsEditingLinks(!isEditingLinks)}
                      className="p-1 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {isEditingLinks ? (
                    <>
                      <div className="flex gap-2">
                        <select
                          value={newLink.type}
                          onChange={(e) => setNewLink({...newLink, type: e.target.value})}
                          className="flex-shrink-0 px-3 py-2 border rounded-lg"
                        >
                          {Object.keys(socialIcons).map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <input
                          type="url"
                          value={newLink.url}
                          onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                          placeholder="Enter URL"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <button
                        onClick={handleAddLink}
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Add Link
                      </button>
                    </>
                  ) : (
                    profile.links?.map((link, index) => {
                      const Icon = socialIcons[link.type] || Globe;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-3 group"
                        >
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Icon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                            <span className="truncate text-gray-700">{link.url}</span>
                          </a>
                          {userData?.userId === userId && (
                            <button
                              onClick={() => handleDeleteLink(index)}
                              className="opacity-0 group-hover:opacity-100 text-red-500 p-1 hover:bg-red-50 rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Bio Section */}
              <motion.div 
                className="bg-white rounded-2xl p-6 shadow-xl"
                layout
              >
                <h2 className="text-2xl font-bold mb-4">About</h2>
                {isEditing ? (
                  <div className="space-y-4">
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      placeholder="Tell us about yourself..."
                      maxLength={MAX_BIO_LENGTH}
                    />
                    <div className="text-sm text-gray-500 text-right">
                      {profile.bio?.length || 0}/{MAX_BIO_LENGTH}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {profile.bio || 'No bio provided'}
                  </p>
                )}
              </motion.div>

              {/* Portfolio Section */}
              <motion.div 
                className="bg-white rounded-2xl p-6 shadow-xl"
                layout
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Portfolio</h2>
                  {userData?.userId === userId && (
                    <button
                      onClick={() => setIsUploadingPortfolio(true)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={profile.portfolio?.length >= MAX_PORTFOLIO_ITEMS}
                    >
                      <Plus className="w-6 h-6 text-gray-600" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {profile.portfolio?.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative group aspect-square"
                    >
                      <Attachment 
                        fileUrl={item}
                        className="w-full h-full object-cover rounded-xl shadow-sm hover:shadow-md transition-all"
                      />
                      {userData?.userId === userId && (
                        <button
                          onClick={() => handleDeletePortfolioItem(item)}
                          className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white"
                        >
                          <X className="w-5 h-5 text-red-600" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Reviews Section */}
              <motion.div 
                className="bg-white rounded-2xl p-6 shadow-xl"
                layout
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Reviews</h2>
                  <RatingChart reviews={reviews} />
                </div>

                <div className="space-y-6">
                  {reviews.map((review) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-start gap-4">
                        <ProfilePicture 
                          profilePicUrl={review.reviewer_id?.profile_pic_url} 
                          name={review.reviewer_id?.name}
                          className="w-12 h-12 rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{review.reviewer_id?.name}</h4>
                            <div className="flex items-center gap-1 text-yellow-400">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {token && userData?.userId !== userId && !isBlocked && (
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
                          {newReview.rating > 0 ? `${newReview.rating} stars` : 'Select rating'}
                        </span>
                      </div>

                      <textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        placeholder="Share your experience..."
                        className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        required
                      />

                      {error && <p className="text-red-500 text-sm">{error}</p>}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </LayoutGroup>
      </div>

      {/* Floating Action Buttons */}
      {userData?.userId === userId && (
        <motion.div 
          className="fixed bottom-8 right-8 flex gap-4"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
        >
          {isEditing && (
            <button
              onClick={handleSaveProfile}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          )}
          <button
            onClick={handleContact}
            className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-all"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </motion.div>
      )}

      {/* Portfolio Upload Modal */}
      <AnimatePresence>
        {isUploadingPortfolio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Upload Portfolio Item</h3>
                <button
                  onClick={() => setIsUploadingPortfolio(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePortfolioUpload} className="space-y-4">
                <label className="block">
                  <span className="sr-only">Choose portfolio file</span>
                  <input
                    type="file"
                    onChange={(e) => setPortfolioFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                    accept={ACCEPTED_FILE_TYPES.join(',')}
                    required
                  />
                </label>

                <div className="text-sm text-gray-500">
                  <p>Accepted formats: JPEG, PNG, PDF</p>
                  <p>Max file size: 5MB</p>
                  <p>Max items: {MAX_PORTFOLIO_ITEMS}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUploadingPortfolio(false)}
                    className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CommunityCard;