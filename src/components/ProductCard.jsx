import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ShoppingCart } from 'lucide-react';
import { addToCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success('Added to cart!');
  };

  return (
    <Link to={`/product/${product.slug}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative overflow-hidden h-64">
          <img 
            src={product.images[0]?.url || 'https://via.placeholder.com/300'} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
            <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
              Sale!
            </span>
          )}
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-1">{product.category}</p>
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition">
            {product.name}
          </h3>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">
                ${product.basePrice.toFixed(2)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                <span className="text-gray-400 line-through text-sm">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
              disabled={product.inventory === 0}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
          
          {product.inventory < 5 && product.inventory > 0 && (
            <p className="text-orange-500 text-sm mt-2">
              Only {product.inventory} left in stock!
            </p>
          )}
          {product.inventory === 0 && (
            <p className="text-red-500 text-sm mt-2">Out of stock</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;