import api from './api'

const orderService = {
  getMyOrders: () => api.get('/api/orders'),
  getByOrderCode: (orderCode) => api.get(`/api/orders/${orderCode}`),
  cancelOrder: (orderCode) => api.post(`/api/orders/${orderCode}/cancel`),
  getShopOrders: () => api.get('/api/orders/shop'),  // ← thêm
}

export default orderService