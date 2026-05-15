import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { clearCart } from '../redux/slices/cartSlice';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items, total, subtotal, tax, shippingCost } = useSelector(state => state.cart);
  const { user, token } = useSelector(state => state.auth);
  
  const [processing, setProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: ''
  });

  const grandTotal = total || (subtotal + tax + shippingCost);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast.error('Stripe not initialized');
      return;
    }
    
    setProcessing(true);
    
    try {
      // Create payment intent
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/orders/create-payment-intent`,
        { items, total: grandTotal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user.name,
            email: user.email,
            address: shippingAddress
          }
        }
      });
      
      if (error) {
        toast.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Create order in database
        await axios.post(
          `${import.meta.env.VITE_API_URL}/orders`,
          {
            items,
            total: grandTotal,
            shippingAddress,
            paymentIntentId: paymentIntent.id
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        toast.success('Order placed successfully!');
        dispatch(clearCart());
        navigate('/orders');
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': { color: '#aab7c4' }
      },
      invalid: { color: '#9e2146' }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Address */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Street Address"
            required
            value={shippingAddress.street}
            onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="City"
              required
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="State"
              required
              value={shippingAddress.state}
              onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ZIP Code"
              required
              value={shippingAddress.zipCode}
              onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              required
              value={shippingAddress.phone}
              onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Payment Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Payment Details</h2>
        <div className="border border-gray-300 rounded-md p-4">
          <CardElement options={cardElementOptions} />
        </div>
      </div>
      
      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${shippingCost?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (10%)</span>
            <span>${tax?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${grandTotal?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full bg-blue-600 text-white py-3 rounded-md mt-4 hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {processing ? 'Processing...' : `Pay $${grandTotal?.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;