import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProfilePicture from '../ProfilePicture';
import RatingChart from '../RatingChart';
import { 
    Star, Clock, Edit, Globe, Briefcase, CheckCircle, 
    MessageCircle, X, Plus, Sparkles, Github, 
    Linkedin, Twitter, Youtube 
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
    className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 shadow-2xl shadow-gray-100/50 border border-gray-100"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="w-full">
  <RatingChart reviews={reviews} averageRating={averageRating} className="w-full" />
</div>
      </div>

      {/* Reviews List */}
      <AnimatePresence>
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <Link 
                    to={`/profile/${review.reviewer_id?._id}`}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <ProfilePicture 
                      profilePicUrl={review.reviewer_id?.profile_pic_url} 
                      name={review.reviewer_id?.name}
                      className="w-14 h-14 rounded-xl flex-shrink-0 shadow-sm border-2 border-white"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <Link 
                        to={`/profile/${review.reviewer_id?._id}`}
                        className="font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                      >
                        {review.reviewer_id?.name}
                      </Link>
                      <div className="flex items-center gap-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating 
                                ? 'text-amber-500 fill-amber-500' 
                                : 'text-gray-300 fill-gray-100'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                    {review.date && (
  <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
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
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-gray-500 font-medium">No reviews yet</h3>
          </div>
        )}
      </AnimatePresence>

      {/* Review Form */}
      {token && userData?.userId !== userId && !isBlocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 pt-6 border-t border-gray-100"
        >
          <h3 className="text-xl font-bold mb-6">Share Your Experience</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Your Rating</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-1">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className={`p-2 rounded-xl transition-all ${
                        (hoveredRating >= star || newReview.rating >= star) 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'text-gray-300 hover:bg-gray-50'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Star className="w-8 h-8" />
                    </motion.button>
                  ))}
                </div>
                <span className="text-gray-500 font-medium">
                  {newReview.rating > 0 
                    ? `${newReview.rating} Star${newReview.rating > 1 ? 's' : ''}` 
                    : 'Select your rating'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Your Review</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Share detailed feedback about your experience..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                rows="4"
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
                className="text-red-500 text-sm p-3 bg-red-50 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Submitting...
                </div>
              ) : (
                'Publish Review'
              )}
            </motion.button>
          </form>
        </motion.div>
      )}
    </div>
  </motion.div>
);

export default ReviewsSection;