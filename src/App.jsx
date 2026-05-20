import React, { useState, useEffect } from 'react';  // Added useState import
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { validateToken } from './redux/slices/authSlice';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';  // Added semicolon

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import StorePage from './pages/StorePage';

// Vendor Pages - Fix these imports (remove './pages/' since they're in pages folder)
import VendorDashboard from './pages/VendorDashboard';
import VendorProducts from './pages/VendorProducts';
import VendorProfile from './pages/VendorProfile';
import InventoryManagement from './pages/InventoryManagement';

// Admin Pages - Fix these imports
import AdminDashboard from './pages/AdminDashboard';
import AdminVendors from './pages/AdminVendors';
import AdminCustomers from './pages/AdminCustomers';

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);

  useEffect(() => {
    const initApp = async () => {
      console.log('App initializing...');
      if (token) {
        await dispatch(validateToken());
      }
      setLoading(false);
      console.log('App initialized');
    };
    
    initApp();
  }, [dispatch, token]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Navbar />
        <main className="flex-grow container-custom py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/store/:storeSlug" element={<StorePage />} />
            
            {/* Customer Routes */}
            <Route path="/cart" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CartPage />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CheckoutPage />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <OrdersPage />
              </ProtectedRoute>
            } />
            
            {/* Vendor Routes */}
            <Route path="/vendor/dashboard" element={
              <ProtectedRoute allowedRoles={['vendor', 'super_admin']}>
                <VendorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/vendor/products" element={
              <ProtectedRoute allowedRoles={['vendor', 'super_admin']}>
                <VendorProducts />
              </ProtectedRoute>
            } />
            <Route path="/vendor/profile" element={
              <ProtectedRoute allowedRoles={['vendor', 'super_admin']}>
                <VendorProfile />
              </ProtectedRoute>
            } />
            <Route path="/vendor/inventory" element={
              <ProtectedRoute allowedRoles={['vendor', 'super_admin']}>
                <InventoryManagement />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/vendors" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminVendors />
              </ProtectedRoute>
            } />
            <Route path="/admin/customers" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminCustomers />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;