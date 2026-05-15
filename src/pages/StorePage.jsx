import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Store, Star, Package, ShoppingCart, AlertCircle, MapPin, Mail, Phone } from 'lucide-react';
import axios from 'axios';
import { addToCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const StorePage = () => {
  const { storeSlug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchVendorProducts();
  }, [storeSlug]);

  const fetchVendorProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/vendor/store/${storeSlug}`);
      setVendor(response.data.vendor);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Failed to fetch store:', error);
      toast.error('Store not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'customer') {
      toast.error('Only customers can purchase products');
      return;
    }
    
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success('Added to cart!');
  };

  const handleBuyNow = (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'customer') {
      toast.error('Only customers can purchase products');
      return;
    }
    
    dispatch(addToCart({ product, quantity: 1 }));
    navigate('/cart');
  };

  // Get unique categories from products
  const categories = ['all', ...new Set(products.map(p => p.category))];
  
  // Filter products by category
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Store Not Found</h2>
        <p className="text-gray-600">The store you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Store Banner */}
      <div className="relative h-64 rounded-xl overflow-hidden mb-8">
        {vendor.banner ? (
          <img 
            src={vendor.banner} 
            alt={vendor.storeName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Store className="w-24 h-24 text-white opacity-30" />
          </div>
        )}
        
        {/* Store Logo Overlay */}
        <div className="absolute -bottom-12 left-8">
          <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
            {vendor.logo ? (
              <img 
                src={vendor.logo} 
                alt={vendor.storeName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store className="w-12 h-12 text-blue-600" />
            )}
          </div>
        </div>
      </div>
      
      {/* Store Info */}
      <div className="ml-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">{vendor.storeName}</h1>
        <div className="flex items-center gap-4 mb-3">
          {vendor.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{vendor.rating}</span>
              <span className="text-gray-500">({vendor.totalReviews || 0} reviews)</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-gray-500">
            <Package className="w-4 h-4" />
            <span>{products.length} products</span>
          </div>
        </div>
        <p className="text-gray-700 max-w-2xl">{vendor.description}</p>
      </div>
      
      {/* Categories Filter */}
      <div className="mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat === 'all' ? 'All Products' : cat}
            </button>
          ))}
        </div>
      </div>
      
      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="relative h-48">
                <img 
                  src={product.images[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image'} 
                  alt={product.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => navigate(`/product/${product.slug}`)}
                />
                {!isAuthenticated && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                    Login to buy
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 
                    className="font-semibold text-lg cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  >
                    {product.name}
                  </h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                
                {/* Size info for clothing */}
                {product.category === 'Clothing' && product.sizeInventory && (
                  <p className="text-xs text-gray-500 mb-2">
                    Sizes: {product.sizeInventory.map(s => s.size).join(', ')}
                  </p>
                )}
                
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">
                      ${product.basePrice}
                    </span>
                    {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                      <span className="text-gray-400 line-through text-sm ml-2">
                        ${product.compareAtPrice}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    Stock: {product.inventory}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.inventory === 0}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Cart
                  </button>
                  <button
                    onClick={() => handleBuyNow(product)}
                    disabled={product.inventory === 0}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Buy Now
                  </button>
                </div>
                
                {product.inventory === 0 && (
                  <p className="text-red-500 text-sm mt-2">Out of stock</p>
                )}
                
                {!isAuthenticated && (
                  <p className="text-yellow-600 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Login required to purchase
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StorePage;