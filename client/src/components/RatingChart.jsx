import { Star } from 'lucide-react';

const RatingChart = ({ reviews, className = '' }) => {
  // Calculate rating distribution
  const ratingCounts = reviews.reduce((acc, review) => {
    acc[review.rating - 1] += 1;
    return acc;
  }, [0, 0, 0, 0, 0]);

  const totalReviews = reviews.length;

  return (
    <div className={`space-y-2 ${className}`}>
      {[5, 4, 3, 2, 1].map((rating, index) => {
        const count = ratingCounts[5 - rating];
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div key={rating} className="flex items-center gap-2 group">
            <div className="flex items-center w-8">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm">{rating}</span>
            </div>
            
            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <span className="w-8 text-right text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default RatingChart;