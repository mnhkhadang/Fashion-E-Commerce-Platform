import api from './api'

const paymentService = {
  /**
   * POST /payments/checkout
   * Request: { slugs, shippingAddressId, paymentMethod, note }
   * Response: { payment, reservationExpiredAt, vnpayUrl }
   */
  checkout: (data) => api.post('/payments/checkout', data),

  // GET /payments — danh sách payment của user
  getMyPayments: () => api.get('/payments'),

  // GET /payments/{paymentCode} — chi tiết payment
  getByPaymentCode: (paymentCode) => api.get(`/payments/${paymentCode}`),
}

export default paymentService