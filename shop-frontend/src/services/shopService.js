import api from './api'

const shopService = {
  // PUBLIC
  getByName: (name) => api.get(`/shop?name=${encodeURIComponent(name)}`),

  // SHOP (cần auth)
  getMyShop: () => api.get('/shop/profile'),
  updateShop: (data) => api.put('/shop/profile', data),
  getByShop: (shopName) => api.get(`/products/shop?shopName=${encodeURIComponent(shopName)}`),
  
}

export default shopService