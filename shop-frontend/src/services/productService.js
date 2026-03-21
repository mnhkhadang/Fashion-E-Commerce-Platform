import api from './api'

const productService = {
  getMyProducts: () => api.get('/api/products/my'),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  toggleActive: (id) => api.post(`/api/products/${id}/toggle`),
}

export default productService