import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProfilePicture from '../ProfilePicture';
import RatingChart from '../RatingChart';
import {
    Star, Clock, MessageCircle
} from 'lucide-react';

const ReviewsSection = ({
    reviews,
    newReview,
    setNewReview,
    hoveredRating,
    setHoveredRating,
    error,
    isSubmitting,
    handleReviewSubmit,
    token,
    userData,
    userId,
    isBlocked,
    averageRating
}) => (
    <motion.div
        className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <div className="flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="w-full">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <Star className="w-5 h-5 text-amber-500" /> <span>Customer Reviews</span>
                    </h2>
                    <RatingChart reviews={reviews} averageRating={averageRating} className="w-full" />
                </div>
            </div>

            {/* Reviews List */}
            <AnimatePresence>
                {reviews.length > 0 ? (
                    <div className="space-y-4 mt-4">
                        {reviews.map((review) => (
                            <motion.div
                                key={review._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-4 bg-gray-50 rounded-xl shadow-sm border border-gray-100"
                            >
                                <div className="flex items-start gap-4">
                                    <Link
                                        to={`/profile/${review.reviewer_id?._id}`}
                                        className="hover:opacity-80 transition-opacity"
                                    >
                                        <ProfilePicture
                                            profilePicUrl={review.reviewer_id?.profile_pic_url}
                                            name={review.reviewer_id?.name}
                                            className="w-12 h-12 rounded-xl flex-shrink-0 shadow-sm border-2 border-white"
                                        />
                                    </Link>
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                            <Link
                                                to={`/profile/${review.reviewer_id?._id}`}
                                                className="font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                                            >
                                                {review.reviewer_id?.name}
                                            </Link>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300 fill-gray-100'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{review.comment}</p>
                                        {review.date && (
                                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                {new Date(review.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <MessageCircle className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-gray-500 font-medium">No reviews yet</h3>
                        <p className="text-gray-400 text-sm mt-1">Be the first to review this provider!</p>
                    </div>
                )}
            </AnimatePresence>

            {/* Review Form */}
            {token && userData?.userId !== userId && !isBlocked && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Leave a Review</h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Your Rating</label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-1">
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <motion.button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            className={`p-2 rounded-md transition-all ${
                                                (hoveredRating >= star || newReview.rating >= star)
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'text-gray-300 hover:bg-gray-50'
                                            }`}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <Star className="w-6 h-6" />
                                        </motion.button>
                                    ))}
                                </div>
                                <span className="text-gray-500 font-medium text-sm">
                                    {newReview.rating > 0
                                        ? `${newReview.rating} Star${newReview.rating > 1 ? 's' : ''}`
                                        : 'Rate this provider'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Your Review</label>
                            <textarea
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                placeholder="Share your experience..."
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                rows="3"
                                maxLength="500"
                                required
                            />
                            <div className="text-sm text-gray-400 text-right">
                                {newReview.comment.length}/500
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-sm p-3 bg-red-50 rounded-md"
                            >
                                {error}
                            </motion.div>
                        )}

                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-6 rounded-md font-medium transition-all disabled:opacity-50"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                    />
                                    Submitting...
                                </div>
                            ) : (
                                'Submit Review'
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            )}
        </div>
    </motion.div>
);

export default ReviewsSection;