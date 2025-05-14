import React, { useState } from 'react';
import { toast } from 'sonner';

const ReviewForm = ({ bookId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (comment.trim().length < 10) {
      toast.error('Review comment must be at least 10 characters');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reviewData = {
        bookId,
        rating,
        comment: comment.trim()
      };
      
      await onReviewSubmitted(reviewData);
      
      // Reset form on success
      setRating(5);
      setComment('');
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      let errorMessage = 'Failed to submit review';
      
      if (error.response) {
        if (error.response.status === 400 && 
            error.response.data === "You have already reviewed this book") {
          errorMessage = 'You have already reviewed this book';
        } else if (error.response.status === 400 && 
                  error.response.data === "You can only review books you have purchased") {
          errorMessage = 'You can only review books you have purchased';
        } else if (error.response.data) {
          errorMessage = error.response.data;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Rating</label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <svg
                  className={`w-8 h-8 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-gray-600">{rating}/5</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="comment">
            Your Review
          </label>
          <textarea
            id="comment"
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this book (minimum 10 characters)"
            required
            minLength={10}
            maxLength={1000}
          ></textarea>
          <div className="text-right text-sm text-gray-500 mt-1">
            {comment.length}/1000 characters
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || comment.trim().length < 10}
            className={`px-4 py-2 rounded-md text-white ${
              isSubmitting || comment.trim().length < 10
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block animate-spin mr-2">↻</span>
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;