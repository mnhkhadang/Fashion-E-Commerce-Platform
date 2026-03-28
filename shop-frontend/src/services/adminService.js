import api from './api'

const adminService = {
  // Users
  getAllUsers: () => api.get('/admin/users'),
  toggleUser: (email) =>
    api.post(`/admin/users/toggle?email=${encodeURIComponent(email)}`),
  assignRole: (email, role) =>
    api.post('/admin/users/assign-role', { email, role }),
  removeRole: (email, role) =>
    api.post('/admin/users/remove-role', { email, role }),

  // Shops
  getAllShops: () => api.get('/admin/shops'),
  toggleShop: (email) =>
    api.post(`/admin/shops/toggle?email=${encodeURIComponent(email)}`),
}

export default adminService