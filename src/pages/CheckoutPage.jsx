import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { CreditCard, Smartphone, Wallet, MapPin, ChevronRight, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI / QR Code', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
  { id: 'wallet', label: 'Digital Wallet', icon: Wallet, desc: 'Amazon Pay, Mobikwik' },
  { id: 'cod', label: 'Cash on Delivery', icon: ShoppingBag, desc: 'Pay when delivered' },
];

const STEPS = ['Delivery', 'Payment', 'Review'];

export default function CheckoutPage() {
  const { items, subtotal, deliveryCharge, taxAmount, total, couponDiscount, clearCart } = useCart();
  const { user, isAuthenticated, addOrder } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    line: user?.addresses?.[0]?.line || '',
    city: user?.addresses?.[0]?.city || 'Mumbai',
    pin: user?.addresses?.[0]?.pin || '',
    landmark: '',
  });
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current,
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, [step]);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    await new Promise(r => setTimeout(r, 2000));
    const orderId = `SAV-${Date.now().toString().slice(-6)}`;
    if (isAuthenticated) {
      addOrder({
        id: orderId,
        items: items.map(i => ({ name: i.name, qty: i.quantity, price: i.price })),
        total,
        status: 'preparing',
        date: new Date().toISOString(),
        address: `${address.line}, ${address.city}`,
        paymentMethod,
      });
    }
    clearCart();
    navigate(`/track?orderId=${orderId}`, { replace: true });
    toast.custom((t) => (
      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl glass-gold border border-[#c9933a]/30 shadow-2xl ${t.visible ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
        <span className="text-2xl">🎉</span>
        <div>
          <p className="font-semibold text-[#f8f0e3]">Order Placed!</p>
          <p className="text-xs text-[#7a6b4e]">Your Savoria feast is being prepared</p>
        </div>
      </div>
    ), { duration: 4000 });
  };

  useEffect(() => {
    if (items.length === 0 && !placing) {
      navigate('/menu');
    }
  }, [items.length, placing, navigate]);

  if (items.length === 0 && !placing) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header + Steps */}
        <div className="mb-8">
          <h1
            className="font-display font-bold text-3xl text-[#f8f0e3] mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Checkout
          </h1>

          {/* Progress Steps */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                      i < step ? 'step-done' :
                      i === step ? 'step-active' :
                      'step-pending'
                    }`}
                  >
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-[#c9933a]' : i < step ? 'text-[#7a6b4e]' : 'text-[#4a4030]'}`}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-12 sm:w-20 mx-2 transition-colors ${i < step ? 'bg-[#c9933a]' : 'bg-[#2e2a1e]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div ref={contentRef} className="lg:col-span-2">

            {/* STEP 0 — Delivery */}
            {step === 0 && (
              <div className="card-dark p-6 space-y-4">
                <h2 className="font-display text-xl font-bold text-[#f8f0e3]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Delivery Address
                </h2>

                {/* Saved addresses */}
                {isAuthenticated && user.addresses?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-[#7a6b4e] uppercase tracking-wider">Saved Addresses</p>
                    {user.addresses.map(addr => (
                      <div
                        key={addr.id}
                        onClick={() => setAddress({ ...address, line: addr.line, city: addr.city, pin: addr.pin })}
                        className="flex items-center gap-3 p-3 rounded-xl border border-[#2e2a1e] cursor-pointer hover:border-[#c9933a]/30 transition-colors glass"
                      >
                        <MapPin size={15} className="text-[#c9933a] flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-[#c9933a]">{addr.label}</p>
                          <p className="text-xs text-[#7a6b4e]">{addr.line}, {addr.city} — {addr.pin}</p>
                        </div>
                        {addr.isDefault && <span className="badge badge-gold text-[0.6rem]">Default</span>}
                      </div>
                    ))}
                    <p className="text-xs text-[#4a4030] text-center">— or enter a new address —</p>
                  </div>
                )}

                {/* Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#7a6b4e] uppercase tracking-wider block mb-1.5">Full Name</label>
                    <input
                      className="input-dark"
                      value={address.name}
                      onChange={e => setAddress(a => ({ ...a, name: e.target.value }))}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#7a6b4e] uppercase tracking-wider block mb-1.5">Phone</label>
                    <input
                      className="input-dark"
                      value={address.phone}
                      onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-[#7a6b4e] uppercase tracking-wider block mb-1.5">Address Line</label>
                    <input
                      className="input-dark"
                      value={address.line}
                      onChange={e => setAddress(a => ({ ...a, line: e.target.value }))}
                      placeholder="House/Flat no., Street, Area"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#7a6b4e] uppercase tracking-wider block mb-1.5">Landmark (Optional)</label>
                    <input
                      className="input-dark"
                      value={address.landmark}
                      onChange={e => setAddress(a => ({ ...a, landmark: e.target.value }))}
                      placeholder="Near..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#7a6b4e] uppercase tracking-wider block mb-1.5">City</label>
                    <input
                      className="input-dark"
                      value={address.city}
                      onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#7a6b4e] uppercase tracking-wider block mb-1.5">PIN Code</label>
                    <input
                      className="input-dark"
                      value={address.pin}
                      onChange={e => setAddress(a => ({ ...a, pin: e.target.value }))}
                      placeholder="400 001"
                      maxLength={6}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(1)}
                  disabled={!address.name || !address.line || !address.pin}
                  className="btn-primary w-full text-sm py-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* STEP 1 — Payment */}
            {step === 1 && (
              <div className="card-dark p-6 space-y-4">
                <h2 className="font-display text-xl font-bold text-[#f8f0e3]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Payment Method
                </h2>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map(method => {
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? 'border-[#c9933a] bg-[rgba(201,147,58,0.06)]'
                            : 'border-[#2e2a1e] hover:border-[#c9933a]/30'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === method.id ? 'glass-gold' : 'glass'}`}>
                          <Icon size={18} className={paymentMethod === method.id ? 'text-[#c9933a]' : 'text-[#7a6b4e]'} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#f8f0e3]">{method.label}</p>
                          <p className="text-xs text-[#7a6b4e]">{method.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === method.id ? 'border-[#c9933a]' : 'border-[#2e2a1e]'}`}>
                          {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-[#c9933a]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {paymentMethod === 'upi' && (
                  <div className="mt-2">
                    <label className="text-xs text-[#7a6b4e] uppercase tracking-wider block mb-1.5">UPI ID</label>
                    <input className="input-dark" placeholder="yourname@upi" />
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-3 mt-2">
                    <input className="input-dark" placeholder="Card Number" maxLength={19} />
                    <div className="grid grid-cols-2 gap-3">
                      <input className="input-dark" placeholder="MM / YY" />
                      <input className="input-dark" placeholder="CVV" maxLength={4} />
                    </div>
                    <input className="input-dark" placeholder="Name on Card" />
                  </div>
                )}

                <div className="flex gap-3 mt-2">
                  <button onClick={() => setStep(0)} className="btn-ghost px-6">Back</button>
                  <button onClick={() => setStep(2)} className="btn-primary flex-1 text-sm py-4">
                    Review Order <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — Review */}
            {step === 2 && (
              <div className="card-dark p-6 space-y-5">
                <h2 className="font-display text-xl font-bold text-[#f8f0e3]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Review Order
                </h2>

                {/* Address summary */}
                <div className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-widest text-[#c9933a]">Delivery To</p>
                    <button onClick={() => setStep(0)} className="text-xs text-[#7a6b4e] hover:text-[#c9933a] transition-colors">Edit</button>
                  </div>
                  <p className="text-sm font-semibold text-[#f8f0e3]">{address.name}</p>
                  <p className="text-xs text-[#7a6b4e]">{address.line}, {address.city} {address.pin}</p>
                  <p className="text-xs text-[#7a6b4e]">{address.phone}</p>
                </div>

                {/* Payment summary */}
                <div className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-widest text-[#c9933a]">Payment</p>
                    <button onClick={() => setStep(1)} className="text-xs text-[#7a6b4e] hover:text-[#c9933a] transition-colors">Edit</button>
                  </div>
                  <p className="text-sm text-[#f8f0e3]">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</p>
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#7a6b4e] mb-3">Order Items</p>
                  <div className="space-y-2">
                    {items.map(item => (
                      <div key={item.cartId} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-[#7a6b4e] text-xs">{item.quantity}×</span>
                          <span className="text-[#f8f0e3]/80">{item.name}</span>
                        </div>
                        <span className="text-[#c9933a] font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-ghost px-6">Back</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="btn-primary flex-1 text-sm py-4 disabled:opacity-70"
                  >
                    {placing ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#0a0804] border-t-transparent rounded-full animate-spin" />
                        Placing Order...
                      </span>
                    ) : (
                      <>Place Order · ₹{total.toLocaleString()}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="card-dark p-5 sticky top-24">
              <h3 className="font-display font-bold text-lg text-[#f8f0e3] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Summary
              </h3>
              <div className="space-y-2.5 text-sm mb-4">
                {items.map(i => (
                  <div key={i.cartId} className="flex justify-between text-[#7a6b4e]">
                    <span className="truncate flex-1 mr-2">{i.name} ×{i.quantity}</span>
                    <span>₹{(i.price * i.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#2e2a1e] pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-[#7a6b4e]">
                  <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span><span>−₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#7a6b4e]">
                  <span>Delivery</span>
                  <span className={deliveryCharge === 0 ? 'text-green-400' : ''}>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between text-[#7a6b4e]">
                  <span>GST</span><span>₹{taxAmount}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-[#2e2a1e] text-[#f8f0e3]">
                  <span>Total</span><span className="text-[#c9933a]">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
