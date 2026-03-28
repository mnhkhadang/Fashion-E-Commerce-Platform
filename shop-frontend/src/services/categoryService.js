import api from './api'

const categoryService = {
  // PUBLIC
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  getTree: () => api.get('/categories/tree'),

  // ADMIN
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

export default categoryService