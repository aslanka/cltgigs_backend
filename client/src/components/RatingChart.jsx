// RatingChart.jsx
import { Star } from 'lucide-react';

const RatingChart = ({ reviews, className = '', averageRating }) => {
  // Calculate rating distribution
  const ratingCounts = reviews.reduce((acc, review) => {
    acc[review.rating - 1] += 1;
    return acc;
  }, [0, 0, 0, 0, 0]);

  const totalReviews = reviews.length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Average Rating Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </h3>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(averageRating)
                    ? 'text-amber-500 fill-amber-500'
                    : averageRating % 1 !== 0 && i === Math.floor(averageRating)
                    ? 'text-amber-500 fill-amber-500' // For partial stars (simplified)
                    : 'text-gray-300 fill-gray-100'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            {totalReviews} review{totalReviews !== 1 && 's'}
          </p>
        </div>
      </div>

      {/* Rating Distribution Bars */}
      {[5, 4, 3, 2, 1].map((rating, index) => {
        const count = ratingCounts[rating -1];
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div key={rating} className="flex items-center gap-3 group">
            <div className="flex items-center w-8">
              <span className="text-sm font-medium w-5">{rating}</span>
              <Star className="w-4 h-4 text-amber-500 fill-current" />
            </div>
            
            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <span className="w-8 text-right text-sm text-gray-500 font-medium">
              {Math.round(percentage)}%
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default RatingChart;