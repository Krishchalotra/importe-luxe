import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCartItems, selectCartTotal, clearCart } from '../redux/slices/cartSlice';
import { createOrder } from '../redux/slices/orderSlice';
import useDebounce from '../hooks/useDebounce';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const { loading } = useSelector((state) => state.orders);

  const shipping = subtotal >= 50000 ? 0 : 499;
  const tax = parseFloat((subtotal * 0.18).toFixed(2));
  const total = subtotal + shipping + tax;

  const [address, setAddress] = useState({
    fullName: '', street: '', city: '', state: '', country: 'India', zipCode: '', phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [pincodeStatus, setPincodeStatus] = useState('idle'); // idle | loading | success | error
  const [pincodeLocations, setPincodeLocations] = useState([]); // multiple post offices
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Fetch location from India Post API when pincode is 6 digits
  const fetchPincodeData = useCallback(async (pincode) => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      setPincodeStatus('idle');
      setPincodeLocations([]);
      return;
    }

    setPincodeStatus('loading');
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();

      if (data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
        const offices = data[0].PostOffice;
        const first = offices[0];

        // Auto-fill city, state, country from first result
        setAddress((prev) => ({
          ...prev,
          city: first.District,
          state: first.State,
          country: 'India',
        }));

        setPincodeLocations(offices);
        setSelectedLocation(offices[0]);
        setPincodeStatus('success');
        toast.success(`📍 ${first.District}, ${first.State}`, {
          style: { background: '#1a1a1a', color: '#e8e8e8', border: '1px solid #2e2e2e' },
        });
      } else {
        setPincodeStatus('error');
        setPincodeLocations([]);
        toast.error('Invalid pincode. Please check and try again.');
      }
    } catch {
      setPincodeStatus('error');
      toast.error('Could not fetch location. Check your connection.');
    }
  }, []);

  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setAddress((prev) => ({ ...prev, zipCode: val }));
    if (val.length === 6) fetchPincodeData(val);
    else { setPincodeStatus('idle'); setPincodeLocations([]); }
  };

  const handleLocationSelect = (office) => {
    setSelectedLocation(office);
    setAddress((prev) => ({
      ...prev,
      city: office.District,
      state: office.State,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Your cart is empty'); return; }

    const orderData = {
      items: items.map((item) => ({ product: item.product._id, quantity: item.quantity })),
      shippingAddress: {
        ...address,
        city: selectedLocation ? `${selectedLocation.Name}, ${selectedLocation.District}` : address.city,
      },
      paymentMethod,
    };

    const result = await dispatch(createOrder(orderData));
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(clearCart());
      toast.success('Order placed successfully');
      navigate(`/orders/${result.payload._id}`);
    } else {
      toast.error(result.payload || 'Failed to place order');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-luxury-subtext mb-4">Your cart is empty</p>
          <button onClick={() => navigate('/products')} className="btn-primary">Shop Now</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl text-luxury-text mb-10">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Shipping Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card-luxury p-6">
                <h2 className="font-serif text-xl text-luxury-text mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-2">Full Name</label>
                    <input
                      type="text"
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      required
                      placeholder="Your full name"
                      className="input-luxury"
                    />
                  </div>

                  {/* Phone */}
                  <div className="sm:col-span-2">
                    <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-2">Phone</label>
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      required
                      placeholder="+91 XXXXX XXXXX"
                      className="input-luxury"
                    />
                  </div>

                  {/* Pincode — triggers auto-fill */}
                  <div>
                    <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-2">
                      Pincode
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={address.zipCode}
                        onChange={handlePincodeChange}
                        required
                        maxLength={6}
                        placeholder="6-digit pincode"
                        className={`input-luxury pr-10 ${
                          pincodeStatus === 'success' ? 'border-green-500' :
                          pincodeStatus === 'error' ? 'border-red-500' : ''
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {pincodeStatus === 'loading' && (
                          <svg className="w-4 h-4 text-gold-400 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                        )}
                        {pincodeStatus === 'success' && (
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {pincodeStatus === 'error' && (
                          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* City — auto-filled */}
                  <div>
                    <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-2">District / City</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      required
                      placeholder="Auto-filled from pincode"
                      className="input-luxury"
                    />
                  </div>

                  {/* State — auto-filled */}
                  <div>
                    <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-2">State</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      required
                      placeholder="Auto-filled from pincode"
                      className="input-luxury"
                    />
                  </div>

                  {/* Country — locked to India */}
                  <div>
                    <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-2">Country</label>
                    <input
                      type="text"
                      value="India"
                      readOnly
                      className="input-luxury opacity-60 cursor-not-allowed"
                    />
                  </div>

                  {/* Post Office selector — shown after pincode lookup */}
                  {pincodeLocations.length > 0 && (
                    <div className="sm:col-span-2">
                      <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-2">
                        Select Post Office / Area
                        <span className="ml-2 text-gold-400 normal-case tracking-normal">({pincodeLocations.length} found)</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {pincodeLocations.map((office) => (
                          <button
                            key={office.Name}
                            type="button"
                            onClick={() => handleLocationSelect(office)}
                            className={`text-left px-3 py-2.5 border text-xs transition-all duration-150 ${
                              selectedLocation?.Name === office.Name
                                ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                                : 'border-luxury-border text-luxury-subtext hover:border-luxury-subtext hover:text-luxury-text'
                            }`}
                          >
                            <p className="font-medium">{office.Name}</p>
                            <p className="opacity-70 mt-0.5">{office.BranchType} · {office.DeliveryStatus}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Street Address */}
                  <div className="sm:col-span-2">
                    <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-2">Street Address</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      required
                      placeholder="House no., Building, Street, Area"
                      className="input-luxury"
                    />
                  </div>

                </div>
              </div>

              {/* Payment */}
              <div className="card-luxury p-6">
                <h2 className="font-serif text-xl text-luxury-text mb-6">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { value: 'stripe', label: 'Credit / Debit Card (Stripe)' },
                    { value: 'cod', label: 'Cash on Delivery' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value={opt.value}
                        checked={paymentMethod === opt.value}
                        onChange={() => setPaymentMethod(opt.value)}
                        className="accent-gold-500"
                      />
                      <span className="text-sm text-luxury-text">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card-luxury p-6 sticky top-28">
                <h2 className="font-serif text-xl text-luxury-text mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.product._id} className="flex gap-3">
                      <img src={item.product.images[0]?.url} alt={item.product.name} className="w-14 h-14 object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-luxury-text truncate">{item.product.name}</p>
                        <p className="text-xs text-luxury-subtext">Qty: {item.quantity}</p>
                        <p className="text-xs text-gold-400">₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery location preview */}
                {selectedLocation && (
                  <div className="border border-gold-500/30 bg-gold-500/5 p-3 mb-4">
                    <p className="text-xs text-gold-400 tracking-widest uppercase mb-1">Delivering to</p>
                    <p className="text-sm text-luxury-text">{selectedLocation.Name}</p>
                    <p className="text-xs text-luxury-subtext">{selectedLocation.District}, {selectedLocation.State} — {address.zipCode}</p>
                  </div>
                )}

                <div className="border-t border-luxury-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-luxury-subtext">
                    <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-luxury-subtext">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-400">Free</span> : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-luxury-subtext">
                    <span>GST (18%)</span><span>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-luxury-text font-medium text-base border-t border-luxury-border pt-2 mt-2">
                    <span>Total</span><span className="text-gold-400">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full mt-6 disabled:opacity-50">
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
