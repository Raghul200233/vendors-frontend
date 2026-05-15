import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductBySlug } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct, isLoading } = useSelector(state => state.products);
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated, user } = useSelector(state => state.auth);

  useEffect(() => {
    if (slug) {
      dispatch(fetchProductBySlug(slug));
    }
  }, [dispatch, slug]);

const handleAddToCart = () => {
  if (!isAuthenticated) {
    toast.error('Please login to add items to cart');
    navigate('/login');
    return;
  }
  
  if (user.role !== 'customer') {
    toast.error('Only customers can purchase products');
    return;
  }
  
  if (currentProduct) {
    dispatch(addToCart({ product: currentProduct, quantity }));
    toast.success('Added to cart!');
  }
};

const handleBuyNow = () => {
  if (!isAuthenticated) {
    toast.error('Please login to purchase');
    navigate('/login');
    return;
  }
  
  if (user.role !== 'customer') {
    toast.error('Only customers can purchase products');
    return;
  }
  
  handleAddToCart();
  navigate('/cart');
};

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!currentProduct) {
    return <div className="text-center py-12">Product not found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <img
          src={currentProduct.images[0]?.url || 'https://via.placeholder.com/500'}
          alt={currentProduct.name}
          className="w-full rounded-lg shadow-lg"
        />
      </div>
      
      <div>
        <h1 className="text-3xl font-bold mb-4">{currentProduct.name}</h1>
        <p className="text-gray-600 mb-4">{currentProduct.category}</p>
        <div className="text-3xl font-bold text-primary-600 mb-4">
          ${currentProduct.basePrice}
        </div>
        <p className="text-gray-700 mb-6">{currentProduct.description}</p>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Quantity</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1 border rounded-md hover:bg-gray-100"
            >
              -
            </button>
            <span className="w-12 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(currentProduct.inventory, quantity + 1))}
              className="px-3 py-1 border rounded-md hover:bg-gray-100"
            >
              +
            </button>
            <span className="text-gray-600 ml-4">
              {currentProduct.inventory} available
            </span>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handleAddToCart}
            className="flex-1 btn-secondary"
            disabled={currentProduct.inventory === 0}
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 btn-primary"
            disabled={currentProduct.inventory === 0}
          >
            Buy Now
          </button>
        </div>
        
        {currentProduct.inventory === 0 && (
          <p className="text-red-600 mt-4">Out of stock</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;