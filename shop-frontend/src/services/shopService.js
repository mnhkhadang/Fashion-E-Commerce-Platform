import api from './api'

const shopService = {
    getMyShop: () => api.get('/api/shop/profile'),
    updateShop: (data) => api.put('/api/shop/profile', data)
}

export default shopService