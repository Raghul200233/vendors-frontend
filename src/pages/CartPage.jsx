import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, IndianRupee } from 'lucide-react';
import { removeFromCart, updateQuantity, clearCart } from '../redux/slices/cartSlice';

const CartPage = () => {
  const { items, total } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Calculate totals in INR
  const subtotal = total;
  const tax = subtotal * 0.05; // 5% GST
  const shippingCost = subtotal > 500 ? 0 : 49;
  const grandTotal = subtotal + tax + shippingCost;

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'customer') {
      toast.error('Only customers can checkout');
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:flex-1">
          {items.map(item => (
            <div key={item.productId} className="bg-white rounded-lg shadow-md p-4 mb-4 flex flex-col sm:flex-row gap-4">
              <img 
                src={item.image || 'https://via.placeholder.com/100'} 
                alt={item.name}
                className="w-24 h-24 object-cover rounded mx-auto sm:mx-0"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-center sm:text-left">{item.name}</h3>
                <p className="text-blue-600 font-bold mt-1 text-center sm:text-left">₹{item.price}</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
                  <button
                    onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                    className="p-1 rounded-md bg-gray-200 hover:bg-gray-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                    className="p-1 rounded-md bg-gray-200 hover:bg-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => dispatch(removeFromCart(item.productId))}
                    className="ml-auto text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={() => dispatch(clearCart())}
            className="text-red-600 hover:text-red-700 mt-4 text-sm"
          >
            Clear Cart
          </button>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-96">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full mt-4">
              Proceed to Checkout
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Secure payment powered by Stripe | UPI, Cards accepted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;