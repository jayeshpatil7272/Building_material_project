'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, MapPin, CreditCard, Truck, CheckCircle2,
  X, Plus, Minus, ArrowLeft, Phone, Package, AlertCircle
} from 'lucide-react';

interface CartItem {
  product: {
    id: string; name: string; brand: string; unit: string;
    basePrice: number; mrp: number; gstRate: number; images: string;
  };
  quantity: number;
}

function getImageUrl(images: string): string {
  try {
    const arr = JSON.parse(images);
    return Array.isArray(arr) && arr[0] ? arr[0] : 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200&auto=format&fit=crop&q=80';
  } catch { return 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200&auto=format&fit=crop&q=80'; }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<'address' | 'payment' | 'review'>('address');
  const [orderStatus, setOrderStatus] = useState<'idle' | 'placing' | 'success' | 'error'>('idle');
  const [orderNumber, setOrderNumber] = useState('');

  const [address, setAddress] = useState({
    name: '', phone: '', line1: '', line2: '', city: 'Jalgaon',
    state: 'Maharashtra', pincode: '', landmark: ''
  });
  const [deliveryDistance, setDeliveryDistance] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jsr_cart');
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, []);

  const subtotal = cart.reduce((s, i) => s + i.product.basePrice * i.quantity, 0);
  const gstAmount = cart.reduce((s, i) => s + (i.product.basePrice * i.quantity * i.product.gstRate) / 100, 0);
  const deliveryCharge = Math.min(deliveryDistance * 15, 2000);
  const total = subtotal + gstAmount + deliveryCharge;

  const updateQty = (id: string, qty: number) => {
    const updated = qty <= 0 ? cart.filter(i => i.product.id !== id) : cart.map(i => i.product.id === id ? { ...i, quantity: qty } : i);
    setCart(updated);
    localStorage.setItem('jsr_cart', JSON.stringify(updated));
  };

  const handlePlaceOrder = async () => {
    if (!address.name || !address.phone || !address.line1 || !address.pincode) {
      alert('Please fill all required address fields');
      return;
    }
    setOrderStatus('placing');
    try {
      const res = await fetch('/api/v2/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })),
          address, deliveryDistance, paymentMethod, notes
        })
      });
      if (res.ok) {
        const data = await res.json();
        setOrderNumber(data.orderNumber);
        setOrderStatus('success');
        localStorage.removeItem('jsr_cart');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to place order');
        setOrderStatus('error');
      }
    } catch {
      setOrderStatus('error');
    }
  };

  if (orderStatus === 'success') {
    return (
      <div className="min-h-screen bg-[#0a0a0e] flex items-center justify-center px-4 pt-20">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full text-center space-y-8">
          <div className="w-28 h-28 mx-auto bg-green-500/10 border-2 border-green-500/40 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-14 h-14 text-green-400" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold text-white font-display">Order Placed!</h1>
            <p className="text-gray-400 text-sm">Your order has been received. Our dispatch team will confirm within 2 hours.</p>
          </div>
          <div className="glassmorphism border border-premium-border rounded-2xl p-6 space-y-2">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Order Number</p>
            <p className="text-2xl font-extrabold text-const-orange font-mono">{orderNumber}</p>
          </div>
          <div className="flex flex-col gap-3">
            <a href={`https://wa.me/918010871044?text=Hi, I placed order ${orderNumber}. Please confirm.`} target="_blank" rel="noopener noreferrer"
              className="block bg-green-600 text-white font-bold py-3 rounded-2xl text-sm">📱 Track on WhatsApp</a>
            <button onClick={() => router.push('/marketplace')} className="bg-const-orange text-white font-bold py-3 rounded-2xl text-sm">
              Continue Shopping →
            </button>
            <button onClick={() => router.push('/portal')} className="bg-white/5 border border-premium-border text-gray-300 font-bold py-3 rounded-2xl text-sm">
              View My Orders
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0e] flex items-center justify-center pt-20">
        <div className="text-center space-y-4">
          <ShoppingCart className="w-16 h-16 text-gray-700 mx-auto" />
          <p className="text-gray-400">Your cart is empty</p>
          <button onClick={() => router.push('/marketplace')} className="bg-const-orange text-white font-bold px-6 py-3 rounded-xl text-sm">
            Go to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0e] pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => router.push('/marketplace')} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-white font-display">Checkout</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center space-x-4 mb-8">
          {[{ id: 'address', label: 'Address', icon: MapPin }, { id: 'payment', label: 'Payment', icon: CreditCard }, { id: 'review', label: 'Review', icon: Package }].map((s, i) => (
            <React.Fragment key={s.id}>
              <button onClick={() => setStep(s.id as any)}
                className={`flex items-center space-x-2 text-xs font-bold ${step === s.id ? 'text-const-orange' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step === s.id ? 'bg-const-orange border-const-orange text-white' : 'border-gray-700 text-gray-500'}`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <span className="hidden sm:block">{s.label}</span>
              </button>
              {i < 2 && <div className="flex-1 h-px bg-gray-800 max-w-[60px]" />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Address */}
            {(step === 'address' || step === 'review') && (
              <div className="glassmorphism p-6 rounded-3xl border border-premium-border space-y-5">
                <h2 className="font-bold text-white flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-const-orange" />
                  <span>Delivery Address</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Contact Name *', key: 'name', type: 'text', placeholder: 'Full name' },
                    { label: 'Phone Number *', key: 'phone', type: 'tel', placeholder: '+91 XXXXX XXXXX' },
                    { label: 'Address Line 1 *', key: 'line1', type: 'text', placeholder: 'House/Plot/Survey No, Street' },
                    { label: 'Address Line 2', key: 'line2', type: 'text', placeholder: 'Village/Area/Colony' },
                    { label: 'City', key: 'city', type: 'text', placeholder: 'City' },
                    { label: 'Pincode *', key: 'pincode', type: 'text', placeholder: '425XXX' },
                    { label: 'Landmark', key: 'landmark', type: 'text', placeholder: 'Near Bus Stand, School, etc.' },
                  ].map(field => (
                    <div key={field.key} className={field.key === 'line1' || field.key === 'landmark' ? 'sm:col-span-2' : ''}>
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">{field.label}</label>
                      <input type={field.type} placeholder={field.placeholder} value={(address as any)[field.key]}
                        onChange={e => setAddress({ ...address, [field.key]: e.target.value })}
                        className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-const-orange" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    Distance from Bhadgaon: <span className="text-const-orange">{deliveryDistance} km</span>
                  </label>
                  <input type="range" min="0" max="150" value={deliveryDistance}
                    onChange={e => setDeliveryDistance(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-const-orange" />
                  <p className="text-[9px] text-gray-500">Delivery charge: ₹{deliveryCharge.toLocaleString('en-IN')}</p>
                </div>
                {step === 'address' && (
                  <button onClick={() => setStep('payment')} className="w-full bg-const-orange text-white font-bold py-3 rounded-2xl text-sm hover:scale-[1.01] transition-transform">
                    Continue to Payment →
                  </button>
                )}
              </div>
            )}

            {/* Step 2: Payment */}
            {(step === 'payment' || step === 'review') && (
              <div className="glassmorphism p-6 rounded-3xl border border-premium-border space-y-5">
                <h2 className="font-bold text-white flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-const-orange" />
                  <span>Payment Method</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when materials arrive' },
                    { value: 'upi', label: 'UPI / GPay', icon: '📱', desc: 'Instant UPI transfer' },
                    { value: 'bank', label: 'Bank Transfer', icon: '🏦', desc: 'NEFT/RTGS for bulk orders' },
                  ].map(pm => (
                    <button key={pm.value} onClick={() => setPaymentMethod(pm.value)}
                      className={`p-4 rounded-2xl border text-left transition-all ${paymentMethod === pm.value ? 'bg-const-orange/15 border-const-orange' : 'bg-white/3 border-premium-border hover:bg-white/5'}`}>
                      <div className="text-xl mb-1">{pm.icon}</div>
                      <div className="text-xs font-bold text-white">{pm.label}</div>
                      <div className="text-[10px] text-gray-500">{pm.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Special Instructions</label>
                  <textarea rows={3} placeholder="Delivery timing preference, site access instructions..." value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full bg-white/5 border border-premium-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-const-orange resize-none" />
                </div>
                {step === 'payment' && (
                  <button onClick={() => setStep('review')} className="w-full bg-const-orange text-white font-bold py-3 rounded-2xl text-sm hover:scale-[1.01] transition-transform">
                    Review Order →
                  </button>
                )}
              </div>
            )}

            {/* Step 3: Place Order */}
            {step === 'review' && (
              <div className="space-y-4">
                <button onClick={handlePlaceOrder} disabled={orderStatus === 'placing'}
                  className="w-full bg-gradient-to-r from-const-orange to-amber-600 text-white font-extrabold text-base py-5 rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60">
                  {orderStatus === 'placing' ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Placing Order...</span>
                    </span>
                  ) : `✅ Place Order — ₹${Math.round(total).toLocaleString('en-IN')}`}
                </button>
                <a href={`https://wa.me/918010871044?text=Hi, I want to place a bulk order. Total: ₹${Math.round(total).toLocaleString('en-IN')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="block w-full bg-green-600/20 border border-green-600/30 text-green-400 font-bold py-3 rounded-2xl text-sm text-center">
                  📱 Order via WhatsApp Instead
                </a>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-4">
            <div className="glassmorphism border border-premium-border rounded-3xl p-5 space-y-4 sticky top-24">
              <h2 className="font-bold text-white text-sm">Order Summary ({cart.length} items)</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.product.id} className="flex gap-3">
                    <img src={getImageUrl(item.product.images)} className="w-12 h-12 rounded-xl object-cover" alt={item.product.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white line-clamp-1">{item.product.name}</p>
                      <p className="text-[10px] text-gray-500">{item.quantity} {item.product.unit}</p>
                      <p className="text-xs text-const-orange font-bold">₹{(item.product.basePrice * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="w-5 h-5 rounded bg-white/10 text-white text-xs flex items-center justify-center">−</button>
                      <span className="text-white text-xs w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product.id, item.quantity + 1)} className="w-5 h-5 rounded bg-white/10 text-white text-xs flex items-center justify-center">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-premium-border/40 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-gray-400"><span>GST</span><span className="text-white">₹{Math.round(gstAmount).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-gray-400"><span>Delivery ({deliveryDistance}km)</span><span className="text-white">₹{deliveryCharge.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-extrabold text-sm text-white border-t border-premium-border/40 pt-2">
                  <span>Total</span>
                  <span className="text-const-orange">₹{Math.round(total).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-gray-500 bg-const-orange/5 border border-const-orange/10 rounded-xl p-3">
                <Phone className="w-3 h-3 text-const-orange shrink-0" />
                <span>Need help? Call <span className="text-const-orange font-bold">+91 8010871044</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
