import api from './api'

const reviewService = {
  // PUBLIC — GET /reviews/product/{productSlug}
  getProductReviews: (productSlug) => api.get(`/reviews/product/${productSlug}`),

  // USER — POST /reviews/product/{productSlug}
  // Request: { rating, comment, mediaList? }
  createReview: (productSlug, data) => api.post(`/reviews/product/${productSlug}`, data),

  // USER — PUT /reviews/{id}
  updateReview: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),

  // USER — DELETE /reviews/{id}
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
}

export default reviewService