import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function CartDrawer({ open, onClose }) {
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);
  const { items, subtotal, deliveryCharge, taxAmount, total, itemCount,
    removeItem, updateQty } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!drawerRef.current) return;
    if (open) {
      gsap.set(drawerRef.current, { x: '100%' });
      gsap.to(drawerRef.current, { x: 0, duration: 0.4, ease: 'power3.out' });
      gsap.to(overlayRef.current, { autoAlpha: 1, duration: 0.3 });
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(drawerRef.current, { x: '100%', duration: 0.35, ease: 'power3.in' });
      gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.25 });
      document.body.style.overflow = '';
    }
  }, [open]);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 z-[900]"
        style={{ visibility: open ? 'visible' : 'hidden', opacity: 0 }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 h-full w-full max-w-md z-[950] flex flex-col"
        style={{
          background: '#111008',
          borderLeft: '1px solid #2e2a1e',
          transform: 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2e2a1e]">
          <div>
            <h2 className="font-display font-bold text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>
              Your Cart
            </h2>
            <p className="text-xs text-[#7a6b4e] mt-0.5">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full glass hover:bg-white/8 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag size={48} className="text-[#2e2a1e]" />
              <div>
                <p className="font-display text-xl text-[#7a6b4e]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Your cart is empty
                </p>
                <p className="text-sm text-[#4a4030] mt-1">Add some delicious dishes</p>
              </div>
              <button onClick={onClose} className="btn-primary mt-2">
                Explore Menu
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.cartId} className="flex gap-4 p-4 card-dark">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-[#f8f0e3] leading-tight">{item.name}</p>
                      {item.selectedOptions && (
                        <p className="text-xs text-[#7a6b4e] mt-0.5">{item.selectedOptions}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.cartId)}
                      className="p-1 text-[#4a4030] hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="font-semibold text-[#c9933a]">₹{(item.price * item.quantity).toLocaleString()}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.cartId, item.quantity - 1)} className="qty-btn">
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQty(item.cartId, item.quantity + 1)} className="qty-btn">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with totals */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#2e2a1e]">
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-[#7a6b4e]">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#7a6b4e]">
                <span>Delivery</span>
                <span className={deliveryCharge === 0 ? 'text-green-400' : ''}>
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-[#7a6b4e]">
                <span>GST (5%)</span>
                <span>₹{taxAmount}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-[#2e2a1e] text-[#f8f0e3]">
                <span>Total</span>
                <span className="text-[#c9933a]">₹{total.toLocaleString()}</span>
              </div>
            </div>

            {deliveryCharge > 0 && (
              <p className="text-xs text-[#7a6b4e] text-center mb-3">
                Add ₹{(999 - subtotal)} more for free delivery
              </p>
            )}

            <button onClick={handleCheckout} className="btn-primary w-full">
              Proceed to Checkout
              <ArrowRight size={16} />
            </button>

            <Link
              to="/cart"
              onClick={onClose}
              className="btn-ghost w-full text-center mt-2"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
