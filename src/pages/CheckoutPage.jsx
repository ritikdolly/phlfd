import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { CreditCard, Smartphone, Wallet, MapPin, ChevronRight, ShoppingBag, Check, ShieldCheck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../api/services';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'RAZORPAY', label: 'UPI / Online Gateway', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm, Cards' },
  { id: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', icon: ShoppingBag, desc: 'Pay when food arrives' },
];

const STEPS = ['Delivery', 'Payment', 'Review'];

export default function CheckoutPage() {
  const { items, subtotal, deliveryCharge, taxAmount, total, coupon, couponDiscount, clearCart } = useCart();
  const { user, isAuthenticated, addAddress } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [placing, setPlacing] = useState(false);
  const [customerNotes, setCustomerNotes] = useState('');
  
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    line: user?.addresses?.[0]?.streetLine || user?.addresses?.[0]?.line || '',
    city: user?.addresses?.[0]?.city || 'Mumbai',
    pin: user?.addresses?.[0]?.postalCode || user?.addresses?.[0]?.pin || '400053',
    landmark: user?.addresses?.[0]?.landmark || '',
  });

  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, [step]);

  const handlePlaceOrder = async () => {
    if (placing) return;

    if (!isAuthenticated) {
      toast.error('Please sign in or register to place your order. Your cart is saved!');
      navigate('/login?returnTo=/checkout');
      return;
    }

    setPlacing(true);

    try {
      // Find existing address ID if available or provide new address object
      const matchedAddress = user?.addresses?.find(
        (a) => (a.streetLine || a.line) === address.line
      );

      const checkoutPayload = {
        addressId: matchedAddress?.id || null,
        newAddress: !matchedAddress?.id
          ? {
              label: 'Home',
              streetLine: address.line,
              city: address.city,
              state: 'Maharashtra',
              postalCode: address.pin,
              landmark: address.landmark || '',
              contactPhone: address.phone,
              isDefault: true,
            }
          : null,
        paymentMethod: paymentMethod === 'RAZORPAY' ? 'RAZORPAY' : 'CASH_ON_DELIVERY',
        deliveryInstructions: customerNotes || 'Please handle with care',
        couponCode: coupon?.code || null,
      };

      const res = await orderService.checkout(checkoutPayload);
      if (res?.data) {
        const placedOrder = res.data;
        clearCart();
        toast.success(`Order #${placedOrder.orderNumber} placed successfully!`);
        navigate(`/order-confirmation/${placedOrder.id || placedOrder.orderNumber}`, { replace: true });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to place order';
      toast.error(errorMsg);
    } finally {
      setPlacing(false);
    }
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
    <div className="min-h-screen pt-24 pb-12 bg-[#0a0804] text-[#f8f0e3]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header + Steps */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
              End-to-End Encrypted Checkout
            </span>
          </div>
          <h1
            className="font-display font-bold text-3xl text-[#f8f0e3] mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Checkout & Confirmation
          </h1>

          {/* Progress Steps */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                      i < step
                        ? 'border-[#d4af37] bg-[#d4af37] text-black'
                        : i === step
                        ? 'border-[#d4af37] text-[#d4af37] bg-[#1a140a]'
                        : 'border-[#2e2a1e] text-[#4a4030]'
                    }`}
                  >
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${
                      i === step ? 'text-[#d4af37]' : i < step ? 'text-[#a8997c]' : 'text-[#4a4030]'
                    }`}
                  >
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px w-12 sm:w-20 mx-2 transition-colors ${
                      i < step ? 'bg-[#d4af37]' : 'bg-[#2e2a1e]'
                    }`}
                  />
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
              <div className="bg-[#141008] border border-[#2e2a1e] rounded-2xl p-6 space-y-4 shadow-xl">
                <h2
                  className="font-display text-xl font-bold text-[#f8f0e3]"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Delivery Destination
                </h2>

                {/* Saved addresses from backend profile */}
                {isAuthenticated && user?.addresses?.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-[#a8997c] uppercase tracking-wider">Saved Addresses</p>
                    {user.addresses.map((addr) => (
                      <div
                        key={addr.id || addr.streetLine}
                        onClick={() =>
                          setAddress({
                            ...address,
                            line: addr.streetLine || addr.line,
                            city: addr.city,
                            pin: addr.postalCode || addr.pin,
                            landmark: addr.landmark || '',
                          })
                        }
                        className="flex items-center gap-3 p-3 rounded-xl border border-[#2e2a1e] cursor-pointer hover:border-[#d4af37]/40 transition-colors bg-[#0a0804]"
                      >
                        <MapPin size={16} className="text-[#d4af37] flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-[#d4af37]">{addr.label || 'Home'}</p>
                          <p className="text-xs text-[#a8997c]">
                            {addr.streetLine || addr.line}, {addr.city} — {addr.postalCode || addr.pin}
                          </p>
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-[#7a6b4e] text-center pt-2">— or customize destination below —</p>
                  </div>
                )}

                {/* Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#a8997c] uppercase tracking-wider block mb-1.5">Full Name</label>
                    <input
                      className="input-dark w-full bg-[#0a0804] border border-[#2e2a1e] rounded-xl px-4 py-3 text-sm focus:border-[#d4af37] outline-none"
                      value={address.name}
                      onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value }))}
                      placeholder="Your recipient name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#a8997c] uppercase tracking-wider block mb-1.5">Phone Number</label>
                    <input
                      className="input-dark w-full bg-[#0a0804] border border-[#2e2a1e] rounded-xl px-4 py-3 text-sm focus:border-[#d4af37] outline-none"
                      value={address.phone}
                      onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-[#a8997c] uppercase tracking-wider block mb-1.5">Address Line</label>
                    <input
                      className="input-dark w-full bg-[#0a0804] border border-[#2e2a1e] rounded-xl px-4 py-3 text-sm focus:border-[#d4af37] outline-none"
                      value={address.line}
                      onChange={(e) => setAddress((a) => ({ ...a, line: e.target.value }))}
                      placeholder="Apartment, building, and street name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#a8997c] uppercase tracking-wider block mb-1.5">Landmark</label>
                    <input
                      className="input-dark w-full bg-[#0a0804] border border-[#2e2a1e] rounded-xl px-4 py-3 text-sm focus:border-[#d4af37] outline-none"
                      value={address.landmark}
                      onChange={(e) => setAddress((a) => ({ ...a, landmark: e.target.value }))}
                      placeholder="Near landmark..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#a8997c] uppercase tracking-wider block mb-1.5">City</label>
                    <input
                      className="input-dark w-full bg-[#0a0804] border border-[#2e2a1e] rounded-xl px-4 py-3 text-sm focus:border-[#d4af37] outline-none"
                      value={address.city}
                      onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-[#a8997c] uppercase tracking-wider block mb-1.5">Postal PIN Code</label>
                    <input
                      className="input-dark w-full bg-[#0a0804] border border-[#2e2a1e] rounded-xl px-4 py-3 text-sm focus:border-[#d4af37] outline-none"
                      value={address.pin}
                      onChange={(e) => setAddress((a) => ({ ...a, pin: e.target.value }))}
                      placeholder="400053"
                      maxLength={6}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(1)}
                  disabled={!address.name || !address.line || !address.pin}
                  className="btn-primary w-full text-sm py-4 mt-4 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-[#e6c35c] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Proceed to Payment <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* STEP 1 — Payment */}
            {step === 1 && (
              <div className="bg-[#141008] border border-[#2e2a1e] rounded-2xl p-6 space-y-4 shadow-xl">
                <h2
                  className="font-display text-xl font-bold text-[#f8f0e3]"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Choose Payment Gateway
                </h2>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? 'border-[#d4af37] bg-[#d4af37]/10'
                            : 'border-[#2e2a1e] hover:border-[#d4af37]/30 bg-[#0a0804]'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            paymentMethod === method.id ? 'bg-[#d4af37] text-black' : 'bg-[#1a140a] text-[#a8997c]'
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#f8f0e3]">{method.label}</p>
                          <p className="text-xs text-[#a8997c]">{method.desc}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === method.id ? 'border-[#d4af37]' : 'border-[#2e2a1e]'
                          }`}
                        >
                          {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="text-xs text-[#a8997c] uppercase tracking-wider block mb-1.5">
                    Kitchen / Chef Instructions (Optional)
                  </label>
                  <input
                    className="input-dark w-full bg-[#0a0804] border border-[#2e2a1e] rounded-xl px-4 py-3 text-sm focus:border-[#d4af37] outline-none"
                    placeholder="e.g. Ring doorbell, leave at front desk, extra napkins..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setStep(0)}
                    className="px-6 py-3 rounded-xl border border-[#2e2a1e] text-sm text-[#a8997c] hover:bg-[#1a140a] transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-[#e6c35c] transition-all text-sm flex items-center justify-center gap-2"
                  >
                    Review Order <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — Review */}
            {step === 2 && (
              <div className="bg-[#141008] border border-[#2e2a1e] rounded-2xl p-6 space-y-5 shadow-xl">
                <h2
                  className="font-display text-xl font-bold text-[#f8f0e3]"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Review & Place Order
                </h2>

                <div className="bg-[#0a0804] border border-[#2e2a1e] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-widest text-[#d4af37]">Delivery Destination</p>
                    <button
                      onClick={() => setStep(0)}
                      className="text-xs text-[#a8997c] hover:text-[#d4af37] transition-colors"
                    >
                      Change
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-[#f8f0e3]">{address.name}</p>
                  <p className="text-xs text-[#a8997c]">
                    {address.line}, {address.city} — {address.pin}
                  </p>
                  <p className="text-xs text-[#a8997c]">{address.phone}</p>
                </div>

                <div className="bg-[#0a0804] border border-[#2e2a1e] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs uppercase tracking-widest text-[#d4af37]">Payment Strategy</p>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs text-[#a8997c] hover:text-[#d4af37] transition-colors"
                    >
                      Change
                    </button>
                  </div>
                  <p className="text-sm text-[#f8f0e3]">
                    {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-[#a8997c] mb-3">Dishes in Order</p>
                  <div className="space-y-2 bg-[#0a0804] border border-[#2e2a1e] rounded-xl p-4">
                    {items.map((item) => (
                      <div key={item.cartId} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-[#a8997c] text-xs">{item.quantity}×</span>
                          <span className="text-[#f8f0e3]">{item.name}</span>
                          {item.servingInfo && (
                            <span className="text-[11px] text-[#c9933a] font-mono">({item.servingInfo})</span>
                          )}
                        </div>
                        <span className="text-[#d4af37] font-mono">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 rounded-xl border border-[#2e2a1e] text-sm text-[#a8997c] hover:bg-[#1a140a] transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="flex-1 py-4 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-[#e6c35c] transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {placing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Transmitting to Master Kitchen...
                      </span>
                    ) : (
                      <>Place Order • ₹{total.toLocaleString()}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="bg-[#141008] border border-[#2e2a1e] rounded-2xl p-5 sticky top-24 shadow-xl">
              <h3
                className="font-display font-bold text-lg text-[#f8f0e3] mb-4"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Bill Summary
              </h3>
              <div className="space-y-2.5 text-sm mb-4">
                {items.map((i) => (
                  <div key={i.cartId} className="flex justify-between text-[#a8997c]">
                    <span className="truncate flex-1 mr-2">
                      {i.name} ×{i.quantity}
                    </span>
                    <span className="font-mono">₹{(i.price * i.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#2e2a1e] pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-[#a8997c]">
                  <span>Item Subtotal</span>
                  <span className="font-mono">₹{subtotal.toLocaleString()}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount</span>
                    <span className="font-mono">−₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#a8997c]">
                  <span>Delivery Surcharge</span>
                  <span className={deliveryCharge === 0 ? 'text-emerald-400 font-semibold' : 'font-mono'}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between text-[#a8997c]">
                  <span>GST (5%)</span>
                  <span className="font-mono">₹{taxAmount}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-[#2e2a1e] text-[#f8f0e3]">
                  <span>Total Payable</span>
                  <span className="text-[#d4af37] font-mono">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
