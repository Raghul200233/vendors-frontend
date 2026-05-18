import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../api/axios';  // Import your configured api instance
import toast from 'react-hot-toast';
import { clearCart } from '../redux/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, CreditCard, Smartphone, Truck, MapPin, Phone, Mail } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { items, total } = useSelector(state => state.cart);
  const { user, token } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'upi'
  const [upiId, setUpiId] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: ''
  });

  // Calculate totals in INR
  const subtotal = total;
  const tax = subtotal * 0.05; // 5% GST
  const shippingCost = subtotal > 500 ? 0 : 49;
  const grandTotal = subtotal + tax + shippingCost;

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe) return;
    
    setProcessing(true);
    
    try {
      let paymentIntent;
      
      if (paymentMethod === 'upi') {
        // Create payment intent for UPI - Using api instance
        const { data } = await api.post(
          '/orders/create-payment-intent',  // Remove base URL, api handles it
          { items, total: grandTotal },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        paymentIntent = data;
        
        // For UPI, we'll simulate confirmation (in production, use UPI collect)
        toast.success('UPI payment initiated. Please check your UPI app.');
        
        // Create order after UPI intent - Using api instance
        await api.post(
          '/orders',  // Remove base URL, api handles it
          {
            items,
            total: grandTotal,
            shippingAddress,
            paymentIntentId: paymentIntent.clientSecret,
            paymentMethod: 'upi'
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        toast.success('Order placed successfully!');
        dispatch(clearCart());
        navigate('/orders');
      } else {
        // Card payment - Using api instance
        const { data } = await api.post(
          '/orders/create-payment-intent',  // Remove base URL, api handles it
          { items, total: grandTotal },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const { error, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(data.clientSecret, {
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
        } else if (confirmedIntent.status === 'succeeded') {
          // Create order after successful payment - Using api instance
          await api.post(
            '/orders',  // Remove base URL, api handles it
            {
              items,
              total: grandTotal,
              shippingAddress,
              paymentIntentId: confirmedIntent.id,
              paymentMethod: 'card'
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          toast.success('Payment successful! Order placed.');
          dispatch(clearCart());
          navigate('/orders');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
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
      {/* Mobile responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Address & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Street Address"
                required
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm md:text-base"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm md:text-base"
                />
                <input
                  type="text"
                  placeholder="State"
                  required
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm md:text-base"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="PIN Code"
                  required
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm md:text-base"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm md:text-base"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="w-4 h-4"
                />
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Credit / Debit Card</p>
                  <p className="text-xs text-gray-500">Visa, Mastercard, RuPay, American Express</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="w-4 h-4"
                />
                <Smartphone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">UPI / BHIM / Google Pay / PhonePe</p>
                  <p className="text-xs text-gray-500">Pay using any UPI app</p>
                </div>
              </label>
            </div>

            {paymentMethod === 'upi' && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">UPI ID (Optional for collect)</label>
                <input
                  type="text"
                  placeholder="yourname@okhdfcbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You'll be redirected to your UPI app to complete payment
                </p>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="mt-4 border rounded-md p-3">
                <CardElement options={cardElementOptions} />
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 md:p-6 sticky top-24">
            <h2 className="text-lg md:text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (5%)</span>
                <span className="font-medium">₹{tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-base md:text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!stripe || processing}
              className="w-full bg-blue-600 text-white py-3 rounded-md mt-4 hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2 text-sm md:text-base"
            >
              {processing ? (
                'Processing...'
              ) : (
                <>
                  <IndianRupee className="w-4 h-4" />
                  Pay ₹{grandTotal.toFixed(2)}
                </>
              )}
            </button>
            
            <div className="mt-4 text-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" 
                alt="UPI" 
                className="h-8 mx-auto opacity-75"
              />
              <p className="text-xs text-gray-500 mt-2">Secure payment powered by Stripe</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

const CheckoutPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>
        <CheckoutForm />
      </div>
    </Elements>
  );
};

export default CheckoutPage;