import api from './api'

const reportService = {
  // User report review
  reportReview: (reviewId, reason) =>
    api.post(`/reports/review/${reviewId}?reason=${encodeURIComponent(reason)}`),

  // User report shop
  reportShop: (shopId, reason) =>
    api.post(`/reports/shop/${shopId}?reason=${encodeURIComponent(reason)}`),

  // Admin lấy danh sách PENDING
  getPendingReports: () => api.get('/reports'),

  // Admin resolve
  resolveReport: (reportId) => api.put(`/reports/${reportId}/resolve`),

  // Admin dismiss
  dismissReport: (reportId) => api.put(`/reports/${reportId}/dismiss`),
}

export default reportService