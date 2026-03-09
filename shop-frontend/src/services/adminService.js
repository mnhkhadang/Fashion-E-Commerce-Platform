import api from './api'

const adminService = {
  // Users
  getAllUsers: () => api.get('/api/admin/users'),
  toggleUser: (email) => api.post(`/api/admin/users/toggle?email=${encodeURIComponent(email)}`),
  assignRole: (email, role) => api.post('/api/admin/users/assign-role', { email, role }),
  removeRole: (email, role) => api.post('/api/admin/users/remove-role', { email, role }),

  // Shops
  getAllShops: () => api.get('/api/admin/shops'),
  toggleShop: (email) => api.post(`/api/admin/shops/toggle?email=${encodeURIComponent(email)}`),
}
export default adminService