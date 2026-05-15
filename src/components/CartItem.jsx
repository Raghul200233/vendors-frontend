import React from 'react';
import { useDispatch } from 'react-redux';
import { Trash2, Minus, Plus } from 'lucide-react';
import { updateQuantity, removeFromCart } from '../redux/slices/cartSlice';

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  const handleIncrease = () => {
    if (item.quantity < (item.stock || 99)) {
      dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }));
    }
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }));
    }
  };

  const handleRemove = () => {
    dispatch(removeFromCart(item.productId));
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow-sm mb-4">
      <img 
        src={item.image || 'https://via.placeholder.com/100'} 
        alt={item.name}
        className="w-24 h-24 object-cover rounded"
      />
      
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{item.name}</h3>
        <p className="text-gray-600">${item.price.toFixed(2)}</p>
        
        <div className="flex items-center gap-3 mt-2">
          <button 
            onClick={handleDecrease}
            className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <button 
            onClick={handleIncrease}
            className="p-1 rounded-md bg-gray-100 hover:bg-gray-200"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <button 
            onClick={handleRemove}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default CartItem;