import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiDollarSign, FiStar, FiEdit, FiCalendar, FiTrash2, FiExternalLink, FiPlus } from 'react-icons/fi';
import { format } from 'date-fns';
import { Rocket, Award, ShieldCheck, BadgeInfo, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { Helmet } from 'react-helmet';

// --- Reusable Components ---

// Card Component (Reusable for consistent styling)
const Card = React.memo(({ children, className = '', ...props }) => (
    <motion.div
        layout
        className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 p-6 ${className}`}
        {...props}
    >
        {children}
    </motion.div>
));
Card.displayName = 'Card';


// XP Progress Bar Component
const XpProgressBar = React.memo(({ xpProgress }) => (
    <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-gray-800">Level Progress <span className="text-sm text-gray-500">(Feature Coming Soon)</span></h3>
            </div>
            <span className="text-sm font-medium text-gray-600">{xpProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
                aria-valuenow={xpProgress}
                aria-valuemin="0"
                aria-valuemax="100"
                role="progressbar"
                aria-label="Progress to next level"
            />
        </div>
    </Card>
));
XpProgressBar.displayName = 'XpProgressBar';

// Tab Button Component (Improved Styling)
const TabButton = React.memo(({ activeTab, tabName, icon, count, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 md:px-6 md:py-3 flex items-center space-x-2 rounded-md md:rounded-lg transition-colors font-medium text-sm md:text-base
            ${activeTab === tabName
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
        role="tab"
        aria-selected={activeTab === tabName}
        aria-controls={`${tabName}-panel`}
    >
        {icon}
        <span>{tabName} ({count})</span>
    </button>
));
TabButton.displayName = 'TabButton';

// Rating Stars Component (No changes needed)
const RatingStars = React.memo(({ rating }) => {
    const fullStars = Math.floor(rating || 0);
    const displayRating = Number.isInteger(rating) ? rating : rating?.toFixed(1);
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <FiStar
                    key={i}
                    className={`w-4 h-4 ${i < fullStars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    aria-hidden="true"
                />
            ))}
            <span className="ml-2 text-sm text-gray-600">({displayRating || 0})</span>
        </div>
    );
});
RatingStars.displayName = 'RatingStars';

// Bid Status Badge Component (Improved Styling)
const BidStatusBadge = React.memo(({ status }) => {
    let badgeText = status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending';
    let badgeClass = 'bg-blue-100 text-blue-800';

    if (status === 'accepted') {
        badgeClass = 'bg-green-100 text-green-800';
    } else if (status === 'rejected') {
        badgeClass = 'bg-red-100 text-red-800';
    }

    return (
        <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${badgeClass}`}>
            {badgeText}
        </span>
    );
});
BidStatusBadge.displayName = 'BidStatusBadge';

// Empty State Placeholder for Bids Received (Improved Styling)
const EmptyBidsPlaceholder = React.memo(() => (
    <div className="text-center py-10 text-gray-500 text-sm">
        <BadgeInfo className="w-10 h-10 mx-auto text-gray-400 mb-3" aria-hidden="true" />
        <p className="font-medium">No bids received yet.</p>
        <p>Share your gig to start getting offers!</p>
    </div>
));
EmptyBidsPlaceholder.displayName = 'EmptyBidsPlaceholder';

// Empty State Placeholder for Bids Placed (Improved Styling)
const EmptyBidsPlacedPlaceholder = React.memo(({ navigate }) => (
    <div className="col-span-full text-center py-12">
        <div className="max-w-md mx-auto">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Bids Placed Yet</h3>
            <p className="text-gray-600 mb-5">Browse gigs and place your first bid to get started.</p>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto font-medium"
            >
                <FiPlus className="w-5 h-5" aria-hidden="true" />
                Browse Gigs
            </motion.button>
        </div>
    </div>
));
EmptyBidsPlacedPlaceholder.displayName = 'EmptyBidsPlacedPlaceholder';

// Activity Gig Card Component (Redesigned)
const ActivityGigCard = React.memo(({ gig, selectedGigId, viewBids, handleDeleteGig, navigate, bids, sortBy, setSortBy, handleStatusChange }) => {
    const isBidsVisible = selectedGigId === gig._id;
    const sortedBids = useMemo(() => {
        return [...bids].sort((a, b) => {
            if (sortBy === 'price_asc') return a.amount - b.amount;
            if (sortBy === 'price_desc') return b.amount - a.amount;
            if (sortBy === 'rating_asc') return (a.user_id?.rating || 0) - (b.user_id?.rating || 0);
            if (sortBy === 'rating_desc') return (b.user_id?.rating || 0) - (a.user_id?.rating || 0);
            return 0;
        });
    }, [bids, sortBy]);

    return (
        <Card>
            <div className="md:flex md:items-start md:justify-between gap-5">
                <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-2">
                        <Link
                            to={`/gigs/${gig._id}`}
                            className="text-lg md:text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                        >
                            {gig.title}
                        </Link>
                        {gig.is_volunteer && (
                            <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-sm flex items-center gap-1 font-medium">
                                <Award className="w-4 h-4" aria-hidden="true" /> Volunteer
                            </span>
                        )}
                    </div>

                    <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600 mb-2">
                        <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                            <FiCalendar className="w-4 h-4 mr-1" aria-hidden="true" />
                            <span>Posted {format(new Date(gig.created_at), 'MMM dd')}</span>
                        </div>
                        {!gig.is_volunteer && (
                            <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                                <FiDollarSign className="w-4 h-4 mr-1" aria-hidden="true" />
                                <span>Budget: ${gig.budget_range_min}-${gig.budget_range_max}</span>
                            </div>
                        )}
                    </div>

                    {gig.description && (
                        <p className="mt-1 md:mt-2 text-gray-600 line-clamp-2">
                            {gig.description}
                        </p>
                    )}
                </div>

                <div className="flex md:flex-col items-center gap-2 md:gap-3 mt-3 md:mt-0">
                    <div className="flex gap-2">
                        <Link
                            to={`/edit-gig/${gig._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            aria-label="Edit gig"
                        >
                            <FiEdit className="w-5 h-5" aria-hidden="true" />
                        </Link>
                        <motion.button
                            whileHover={{ backgroundColor: '#FEE2E2' }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => handleDeleteGig(gig._id)}
                            aria-label="Delete gig"
                        >
                            <FiTrash2 className="w-5 h-5" aria-hidden="true" />
                        </motion.button>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        onClick={() => viewBids(gig._id)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors font-medium
                            ${isBidsVisible
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        aria-expanded={isBidsVisible}
                    >
                        {isBidsVisible ? 'Collapse Bids' : `View Bids (${bids.length})`}
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {isBidsVisible && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-gray-100"
                    >
                        <BidList bids={sortedBids} sortBy={sortBy} setSortBy={setSortBy} handleStatusChange={handleStatusChange} navigate={navigate} />
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
});
ActivityGigCard.displayName = 'ActivityGigCard';

// Bid List Component (No major changes, just using Card)
const BidList = React.memo(({ bids, sortBy, setSortBy, handleStatusChange, navigate }) => {
    if (bids.length === 0) {
        return <EmptyBidsPlaceholder />;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-600" aria-hidden="true" /> Bids Received
                </h4>
                <div className="flex items-center space-x-2">
                    <label htmlFor="sortBids" className="text-sm text-gray-700 font-medium">Sort by:</label>
                    <select
                        id="sortBids"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-1 border rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500"
                        aria-label="Sort bids"
                    >
                        <option value="price_desc">Price High-Low</option>
                        <option value="price_asc">Price Low-High</option>
                        <option value="rating_desc">Rating High-Low</option>
                        <option value="rating_asc">Rating Low-High</option>
                    </select>
                </div>
            </div>
            <div className="grid gap-4">
                {bids.map((bid) => (
                    <BidCard key={bid._id} bid={bid} handleStatusChange={handleStatusChange} navigate={navigate} />
                ))}
            </div>
        </div>
    );
});
BidList.displayName = 'BidList';

// Bid Card Component (Redesigned)
const BidCard = React.memo(({ bid, handleStatusChange, navigate }) => (
    <Card>
        <div className="md:flex md:items-start md:justify-between">
            <div className="flex items-center gap-4 flex-1">
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {bid.user_id?.profile_pic_url ? (
                        <img
                            src={bid.user_id.profile_pic_url}
                            alt={bid.user_id.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <span className="text-gray-500 text-sm font-semibold">
                            {bid.user_id?.name?.charAt(0) || 'U'}
                        </span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Link
                            to={`/profile/${bid.user_id?._id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 text-sm transition-colors line-clamp-1"
                        >
                            {bid.user_id?.name || 'Unknown User'}
                        </Link>
                        <RatingStars rating={bid.user_id?.rating} />
                    </div>
                    {bid.message && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                            "{bid.message}"
                        </p>
                    )}
                </div>
            </div>

            <div className="ml-4 text-right flex-col items-end justify-center hidden md:flex">
                <p className="text-lg font-semibold text-gray-900">${bid.amount}</p>
                <BidStatusBadge status={bid.status} />
            </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between flex-col md:flex-row gap-3">
            <div className="flex items-center gap-3 order-2 md:order-1">
                <select
                    value={bid.status}
                    onChange={(e) => handleStatusChange(bid._id, e.target.value)}
                    className="px-3 py-1 border rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500"
                    aria-label={`Set bid status for ${bid.user_id?.name || 'Unknown User'}`}
                >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accept</option>
                    <option value="rejected">Reject</option>
                </select>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    onClick={() => navigate(`/messages/${bid.conversation_id}`)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm flex items-center gap-2 font-medium"
                    aria-label={`Message ${bid.user_id?.name || 'Unknown User'}`}
                >
                    <FiMessageSquare className="w-4 h-4" aria-hidden="true" /> Message
                </motion.button>
            </div>
            <div className="ml-4 text-right flex flex-col items-end md:hidden order-1 md:order-2">
                <p className="text-lg font-semibold text-gray-900">${bid.amount}</p>
                <BidStatusBadge status={bid.status} />
            </div>
        </div>
    </Card>
));
BidCard.displayName = 'BidCard';

// Activity Bid Card Component (for My Bids tab) - Redesigned
const ActivityBidCard = React.memo(({ bid, handleDeleteBid, navigate }) => (
    <Card>
        <div className="md:flex md:items-start md:justify-between gap-5">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <Link
                        to={`/gigs/${bid.gig_id?._id || ''}`}
                        className="font-semibold text-gray-900 text-sm hover:text-blue-600 flex items-center transition-colors line-clamp-1"
                        aria-label={`View gig: ${bid.gig_id?.title || 'Deleted Gig'}`}
                    >
                        {bid.gig_id?.title || 'Deleted Gig'}
                        <FiExternalLink className="ml-2 w-4 h-4" aria-hidden="true" />
                    </Link>
                    <BidStatusBadge status={bid.status} />
                </div>

                <div className="flex items-center flex-wrap gap-3 text-sm text-gray-600">
                    <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                        <FiDollarSign className="w-4 h-4 mr-1" aria-hidden="true" />
                        <span>Bid Amount: ${bid.amount}</span>
                    </div>
                    <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                        <FiCalendar className="w-4 h-4 mr-1" aria-hidden="true" />
                        <span>{format(new Date(bid.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-2 md:mt-0">
                <motion.button
                    whileHover={{ backgroundColor: '#FEE2E2' }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    onClick={() => handleDeleteBid(bid._id)}
                    aria-label="Delete bid"
                >
                    <FiTrash2 className="w-5 h-5" aria-hidden="true" />
                </motion.button>
                <motion.button
                    whileHover={{ backgroundColor: '#E0F2FE' }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    onClick={() => navigate(`/messages/${bid.conversation_id}`)}
                    aria-label="Message about bid"
                >
                    <FiMessageSquare className="w-5 h-5" aria-hidden="true" />
                </motion.button>
            </div>
        </div>
    </Card>
));
ActivityBidCard.displayName = 'ActivityBidCard';


// --- Main MyGigs Component ---
function MyGigs() {
    const [activeTab, setActiveTab] = useState('gigs');
    const [gigs, setGigs] = useState([]);
    const [myBids, setMyBids] = useState([]);
    const [selectedGigId, setSelectedGigId] = useState(null);
    const [bids, setBids] = useState([]);
    const [sortBy, setSortBy] = useState('price_desc');
    const [xpProgress, setXpProgress] = useState(65); // Example XP progress
    const { userData } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchMyGigs = useCallback(async () => {
        try {
            const res = await axios.get('/gigs/mygigs/owner');
            setGigs(res.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const fetchMyBids = useCallback(async () => {
        try {
            const res = await axios.get('/bids/my');
            setMyBids(res.data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchMyGigs();
        fetchMyBids();
    }, [fetchMyGigs, fetchMyBids]);

    const viewBids = useCallback(async (gigId) => {
        setSelectedGigId(gigId === selectedGigId ? null : gigId);
        if (gigId !== selectedGigId) {
            try {
                const res = await axios.get(`/bids/${gigId}`);
                setBids(res.data);
            } catch (err) {
                console.error(err);
            }
        }
    }, [selectedGigId]);

    const handleDeleteGig = useCallback(async (gigId) => {
        if (window.confirm('Are you sure you want to delete this gig?')) {
            try {
                await axios.delete(`/gigs/${gigId}`);
                fetchMyGigs();
            } catch (err) {
                console.error(err);
            }
        }
    }, [fetchMyGigs]);

    const handleDeleteBid = useCallback(async (bidId) => {
        if (window.confirm('Are you sure you want to delete this bid?')) {
            try {
                await axios.delete(`/bids/${bidId}`);
                fetchMyBids();
            } catch (err) {
                console.error(err);
            }
        }
    }, [fetchMyBids]);

    const handleStatusChange = useCallback(async (bidId, status) => {
        try {
            await axios.patch(`/bids/${bidId}/status`, { status });
            setBids(prevBids =>
                prevBids.map((bid) =>
                    bid._id === bidId ? { ...bid, status } : bid
                )
            );
        } catch (err) {
            console.error(err);
        }
    }, []);

    const seoTitle = "My Activity | CharlotteGigs";
    const seoDescription = "Manage your gigs and bids on CharlotteGigs. Keep track of your posted gigs and bids you've placed.";

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8"> {/* Adjusted padding for mobile */}
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:type" content="website" />
            </Helmet>
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 md:gap-5"> {/* Reduced marginBottom and gap for mobile */}
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 md:gap-3 mb-1 md:mb-2"> {/* Reduced text size and marginBottom for mobile */}
                            <Rocket className="w-6 h-6 md:w-8 md:h-8 text-blue-600" aria-hidden="true" /> My Activity
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base"> {/* Reduced text size for mobile */}
                            {activeTab === 'gigs'
                                ? `Managing ${gigs.length} gig${gigs.length !== 1 ? 's' : ''}`
                                : `Tracking ${myBids.length} bid${myBids.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                    <XpProgressBar xpProgress={xpProgress} />
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6 md:mb-8"> {/* Reduced marginBottom for mobile */}
                    <nav className="flex space-x-2 md:space-x-4 -mb-px" role="tablist" aria-label="My Activity Tabs"> {/* Adjusted margin-bottom for tab underline */}
                        <TabButton
                            activeTab={activeTab}
                            tabName="gigs"
                            icon={<FiCalendar className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />}
                            count={gigs.length}
                            onClick={() => setActiveTab('gigs')}
                        />
                        <TabButton
                            activeTab={activeTab}
                            tabName="bids"
                            icon={<FiDollarSign className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />}
                            count={myBids.length}
                            onClick={() => setActiveTab('bids')}
                        />
                    </nav>
                </div>

                {/* Gigs Tab Content */}
                {activeTab === 'gigs' && (
                    <motion.div
                        layout
                        className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-1" // Reduced gap for mobile grid
                        role="tabpanel"
                        id="gigs-panel"
                        aria-labelledby="gigs-tab"
                    >
                        <AnimatePresence>
                            {gigs.map((gig) => (
                                <ActivityGigCard
                                    key={gig._id}
                                    gig={gig}
                                    selectedGigId={selectedGigId}
                                    viewBids={viewBids}
                                    handleDeleteGig={handleDeleteGig}
                                    bids={bids}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    handleStatusChange={handleStatusChange}
                                    navigate={navigate}
                                />
                            ))}
                        </AnimatePresence>
                        {gigs.length === 0 && (
                            <div className="text-center py-12">
                                <div className="max-w-md mx-auto">
                                    <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No Gigs Posted Yet</h3>
                                    <p className="text-gray-600 mb-5">Click below to create your first gig and start offering your services or tasks.</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/create-gig')}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto font-medium"
                                    >
                                        <FiPlus className="w-5 h-5" aria-hidden="true" /> Create New Gig
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Bids Tab Content */}
                {activeTab === 'bids' && (
                    <motion.div
                        layout
                        className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-1" // Reduced gap for mobile grid
                        role="tabpanel"
                        id="bids-panel"
                        aria-labelledby="bids-tab"
                    >
                        <AnimatePresence>
                            {myBids.map((bid) => (
                                <ActivityBidCard
                                    key={bid._id}
                                    bid={bid}
                                    handleDeleteBid={handleDeleteBid}
                                    navigate={navigate}
                                />
                            ))}
                        </AnimatePresence>

                        {myBids.length === 0 && (
                            <EmptyBidsPlacedPlaceholder navigate={navigate} />
                        )}
                    </motion.div>
                )}

                {/* Floating Action Button (Improved Mobile Positioning) */}
                {activeTab === 'gigs' && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/create-gig')}
                        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-blue-600 text-white p-3 md:p-4 rounded-full shadow-xl flex items-center gap-2 z-50 font-medium" // Adjusted positioning and padding for mobile
                        aria-label="Create a new gig"
                    >
                        <FiPlus className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" /> New Gig
                    </motion.button>
                )}
            </div>
        </div>
    );
}

export default MyGigs;