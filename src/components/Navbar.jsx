import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Package, 
  LayoutDashboard, 
  Shield, 
  Store, 
  Bell 
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
  const { user, token } = useSelector(state => state.auth);
  const { items } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Get role badge color and icon
  const getRoleBadge = () => {
    if (!user) return null;
    
    switch(user.role) {
      case 'super_admin':
        return { color: 'bg-red-100 text-red-800', icon: Shield, label: 'Admin' };
      case 'vendor':
        return { color: 'bg-purple-100 text-purple-800', icon: Store, label: 'Vendor' };
      case 'customer':
        return { color: 'bg-green-100 text-green-800', icon: User, label: 'Customer' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: User, label: 'User' };
    }
  };

  const roleBadge = getRoleBadge();
  const RoleIcon = roleBadge?.icon;

  // Fetch notifications for admin
  useEffect(() => {
    if (user?.role === 'super_admin' && token) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, token]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.data);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/admin/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/admin/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              MultiShop
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Customer Links - Only show shop to customers */}
            {(!user || user.role === 'customer') && (
              <Link to="/shop" className="text-gray-700 hover:text-blue-600 transition">
                Shop
              </Link>
            )}
            
            {/* Vendor Links - Only show to vendors */}
            {(user?.role === 'vendor') && (
              <>
                <Link to="/vendor/dashboard" className="text-gray-700 hover:text-blue-600 transition flex items-center gap-1">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link to="/vendor/products" className="text-gray-700 hover:text-blue-600 transition flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  Products
                </Link>
              </>
            )}
            
            {/* Admin Links */}
            {user?.role === 'super_admin' && (
              <>
                <Link to="/admin/vendors" className="text-gray-700 hover:text-blue-600 transition">
                  Manage Vendors
                </Link>
                <Link to="/admin/customers" className="text-gray-700 hover:text-blue-600 transition">
                  Manage Customers
                </Link>
              </>
            )}
            
            {/* Cart - Only for customers */}
            {(!user || user.role === 'customer') && (
              <Link to="/cart" className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-600 hover:text-blue-600 transition" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}
            
            {/* Notification Bell for Admin */}
            {user?.role === 'super_admin' && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative focus:outline-none"
                >
                  <Bell className="w-5 h-5 text-gray-600 hover:text-blue-600 transition" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border">
                    <div className="p-3 border-b flex justify-between items-center">
                      <h3 className="font-semibold">Notifications</h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif._id}
                            className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition ${!notif.isRead ? 'bg-blue-50' : ''}`}
                            onClick={() => markAsRead(notif._id)}
                          >
                            <p className="font-medium text-sm">{notif.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-3 focus:outline-none">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">{user.name}</span>
                  </div>
                  {roleBadge && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${roleBadge.color}`}>
                      <RoleIcon className="w-3 h-3" />
                      {roleBadge.label}
                    </span>
                  )}
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg hidden group-hover:block z-50">
                  {/* Role-specific menu items */}
                  {user.role === 'customer' && (
                    <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      My Orders
                    </Link>
                  )}
                  
                  {(user.role === 'vendor') && (
                    <>
                      <Link to="/vendor/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        Dashboard
                      </Link>
                      <Link to="/vendor/products" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        Manage Products
                      </Link>
                      <Link to="/vendor/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        Shop Profile
                      </Link>
                    </>
                  )}
                  
                  {user.role === 'super_admin' && (
                    <>
                      <Link to="/admin/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        Admin Dashboard
                      </Link>
                      <Link to="/admin/vendors" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        Manage Vendors
                      </Link>
                      <Link to="/admin/customers" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                        Manage Customers
                      </Link>
                    </>
                  )}
                  
                  <hr className="my-1" />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                Sign In
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            {user?.role === 'super_admin' && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-2 space-y-2">
            {(!user || user.role === 'customer') && (
              <Link to="/shop" className="block py-2 text-gray-700 hover:text-blue-600">
                Shop
              </Link>
            )}
            
            {(user?.role === 'vendor') && (
              <>
                <Link to="/vendor/dashboard" className="block py-2 text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link to="/vendor/products" className="block py-2 text-gray-700 hover:text-blue-600">
                  Products
                </Link>
              </>
            )}
            
            {user?.role === 'super_admin' && (
              <>
                <Link to="/admin/dashboard" className="block py-2 text-gray-700 hover:text-blue-600">
                  Admin Dashboard
                </Link>
                <Link to="/admin/vendors" className="block py-2 text-gray-700 hover:text-blue-600">
                  Manage Vendors
                </Link>
                <Link to="/admin/customers" className="block py-2 text-gray-700 hover:text-blue-600">
                  Manage Customers
                </Link>
              </>
            )}
            
            {(!user || user.role === 'customer') && (
              <Link to="/cart" className="block py-2 text-gray-700 hover:text-blue-600">
                Cart ({cartItemCount})
              </Link>
            )}
            
            {user && (
              <>
                {user.role === 'customer' && (
                  <Link to="/orders" className="block py-2 text-gray-700 hover:text-blue-600">
                    My Orders
                  </Link>
                )}
                <hr className="my-2" />
                <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600">
                  Logout
                </button>
              </>
            )}
            
            {!user && (
              <Link to="/login" className="block py-2 text-blue-600 font-semibold">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;