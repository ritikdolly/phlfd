import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { Plus, Minus, Trash2, ShoppingBag, Tag, X, ArrowRight, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function CartPage() {
  const { items, subtotal, deliveryCharge, taxAmount, total, coupon, couponDiscount,
    couponError, removeItem, updateQty, applyCoupon, removeCoupon } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const pageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(pageRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, []);

  const handleApplyCoupon = () => {
    if (couponInput.trim()) applyCoupon(couponInput.trim());
  };

  return (
    <div ref={pageRef} className="min-h-screen pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="font-display font-bold text-3xl md:text-4xl text-[#f8f0e3]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Your Cart
          </h1>
          <p className="text-[#7a6b4e] text-sm mt-1">{items.length} items</p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <ShoppingBag size={64} className="text-[#2e2a1e] mb-6" />
            <h2
              className="font-display text-3xl text-[#7a6b4e] mb-3"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Your cart is empty
            </h2>
            <p className="text-[#4a4030] text-sm mb-8">Explore our menu and add some dishes</p>
            <Link to="/menu" className="btn-primary">
              Browse Menu <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.cartId} className="flex gap-5 p-5 card-dark">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                            <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                          </div>
                        </div>
                        <h3 className="font-medium text-[#f8f0e3] text-sm leading-tight">{item.name}</h3>
                        {item.selectedOptions && (
                          <p className="text-xs text-[#7a6b4e] mt-0.5">{item.selectedOptions}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.cartId)}
                        className="text-[#4a4030] hover:text-red-400 transition-colors p-1 flex-shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-[#c9933a]">₹{(item.price * item.quantity).toLocaleString()}</span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQty(item.cartId, item.quantity - 1)} className="qty-btn">
                          <Minus size={12} />
                        </button>
                        <span className="font-semibold text-sm w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.cartId, item.quantity + 1)} className="qty-btn">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[#4a4030] mt-1">₹{item.price} per item</p>
                  </div>
                </div>
              ))}

              {/* Coupon */}
              <div className="p-5 card-dark">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={15} className="text-[#c9933a]" />
                  <h3 className="font-medium text-sm text-[#f8f0e3]">Apply Coupon</h3>
                </div>
                {coupon ? (
                  <div className="flex items-center justify-between glass-gold rounded-xl p-3">
                    <div>
                      <p className="font-mono font-bold text-[#c9933a]">{coupon.code}</p>
                      <p className="text-xs text-[#7a6b4e]">{coupon.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-green-400">−₹{couponDiscount}</span>
                      <button onClick={removeCoupon} className="text-[#7a6b4e] hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      className="input-dark flex-1 text-sm uppercase font-mono"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="btn-primary text-xs py-2.5 px-5"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p className="text-red-400 text-xs mt-2">{couponError}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  {['SAVORIA20', 'FLAT200', 'WELCOME50'].map(code => (
                    <button
                      key={code}
                      onClick={() => { setCouponInput(code); }}
                      className="font-mono text-xs px-2.5 py-1 glass-gold rounded-lg text-[#c9933a] hover:opacity-80 transition-opacity"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="card-dark p-6 sticky top-24">
                <h2
                  className="font-display font-bold text-xl text-[#f8f0e3] mb-5"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Order Summary
                </h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm text-[#7a6b4e]">
                    <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-400">
                      <span>Coupon Discount</span>
                      <span>−₹{couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-[#7a6b4e]">
                    <span>Delivery Charge</span>
                    <span className={deliveryCharge === 0 ? 'text-green-400' : ''}>
                      {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-[#7a6b4e]">
                    <span>GST (5%)</span>
                    <span>₹{taxAmount}</span>
                  </div>
                  <div className="border-t border-[#2e2a1e] pt-3 flex justify-between font-bold text-lg">
                    <span className="text-[#f8f0e3]">Total</span>
                    <span className="text-[#c9933a]">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {deliveryCharge > 0 && (
                  <div className="text-xs text-center text-[#7a6b4e] bg-[#1a1710] rounded-xl p-2.5 mb-4">
                    Add ₹{(999 - subtotal)} more for <span className="text-green-400">FREE delivery</span>
                  </div>
                )}

                <Link
                  to="/checkout"
                  className="btn-primary w-full text-sm py-4"
                >
                  Proceed to Checkout <ChevronRight size={16} />
                </Link>

                <Link to="/menu" className="btn-ghost w-full text-center mt-2 text-sm">
                  + Add More Items
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
