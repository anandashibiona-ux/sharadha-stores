import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api`
    : '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Products ────────────────────────────────────────────────────────────────
export const getProducts = (params = {}) => api.get('/products', { params }).then(r => r.data)
export const getProduct = (idOrSlug) => api.get(`/products/${idOrSlug}`).then(r => r.data)

// ── Cart ─────────────────────────────────────────────────────────────────────
export const getCart = (sessionId) => api.get(`/cart/${sessionId}`).then(r => r.data)
export const addToCart = (sessionId, productId, quantity) =>
  api.post(`/cart/${sessionId}/items`, { productId, quantity }).then(r => r.data)
export const updateCartItem = (sessionId, itemId, quantity) =>
  api.patch(`/cart/${sessionId}/items/${itemId}`, { quantity }).then(r => r.data)
export const removeCartItem = (sessionId, itemId) =>
  api.delete(`/cart/${sessionId}/items/${itemId}`).then(r => r.data)
export const clearCart = (sessionId) =>
  api.delete(`/cart/${sessionId}`).then(r => r.data)

// ── Orders ────────────────────────────────────────────────────────────────────
export const placeOrder = (payload) => api.post('/orders', payload).then(r => r.data)
export const getOrder = async (orderNumber) => {
  const response = await api.get(`/orders/${orderNumber}`)
  return response.data
}

export const getOrdersByPhone = (phone) => api.get(`/orders/customer/${phone}`).then(r => r.data)

export const updateOrderPayment = async (orderNumber, data) => {
  const response = await api.patch(`/orders/${orderNumber}/pay`, data)
  return response.data
}

export const initiateOrderPayment = async (type, payload) => {
  const response = await api.post(`/orders/initiate-payment`, { type, ...payload });
  return response.data;
};

export const verifyOrderPayment = async (type, payload) => {
  const response = await api.post(`/orders/verify-payment`, { type, ...payload });
  return response.data;
};

export const updateOrderAddress = (orderNumber, payload) => api.patch(`/orders/${orderNumber}/address`, payload).then(r => r.data)

// ── Admin ─────────────────────────────────────────────────────────────────────
const adminApi = (adminKey) =>
  axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
      ? `${import.meta.env.VITE_API_BASE_URL}/api/admin`
      : '/api/admin',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
  })

export const getAdminOrders = (adminKey, params = {}) =>
  adminApi(adminKey).get('/orders', { params }).then(r => r.data)
export const updateOrderStatus = (adminKey, orderId, status) =>
  adminApi(adminKey).patch(`/orders/${orderId}/status`, { status }).then(r => r.data)
export const updateAdminOrderPayment = (adminKey, orderId, paymentStatus) =>
  adminApi(adminKey).patch(`/orders/${orderId}/payment`, { paymentStatus }).then(r => r.data)
export const getAdminStock = (adminKey) =>
  adminApi(adminKey).get('/stock').then(r => r.data)
export const updateStock = (adminKey, productId, quantity) =>
  adminApi(adminKey).patch(`/stock/${productId}`, { quantity }).then(r => r.data)
