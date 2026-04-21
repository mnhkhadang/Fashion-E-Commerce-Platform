import api from './api'

const shippingAddressService = {
  getAll: () => api.get('/shipping-addresses'),
  add: (data) => api.post('/shipping-addresses', data),
  update: (id, data) => api.put(`/shipping-addresses/${id}`, data),
  delete: (id) => api.delete(`/shipping-addresses/${id}`),
  setDefault: (id) => api.put(`/shipping-addresses/${id}/default`),
}

export default shippingAddressService