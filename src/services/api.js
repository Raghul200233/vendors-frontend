import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      // Handle specific status codes
      switch (response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          toast.error('You don\'t have permission to perform this action');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 422:
          // Validation error
          const errors = response.data.errors;
          if (errors && Array.isArray(errors)) {
            errors.forEach(err => toast.error(err.message));
          } else {
            toast.error(response.data.message || 'Validation failed');
          }
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Our team has been notified.');
          break;
        default:
          toast.error(response.data?.message || 'An error occurred');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('Application error. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
};

// Product API
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByVendor: (vendorId) => api.get(`/products/vendor/${vendorId}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImages: (id, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return api.post(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Order API
export const orderAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  getMyOrders: () => api.get('/orders/my-orders'),
};

// Vendor API
export const vendorAPI = {
  getDashboard: () => api.get('/vendor/dashboard'),
  getSales: (period) => api.get('/vendor/sales', { params: { period } }),
  getProducts: () => api.get('/vendor/products'),
  updateStore: (data) => api.put('/vendor/store', data),
  getStats: () => api.get('/vendor/stats'),
};

// Admin API
export const adminAPI = {
  getAllVendors: () => api.get('/admin/vendors'),
  approveVendor: (id) => api.put(`/admin/vendors/${id}/approve`),
  suspendVendor: (id) => api.put(`/admin/vendors/${id}/suspend`),
  getPlatformStats: () => api.get('/admin/stats'),
  getAllOrders: () => api.get('/admin/orders'),
};

export default api;