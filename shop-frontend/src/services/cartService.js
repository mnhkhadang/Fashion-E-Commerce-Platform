import api from './api'

const cartService = {
  // GET /cart — response có thể có hasWarnings, priceChanged, outOfStock
  getCart: () => api.get('/cart'),

  // POST /cart/items — { slug, quantity }
  addItem: (slug, quantity) => api.post('/cart/items', { slug, quantity }),

  // PUT /cart/items/update — { slug, quantity }
  updateItem: (slug, quantity) => api.put('/cart/items/update', { slug, quantity }),

  // DELETE /cart/items?slug={slug}
  removeItem: (slug) => api.delete(`/cart/items?slug=${encodeURIComponent(slug)}`),

  // DELETE /cart/clear
  clearCart: () => api.delete('/cart/clear'),
}

export default cartService