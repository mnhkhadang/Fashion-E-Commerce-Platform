import api from './api'

const returnService = {
  // USER
  // POST /returns/{orderCode}?reason=
  requestReturn: (orderCode, reason) =>
    api.post(`/returns/${orderCode}?reason=${encodeURIComponent(reason)}`),

  // GET /returns — danh sách return của user
  getMyReturns: () => api.get('/returns'),

  // SHOP
  // GET /returns/shop — danh sách return của shop
  getShopReturns: () => api.get('/returns/shop'),

  // PUT /returns/{orderCode}/approve
  approveReturn: (orderCode) => api.put(`/returns/${orderCode}/approve`),

  // PUT /returns/{orderCode}/received
  confirmReceived: (orderCode) => api.put(`/returns/${orderCode}/received`),

  // PUT /returns/{orderCode}/reject?rejectReason=
  // Lưu ý: BE dùng "rejectReason" không phải "reason"
  rejectReturn: (orderCode, rejectReason) =>
    api.put(`/returns/${orderCode}/reject?rejectReason=${encodeURIComponent(rejectReason)}`),
}

export default returnService