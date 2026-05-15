// API endpoints
export const API_URL = import.meta.env.VITE_API_URL;

// Product categories
export const PRODUCT_CATEGORIES = [
  { value: 'Electronics', label: 'Electronics', icon: '💻' },
  { value: 'Clothing', label: 'Clothing', icon: '👕' },
  { value: 'Books', label: 'Books', icon: '📚' },
  { value: 'Home', label: 'Home & Living', icon: '🏠' },
  { value: 'Beauty', label: 'Beauty', icon: '💄' },
  { value: 'Sports', label: 'Sports', icon: '⚽' },
  { value: 'Toys', label: 'Toys', icon: '🎮' },
  { value: 'Other', label: 'Other', icon: '📦' }
];

// Order statuses
export const ORDER_STATUS = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
};

// Payment statuses
export const PAYMENT_STATUS = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800' }
};

// User roles
export const USER_ROLES = {
  customer: 'customer',
  vendor: 'vendor',
  super_admin: 'super_admin'
};

// Shipping options
export const SHIPPING_OPTIONS = [
  { id: 'standard', name: 'Standard Shipping', price: 5.99, days: '5-7 business days' },
  { id: 'express', name: 'Express Shipping', price: 12.99, days: '2-3 business days' },
  { id: 'overnight', name: 'Overnight Shipping', price: 24.99, days: '1 business day' }
];

// Tax rate
export const TAX_RATE = 0.10; // 10%

// Free shipping threshold
export const FREE_SHIPPING_THRESHOLD = 50;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 12
};

// Local storage keys