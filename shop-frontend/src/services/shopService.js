import api from './api'

const shopService = {
  // PUBLIC
  getByName: (name) => api.get(`/shop?name=${encodeURIComponent(name)}`),

  // SHOP (cần auth)
  getMyShop: () => api.get('/shop/profile'),
  updateShop: (data) => api.put('/shop/profile', data),
}

export default shopService