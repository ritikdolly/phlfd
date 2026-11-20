import api from './api';

// --- Authentication & Account ---
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  googleLogin: (credentialData) => api.post('/auth/google', credentialData),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  verifyEmailQuery: (token) => api.get('/auth/verify-email', { params: { token } }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

// --- Menu & Categories ---
export const menuService = {
  getCategories: () => api.get('/categories'),
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`),
  getAllMenuItems: () => api.get('/menu'),
  getMenuItemById: (id) => api.get(`/menu/${id}`),
  getMenuItemsByCategory: (slug) => api.get(`/menu/category/${slug}`),
  searchMenuItems: (query) => api.get('/menu/search', { params: { query } }),
  getFeaturedItems: () => api.get('/menu/featured'),
  getDiscountedItems: () => api.get('/menu/discounted'),
};

// --- Customer Profile & Addresses ---
export const customerService = {
  getProfile: () => api.get('/customer/profile'),
  updateProfile: (profileData) => api.put('/customer/profile', profileData),
  getAddresses: () => api.get('/customer/addresses'),
  addAddress: (addressData) => api.post('/customer/addresses', addressData),
  updateAddress: (id, addressData) => api.put(`/customer/addresses/${id}`, addressData),
  deleteAddress: (id) => api.delete(`/customer/addresses/${id}`),
  setDefaultAddress: (id) => api.patch(`/customer/addresses/${id}/default`),
};

// --- Server Cart Synchronization ---
export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (itemData) => api.post('/cart/items', itemData),
  updateCartItem: (cartItemId, updateData) => api.put(`/cart/items/${cartItemId}`, updateData),
  removeFromCart: (cartItemId) => api.delete(`/cart/items/${cartItemId}`),
  clearCart: () => api.delete('/cart/clear'),
};

// --- Coupons ---
export const couponService = {
  applyCoupon: (code, orderAmount) => api.post('/coupons/apply', { code, orderAmount }),
  getActiveCoupons: () => api.get('/coupons/active'),
};

// --- Orders & Checkout ---
export const orderService = {
  checkout: (checkoutPayload) => api.post('/orders/checkout', checkoutPayload),
  getMyOrders: (page = 0, size = 10) => api.get('/orders/my-orders', { params: { page, size } }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  trackOrder: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  cancelOrder: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  getOrderHistory: (id) => api.get(`/orders/${id}/history`),
  updateOrderStatus: (id, status, message) => api.patch(`/orders/${id}/status`, { status, message }),
  getAllOrders: (status, page = 0, size = 20) => {
    const params = { page, size };
    if (status) params.status = status;
    return api.get('/orders', { params });
  },
};

// --- Staff Operations ---
export const staffService = {
  getDashboard: () => api.get('/staff/dashboard'),
  getIncomingOrders: () => api.get('/staff/orders/incoming'),
  acceptOrder: (orderId) => api.post(`/staff/orders/${orderId}/accept`),
  rejectOrder: (orderId, reason) => api.post(`/staff/orders/${orderId}/reject`, { reason }),
  startPreparing: (orderId) => api.post(`/staff/orders/${orderId}/prepare`),
  markReadyForPickup: (orderId) => api.post(`/staff/orders/${orderId}/ready`),

  // Menu Item Management (staff + owner)
  getAllMenuItems: (page = 0, size = 20) => api.get('/staff/menu', { params: { page, size } }),
  createMenuItem: (itemData) => api.post('/staff/menu', itemData),
  updateMenuItem: (id, itemData) => api.put(`/staff/menu/${id}`, itemData),
  deleteMenuItem: (id) => api.delete(`/staff/menu/${id}`),
  toggleMenuItemAvailability: (id, available) =>
    api.patch(`/staff/menu/${id}/availability`, null, { params: { available } }),
  uploadFoodImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/staff/menu/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Category Management (staff + owner)
  getAllCategories: () => api.get('/staff/categories'),
  createCategory: (data) => api.post('/staff/categories', data),
  updateCategory: (id, data) => api.put(`/staff/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/staff/categories/${id}`),
};

// --- Delivery Personnel Operations ---
export const deliveryService = {
  getActiveAssignments: () => api.get('/delivery/assignments/active'),
  getDeliveryHistory: (page = 0, size = 10) => api.get('/delivery/assignments/history', { params: { page, size } }),
  updateDeliveryStatus: (assignmentId, statusPayload) => api.put(`/delivery/assignments/${assignmentId}/status`, statusPayload),
};

// --- Owner Management & Analytics ---
export const ownerService = {
  getDashboardStats: () => api.get('/owner/dashboard'),
  getSalesReport: (period = 'monthly') => api.get('/owner/reports/sales', { params: { period } }),
  getAllOrders: (status = null, page = 0, size = 15) => {
    const params = { page, size };
    if (status) params.status = status;
    return api.get('/owner/orders', { params });
  },
  updateOrderStatus: (orderId, status, notes = '') => api.put(`/owner/orders/${orderId}/status`, { status, notes }),
  assignDelivery: (payload) => api.post('/owner/orders/assign-delivery', payload),

  // Staff Management (owner only)
  getStaffMembers: (role = null, page = 0, size = 10) => {
    const params = { page, size };
    if (role) params.role = role;
    return api.get('/owner/staff', { params });
  },
  createStaff: (staffData) => api.post('/owner/staff', staffData),
  updateStaff: (id, staffData) => api.put(`/owner/staff/${id}`, staffData),
  deleteStaff: (id) => api.delete(`/owner/staff/${id}`),
  toggleStaffStatus: (id, active) => api.patch(`/owner/staff/${id}/status`, null, { params: { active } }),

  // Menu Management (owner — uses /owner/menu)
  getAllMenuItems: (page = 0, size = 20) => api.get('/owner/menu', { params: { page, size } }),
  createMenuItem: (itemData) => api.post('/owner/menu', itemData),
  updateMenuItem: (id, itemData) => api.put(`/owner/menu/${id}`, itemData),
  deleteMenuItem: (id) => api.delete(`/owner/menu/${id}`),
  toggleMenuItemAvailability: (id, available) =>
    api.patch(`/owner/menu/${id}/availability`, null, { params: { available } }),

  // Category Management (owner — uses /owner/categories)
  getAllCategories: () => api.get('/owner/categories'),
  createCategory: (data) => api.post('/owner/categories', data),
  updateCategory: (id, data) => api.put(`/owner/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/owner/categories/${id}`),

  // Image Uploading
  uploadFoodImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/owner/menu/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  addGalleryImage: (foodId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/owner/menu/${foodId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  removeGalleryImage: (foodId, imageUrl) =>
    api.delete(`/owner/menu/${foodId}/images`, { params: { imageUrl } }),

  // Discounts
  updateDiscount: (foodId, discountPayload) =>
    api.put(`/owner/menu/${foodId}/discount`, discountPayload),
  getAllDiscounts: () => api.get('/owner/discounts'),

  getRestaurantSettings: () => api.get('/owner/settings'),
  updateRestaurantSettings: (settings) => api.put('/owner/settings', settings),
};

