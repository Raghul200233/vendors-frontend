import { createSlice } from '@reduxjs/toolkit';

const loadCart = () => {
  const saved = localStorage.getItem('cart');
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    items: [],
    subtotal: 0,
    tax: 0,
    shippingCost: 0,
    total: 0
  };
};

const calculateTotals = (state) => {
  state.subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  state.tax = state.subtotal * 0.1; // 10% tax
  state.shippingCost = state.subtotal > 50 ? 0 : 5.99;
  state.total = state.subtotal + state.tax + state.shippingCost;
  
  // Round to 2 decimals
  state.subtotal = Math.round(state.subtotal * 100) / 100;
  state.tax = Math.round(state.tax * 100) / 100;
  state.shippingCost = Math.round(state.shippingCost * 100) / 100;
  state.total = Math.round(state.total * 100) / 100;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCart(),
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.productId === product._id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          productId: product._id,
          vendorId: product.vendorId,
          name: product.name,
          price: product.basePrice,
          quantity,
          image: product.images?.[0]?.url,
          stock: product.inventory
        });
      }
      
      calculateTotals(state);
      localStorage.setItem('cart', JSON.stringify(state));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
      calculateTotals(state);
      localStorage.setItem('cart', JSON.stringify(state));
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.productId === productId);
      if (item && quantity > 0 && quantity <= (item.stock || 99)) {
        item.quantity = quantity;
        calculateTotals(state);
        localStorage.setItem('cart', JSON.stringify(state));
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.tax = 0;
      state.shippingCost = 0;
      state.total = 0;
      localStorage.removeItem('cart');
    }
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;