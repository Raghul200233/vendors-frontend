import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import toast from 'react-hot-toast';
import { clearCart } from '../redux/slices/cartSlice';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { items, total } = useSelector(state => state.cart);
  const { user, token } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    
    setProcessing(true);
    
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/orders/create-payment-intent`,
        { items, total: total + (total > 50 ? 0 : 5.99) + (total * 0.1) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: user.name, email: user.email }
        }
      });
      
      if (error) {
        toast.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/orders`,
          {
            items,
            total: total + (total > 50 ? 0 : 5.99) + (total * 0.1),
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
      toast.error('Payment failed');
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Street Address"
            required
            value={shippingAddress.street}
            onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
            className="input-field"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="City"
              required
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
              className="input-field"
            />
            <input
              type="text"
              placeholder="State"
              required
              value={shippingAddress.state}
              onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ZIP Code"
              required
              value={shippingAddress.zipCode}
              onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
              className="input-field"
            />
            <input
              type="tel"
              placeholder="Phone"
              required
              value={shippingAddress.phone}
              onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Payment Details</h2>
        <div className="border rounded-md p-4">
          <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between text-lg mb-4">
          <span>Total:</span>
          <span className="font-bold">${(total + (total > 50 ? 0 : 5.99) + (total * 0.1)).toFixed(2)}</span>
        </div>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="btn-primary w-full"
        >
          {processing ? 'Processing...' : `Pay $${(total + (total > 50 ? 0 : 5.99) + (total * 0.1)).toFixed(2)}`}
        </button>
      </div>
    </form>
  );
};

const CheckoutPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <CheckoutForm />
      </div>
    </Elements>
  );
};

export default CheckoutPage;