import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Store, Star, Package, Truck, Shield, Headphones, ShoppingBag, Heart, MapPin, Clock } from 'lucide-react';
import axios from 'axios';

const HomePage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(`${API_URL}/vendor/all`);
      console.log('Vendors with logos:', response.data.data);
      setVendors(response.data.data);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShopClick = (storeSlug) => {
    navigate(`/store/${storeSlug}`);
  };

  const features = [
    { icon: ShoppingBag, title: 'Multiple Vendors', description: 'Shop from various trusted stores' },
    { icon: Truck, title: 'Fast Shipping', description: 'Free delivery on orders over ₹500' },
    { icon: Shield, title: 'Secure Payment', description: '100% secure transactions' },
    { icon: Headphones, title: '24/7 Support', description: 'Dedicated customer service' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Hero Section - Mobile Responsive */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-6 md:p-12 mb-8 md:mb-12">
        <div className="max-w-2xl">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            Welcome to MultiShop
          </h1>
          <p className="text-sm md:text-lg mb-4 md:mb-6 text-blue-100">
            Discover amazing products from independent vendors. Shop unique items and support small businesses.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/register?role=customer" className="bg-white text-blue-600 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-gray-100 transition text-center text-sm md:text-base">
                Shop Now
              </Link>
              <Link to="/register?role=vendor" className="border-2 border-white text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition text-center text-sm md:text-base">
                Sell With Us
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Vendors Section - Mobile Responsive Grid */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Our Trusted Vendors</h2>
          <p className="text-xs md:text-sm text-gray-500">{vendors.length} vendors on platform</p>
        </div>
        
        {vendors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No vendors available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {vendors.map((vendor) => (
              <div 
                key={vendor._id} 
                onClick={() => handleShopClick(vendor.storeSlug)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                {/* Vendor Banner */}
                <div className="relative h-24 sm:h-28 md:h-32 bg-gradient-to-r from-blue-500 to-purple-600">
                  {vendor.banner && vendor.banner !== '' ? (
                    <img 
                      src={vendor.banner} 
                      alt={vendor.storeName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(to right, #3b82f6, #9333ea)';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-10 h-10 md:w-16 md:h-16 text-white opacity-50" />
                    </div>
                  )}
                  
                  {/* Logo Overlay */}
                  <div className="absolute -bottom-6 left-3 sm:left-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white rounded-full shadow-md flex items-center justify-center overflow-hidden border-4 border-white">
                      {vendor.logo && vendor.logo !== '' ? (
                        <img 
                          src={vendor.logo} 
                          alt={vendor.storeName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '';
                            e.target.parentElement.innerHTML = '<svg class="w-6 h-6 md:w-8 md:h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>';
                          }}
                        />
                      ) : (
                        <Store className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Vendor Info */}
                <div className="pt-8 p-3 sm:p-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold mb-1 hover:text-blue-600 transition line-clamp-1">
                    {vendor.storeName}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">
                    {vendor.description || 'Quality products at affordable prices'}
                  </p>
                  
                  {/* Vendor Stats */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span className="text-xs sm:text-sm text-gray-600">
                        {vendor.productCount || 0} products
                      </span>
                    </div>
                    {vendor.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs sm:text-sm font-medium">{vendor.rating}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Shop Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShopClick(vendor.storeSlug);
                    }}
                    className="w-full bg-blue-600 text-white py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    <Store className="w-3 h-3 sm:w-4 sm:h-4" />
                    Visit Store
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <br></br>
      <br></br>

            {/* Features - Mobile Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        {features.map((feature, index) => (
          <div key={index} className="bg-white p-4 md:p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
            <feature.icon className="w-8 h-8 md:w-12 md:h-12 text-blue-600 mx-auto mb-2 md:mb-4" />
            <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2">{feature.title}</h3>
            <p className="text-xs md:text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
      
      {/* CTA Section - Mobile Responsive */}
      {!user && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 md:p-8 mt-8 md:mt-12 text-center text-white">
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Ready to start shopping?</h2>
          <p className="text-sm md:text-base mb-4 md:mb-6">Create an account to browse products and place orders</p>
          <Link to="/login" className="bg-white text-purple-600 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block text-sm md:text-base">
            Sign In / Register
          </Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;