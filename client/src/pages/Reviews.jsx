import React from 'react';
// import { formatDistanceToNow } from 'date-fns';

const Reviews = ({ reviews, currentUserId, onDelete, onEdit }) => {
  // Ensure reviews is always an array
  const reviewsArray = Array.isArray(reviews) ? reviews : [];
  
  if (!reviewsArray || reviewsArray.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Reviews</h3>
        <p className="text-gray-500 italic">No reviews yet. Be the first to leave a review!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Reviews ({reviewsArray.length})</h3>
      <div className="space-y-6">
        {reviewsArray.map((review) => (
          <div key={review.reviewId} className="border-b border-gray-200 pb-4 last:border-0">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  {/* Star rating display */}
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 font-medium">{review.userName}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {review.updatedAt
                    ? `Updated ${formatDistanceToNow(new Date(review.updatedAt), { addSuffix: true })}`
                    : formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </p>
              </div>

              {/* Show edit/delete buttons if the review belongs to current user */}
              {currentUserId && review.userId === currentUserId && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit && onEdit(review)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(review.reviewId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <p className="mt-3 text-gray-700 whitespace-pre-line">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;