import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Store, Star, Package, Truck, Shield, Headphones, ShoppingBag, Heart } from 'lucide-react';
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
    { icon: Truck, title: 'Fast Shipping', description: 'Free delivery on orders over $50' },
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
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-12 mb-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to MultiShop
          </h1>
          <p className="text-lg mb-6 text-blue-100">
            Discover amazing products from independent vendors. Shop unique items and support small businesses.
          </p>
          {!user && (
            <div className="flex gap-4">
              <Link to="/register?role=customer" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Shop Now
              </Link>
              <Link to="/register?role=vendor" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
                Sell With Us
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Vendors Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Our Trusted Vendors</h2>
          <p className="text-gray-500">{vendors.length} vendors on platform</p>
        </div>
        
        {vendors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No vendors available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vendors.map((vendor) => (
              <div 
                key={vendor._id} 
                onClick={() => handleShopClick(vendor.storeSlug)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                {/* Vendor Banner/Logo */}
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
                  {vendor.banner ? (
                    <img 
                      src={vendor.banner} 
                      alt={vendor.storeName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                  {/* Logo overlay */}
                  <div className="absolute -bottom-8 left-4">
                    <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center overflow-hidden border-4 border-white">
                      {vendor.logo ? (
                        <img 
                          src={vendor.logo} 
                          alt={vendor.storeName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Vendor Info */}
                <div className="pt-10 p-4">
                  <h3 className="text-xl font-bold mb-1 hover:text-blue-600 transition">
                    {vendor.storeName}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {vendor.description || 'Quality products at affordable prices'}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {vendor.productCount || 0} products
                      </span>
                    </div>
                    {vendor.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{vendor.rating}</span>
                        <span className="text-xs text-gray-500">({vendor.totalReviews || 0})</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Shop Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShopClick(vendor.storeSlug);
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Store className="w-4 h-4" />
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

            {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition">
            <feature.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
      
      {/* CTA Section for Non-logged in users */}
      {!user && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mt-12 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to start shopping?</h2>
          <p className="mb-6">Create an account to browse products and place orders</p>
          <Link to="/login" className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block">
            Sign In / Register
          </Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;