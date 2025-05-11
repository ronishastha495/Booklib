import React, { useState, useEffect } from 'react';
import { Star, Search, Trash2 } from 'react-feather';
import { toast } from 'sonner';
// import ReviewService from '../../services/ReviewService';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await ReviewService.getAllReviews();
        setReviews(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load reviews');
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter(
    (review) =>
      review.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.memberName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = async (id, status) => {
    try {
      const updatedReview = await ReviewService.updateReviewStatus(id, status);
      setReviews((prev) => prev.map((r) => (r.id === id ? updatedReview : r)));
      toast.success(`Review ${status.toLowerCase()} successfully!`);
    } catch (err) {
      toast.error('Failed to update review status');
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await ReviewService.deleteReview(id);
        setReviews((prev) => prev.filter((r) => r.id !== id));
        toast.success('Review deleted successfully!');
      } catch (err) {
        toast.error('Failed to delete review');
      }
    }
  };

  if (loading) return <p className="text-center text-stone-500 mt-10">Loading reviews...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-stone-800">Reviews</h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Search reviews..."
              className="w-full md:w-64 px-4 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-stone-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-stone-50 border-y border-stone-200">
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Book</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Reviewer</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Rating</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Comment</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-stone-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr key={review.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="py-3 px-4 font-medium text-stone-800">{review.bookTitle}</td>
                  <td className="py-3 px-4 text-stone-600">{review.memberName}</td>
                  <td className="py-3 px-4 text-stone-600">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-stone-300'}`}
                          fill={i < review.rating ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-stone-600">{review.comment}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        review.status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : review.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {review.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {review.status !== 'Approved' && (
                        <button
                          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                          onClick={() => handleStatusUpdate(review.id, 'Approved')}
                        >
                          Approve
                        </button>
                      )}
                      {review.status !== 'Rejected' && (
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                          onClick={() => handleStatusUpdate(review.id, 'Rejected')}
                        >
                          Reject
                        </button>
                      )}
                      <button
                        className="p-1 rounded-md hover:bg-stone-100"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reviews;