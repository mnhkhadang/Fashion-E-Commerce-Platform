import api from './api'

const orderService = {
  // USER
  getMyOrders: () => api.get('/orders'),
  getByOrderCode: (orderCode) => api.get(`/orders/${orderCode}`),
  cancelOrder: (orderCode, reason = 'Cancel by user') =>
    api.post(`/orders/${orderCode}/cancel?reason=${encodeURIComponent(reason)}`),

  // SHOP
  getShopOrders: () => api.get('/orders/shop'),
  updateStatus: (orderCode, orderStatus) =>
    api.put(`/orders/${orderCode}/status?orderStatus=${orderStatus}`),
}

export default orderService