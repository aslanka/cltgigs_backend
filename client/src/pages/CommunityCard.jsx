import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
    Star, Edit, Globe, Briefcase, CheckCircle,
    MessageCircle, X, Plus, Sparkles, Github,
    Linkedin, Twitter, Youtube, PhoneCall, Mail
} from 'lucide-react';
import { toast } from 'react-toastify';
import ProfilePicture from '../components/ProfilePicture';
import RatingChart from '../components/RatingChart';
import {
    ProfileHeader,
    SocialLinks,
    BioSection,
    PortfolioSection,
    ReviewsSection,
    MAX_BIO_LENGTH,
    MAX_PORTFOLIO_ITEMS,
    ACCEPTED_FILE_TYPES,
    MAX_FILE_SIZE
} from '../components/community';

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
                headers: { Authorization: `Bearer ${token}` },
                data: { fileUrl }
            });

            setProfile(prev => ({
                ...prev,
                portfolio: prev.portfolio.filter(item => item !== fileUrl)
            }));

            toast.success('Portfolio item removed');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error removing item');
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

    const handleAddLink = async () => {
        try {
            const response = await axios.post(`/users/${userId}/social-links`, newLink, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProfile(prev => ({
                ...prev,
                social_media_links: [...prev.social_media_links, response.data]
            }));

            setNewLink({ type: 'website', url: '' });
            toast.success('Link added successfully');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error adding link');
        }
    };

    const handleDeleteLink = async (index) => {
        try {
            await axios.delete(`/users/${userId}/social-links/${index}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProfile(prev => ({
                ...prev,
                social_media_links: prev.social_media_links.filter((_, i) => i !== index)
            }));

            toast.success('Link removed');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error removing link');
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
        <div className="flex justify-center items-center h-screen bg-gray-50"> {/* Added background to loading state */}
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
            className="min-h-screen bg-gray-50" // Overall page background
        >
            {/* Profile Header Section */}
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-md"> {/* Hero Background */}
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <motion.div
                            layoutId="profilePicture"
                            className="rounded-full overflow-hidden shadow-lg border-4 border-white" // Profile Picture styling
                        >
                            <ProfilePicture
                                profilePicUrl={profile.profile_pic_url}
                                name={profile.name}
                                className="w-24 h-24 sm:w-32 sm:h-32" // Profile picture size
                            />
                        </motion.div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">{profile.name}</h1>
                            <p className="text-gray-100 text-sm sm:text-base">{profile.title || 'Gig Provider'}</p> {/* Example title */}
                        </div>
                    </div>
                    {userData?.userId === userId && (
                        <motion.button
                            onClick={() => setIsEditing(!isEditing)}
                            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-full transition-colors"
                        >
                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </motion.button>
                    )}
                </div>
            </div>


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <LayoutGroup>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-1 space-y-6">
                            <ProfileHeader
                                profile={profile}
                                isEditing={isEditing}
                                setIsEditing={setIsEditing}
                                userData={userData}
                                setProfile={setProfile}
                            />

                            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"> {/* Contact Card */}
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                                    <Mail className="w-5 h-5 text-blue-500" /> <span>Contact Information</span>
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <PhoneCall className="w-4 h-4" />
                                        <span>{profile.phone || 'Not provided'}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <Globe className="w-4 h-4" />
                                        <span>{profile.website || 'Not provided'}</span>
                                    </div>
                                    {/* Add more contact details here if available in profile */}
                                </div>
                                {userData?.userId !== userId && (
                                    <motion.button
                                        onClick={handleContact}
                                        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full transition-colors"
                                    >
                                        Contact Me
                                    </motion.button>
                                )}
                            </div>

                            <SocialLinks
                                profile={profile}
                                isEditingLinks={isEditingLinks}
                                setIsEditingLinks={setIsEditingLinks}
                                userData={userData}
                                newLink={newLink}
                                setNewLink={setNewLink}
                                handleAddLink={handleAddLink}
                                handleDeleteLink={handleDeleteLink}
                                isSubmitting={isSubmitting}
                            />
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-6">
                            <BioSection
                                profile={profile}
                                isEditing={isEditing}
                                setProfile={setProfile}
                            />

                            <PortfolioSection
                                profile={profile}
                                userData={userData}
                                setIsUploadingPortfolio={setIsUploadingPortfolio}
                                handleDeletePortfolioItem={handleDeletePortfolioItem}
                            />

                            <ReviewsSection
                                reviews={reviews}
                                newReview={newReview}
                                setNewReview={setNewReview}
                                hoveredRating={hoveredRating}
                                setHoveredRating={setHoveredRating}
                                error={error}
                                isSubmitting={isSubmitting}
                                handleReviewSubmit={handleReviewSubmit}
                                token={token}
                                userData={userData}
                                isBlocked={isBlocked}
                                userId={userId}
                                averageRating={averageRating}
                            />
                        </div>
                    </div>
                </LayoutGroup>
            </div>

            {/* Floating Action Buttons - Removed, Edit button is in header now, Contact in contact card*/}


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