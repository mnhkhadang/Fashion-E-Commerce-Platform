import api from './api'

const shippingAddressService = {
    getAll: () => api.get('/api/shipping-addresses'),
    add: (data) => api.post('/api/shipping-addresses', data),
    update: (id, data) => api.put(`/api/shipping-addresses/${id}`, data),
    delete: (id) => api.delete(`/api/shipping-addresses/${id}`),
    setDefault: (id) => api.put(`/api/shipping-addresses/${id}/default`),
}

export default shippingAddressService