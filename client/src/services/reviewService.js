import api from './api'; // Use the centralized axios instance

const reviewService = {
  getBookReviews: async (bookId) => {
    try {
      const response = await api.get(`/Review/book/${bookId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching book reviews:', error);
      throw error;
    }
  },

  getUserReviews: async () => {
    try {
      const response = await api.get('/Review/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  },

  createReview: async (reviewData) => {
    try {
      const response = await api.post('/Review', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Update an existing review
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await api.put(`/Review/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/Review/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },
  
  // Check if user can review a book
 // In reviewService.js
canReviewBook: async (bookId, orderId) => {
  try {
    const response = await api.get(`/Review/can-review/${bookId}/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return false;
  }
}
};

export default reviewService;