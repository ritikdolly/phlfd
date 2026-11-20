import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  CheckCircle, MapPin, Clock, CreditCard, Package,
  ArrowRight, ChefHat, Sparkles
} from 'lucide-react';
import { orderService } from '../api/services';

const statusLabel = {
  PENDING: 'Received',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
};

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const qOrderId = searchParams.get('orderId');
  const id = orderId || qOrderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const detailsRef = useRef(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    orderService.getOrderById(id)
      .then((res) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (loading || !heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current,
        { scale: 0.8, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.5)' });
      if (detailsRef.current) {
        gsap.fromTo(detailsRef.current.children,
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.5, ease: 'power2.out', delay: 0.4 });
      }
    });
    return () => ctx.revert();
  }, [loading]);

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0804' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#c9933a' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: '#0a0804' }}>
      <div className="max-w-2xl mx-auto">
        {/* Success hero */}
        <div ref={heroRef} className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5"
            style={{ background: 'linear-gradient(135deg, #c9933a22, #d4af3722)', border: '2px solid #c9933a' }}
          >
            <CheckCircle size={40} style={{ color: '#c9933a' }} />
          </div>
          <h1
            className="text-4xl font-bold mb-3"
            style={{ fontFamily: 'Playfair Display, serif', color: '#f8f0e3' }}
          >
            Order Placed!
          </h1>
          <p style={{ color: '#a08c5b' }}>
            Thank you for choosing Savoria. Your culinary experience is on its way.
          </p>
        </div>

        {order ? (
          <div ref={detailsRef} className="space-y-4">
            {/* Order number */}
            <div
              className="rounded-2xl p-6 text-center"
              style={{ background: '#16120a', border: '1px solid rgba(201,147,58,0.25)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7a6b4e' }}>
                Order Number
              </p>
              <p className="text-3xl font-bold tracking-widest" style={{ color: '#c9933a', fontFamily: 'Playfair Display, serif' }}>
                #{order.orderNumber}
              </p>
              <div
                className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                style={{ background: 'rgba(201,147,58,0.15)', color: '#c9933a' }}
              >
                {statusLabel[order.orderStatus] || order.orderStatus}
              </div>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Clock, label: 'Estimated Time', value: '30–45 min' },
                { icon: CreditCard, label: 'Payment', value: order.paymentMethod === 'RAZORPAY' ? 'Online Paid' : 'Cash on Delivery' },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl p-5"
                  style={{ background: '#16120a', border: '1px solid rgba(201,147,58,0.25)' }}
                >
                  <Icon size={20} className="mb-2" style={{ color: '#c9933a' }} />
                  <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#7a6b4e' }}>{label}</p>
                  <p className="font-semibold text-sm" style={{ color: '#f8f0e3' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Delivery address */}
            {order.deliveryAddressSnapshot && (
              <div
                className="rounded-2xl p-5"
                style={{ background: '#16120a', border: '1px solid rgba(201,147,58,0.25)' }}
              >
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0" style={{ color: '#c9933a' }} />
                  <div>
                    <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#7a6b4e' }}>Delivery Address</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#f8f0e3' }}>{order.deliveryAddressSnapshot}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            {order.items?.length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ background: '#16120a', border: '1px solid rgba(201,147,58,0.25)' }}>
                <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(201,147,58,0.15)' }}>
                  <div className="flex items-center gap-2">
                    <Package size={16} style={{ color: '#c9933a' }} />
                    <span className="text-sm font-semibold" style={{ color: '#f8f0e3' }}>
                      {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                    </span>
                  </div>
                </div>
                <div className="divide-y" style={{ borderColor: 'rgba(201,147,58,0.1)' }}>
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: 'rgba(201,147,58,0.15)', color: '#c9933a' }}
                        >
                          {item.quantity}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium" style={{ color: '#f8f0e3' }}>
                            {item.itemName || item.foodItemName}
                          </span>
                          {(item.servingInfo || item.selectedCustomizations) && (
                            <span className="text-xs" style={{ color: '#7a6b4e' }}>
                              {item.servingInfo} {item.selectedCustomizations ? `• ${item.selectedCustomizations}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-semibold font-mono" style={{ color: '#c9933a' }}>
                        {fmt((item.itemPrice || item.unitPrice || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Totals */}
                <div className="px-5 py-4 space-y-2 border-t" style={{ borderColor: 'rgba(201,147,58,0.15)' }}>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: '#7a6b4e' }}>Discount</span>
                      <span style={{ color: '#22c55e' }}>-{fmt(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#7a6b4e' }}>Delivery</span>
                    <span style={{ color: '#f8f0e3' }}>{order.deliveryFee > 0 ? fmt(order.deliveryFee) : 'Free'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#7a6b4e' }}>Taxes</span>
                    <span style={{ color: '#f8f0e3' }}>{fmt(order.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: 'rgba(201,147,58,0.15)', color: '#f8f0e3' }}>
                    <span>Total</span>
                    <span style={{ color: '#c9933a' }}>{fmt(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* What's next */}
            <div
              className="rounded-2xl p-5"
              style={{ background: '#16120a', border: '1px solid rgba(201,147,58,0.25)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <ChefHat size={16} style={{ color: '#c9933a' }} />
                <span className="text-sm font-semibold" style={{ color: '#f8f0e3' }}>What happens next?</span>
              </div>
              <div className="space-y-2 text-sm" style={{ color: '#a08c5b' }}>
                <p>Our kitchen team has been notified and will begin preparing your order.</p>
                <p>Track your order status in real-time from the tracking page.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Link
                to={`/track?orderId=${order.id}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #c9933a, #d4af37)', color: '#0a0804' }}
              >
                <Sparkles size={16} /> Track Order <ArrowRight size={16} />
              </Link>
              <Link
                to="/menu"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
                style={{ border: '1px solid rgba(201,147,58,0.3)', color: '#c9933a' }}
              >
                Order Again
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p style={{ color: '#7a6b4e' }}>Order details could not be loaded.</p>
            <Link to="/profile" className="text-sm mt-4 block" style={{ color: '#c9933a' }}>
              View Order History
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
