import api from './api'

const productService = {
  // PUBLIC
  getAll: () => api.get('/products'),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  search: (keyword) => api.get(`/products/search?keyword=${encodeURIComponent(keyword)}`),
  getByCategory: (categoryName) =>
    api.get(`/products/category?categoryName=${encodeURIComponent(categoryName)}`),
  getByShop: (shopName) =>
    api.get(`/products/shop?shopName=${encodeURIComponent(shopName)}`),

  // SHOP
  getMyProducts: () => api.get('/products/my'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  toggleActive: (id) => api.post(`/products/${id}/toggle`),
}

export default productService