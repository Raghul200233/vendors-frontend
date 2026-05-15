import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { ShoppingCart, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ShopPage = () => {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector(state => state.products);
  const { user } = useSelector(state => state.auth);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ category: category !== 'all' ? category : undefined, search }));
  }, [dispatch, category, search]);

  const categories = ['all', 'Electronics', 'Clothing', 'Books', 'Home', 'Beauty', 'Sports'];

  const handleAddToCart = (product) => {
    // Only customers can add to cart
    if (user && user.role !== 'customer') {
      toast.error('Only customers can purchase products');
      return;
    }
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success('Added to cart!');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Shop</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-md whitespace-nowrap ${
                  category === cat 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field md:w-64"
          />
        </div>
      </div>
      
      {/* Role warning for non-customers */}
      {user && user.role !== 'customer' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
            <p className="text-yellow-700">
              You are logged in as a {user.role}. Only customers can purchase products.
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map(product => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <Link to={`/product/${product.slug}`}>
              <img 
                src={product.images[0]?.url || 'https://via.placeholder.com/300'} 
                alt={product.name}
                className="w-full h-48 object-cover hover:scale-105 transition duration-300"
              />
            </Link>
            <div className="p-4">
              <Link to={`/product/${product.slug}`}>
                <h3 className="font-semibold mb-2 hover:text-blue-600">{product.name}</h3>
              </Link>
              <p className="text-gray-600 text-sm mb-2">{product.category}</p>
              
              {/* Show size info for clothing */}
              {product.category === 'Clothing' && product.sizeInventory && (
                <p className="text-xs text-gray-500 mb-2">
                  Sizes: {product.sizeInventory.map(s => s.size).join(', ')}
                </p>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-blue-600">${product.basePrice}</span>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={product.inventory === 0 || (user && user.role !== 'customer')}
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
              
              {product.inventory === 0 && (
                <p className="text-red-500 text-sm mt-2">Out of stock</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No products found.
        </div>
      )}
    </div>
  );
};

export default ShopPage;