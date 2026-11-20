import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  CheckCircle, Clock, MapPin, RefreshCw, ChefHat,
  Bike, Package, ClipboardList, Sparkles, Flame, Check,
  Wifi, WifiOff, AlertCircle
} from 'lucide-react';
import { orderService } from '../api/services';
import { useRealTime } from '../contexts/RealTimeContext';

const ORDER_STEPS = [
  { key: 'PENDING',          label: 'Order Received',    desc: 'Sent to master kitchen',                  Icon: ClipboardList },
  { key: 'CONFIRMED',        label: 'Confirmed',         desc: 'Accepted by head chef',                   Icon: CheckCircle   },
  { key: 'PREPARING',        label: 'Cooking Feast',     desc: 'Flavors simmering with artisanal spices', Icon: Flame         },
  { key: 'READY_FOR_PICKUP', label: 'Ready for Dispatch','desc': 'Sealed with tamper-proof crest',         Icon: Package       },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery',  desc: 'Courier on designated route',             Icon: Bike          },
  { key: 'DELIVERED',        label: 'Delivered',         desc: 'Delivered to recipient',                  Icon: Sparkles      },
];

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const orderParam = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusKey, setStatusKey] = useState('PENDING');
  const [lastMessage, setLastMessage] = useState('');
  const [wsMessage, setWsMessage] = useState('');

  const { subscribe, connected } = useRealTime();
  const timelineRef = useRef(null);
  const headerRef = useRef(null);
  const pollRef = useRef(null);

  // ─── Fetch order data ───────────────────────────────────────────────────────
  const fetchLiveOrder = useCallback(async () => {
    if (!orderParam) { setLoading(false); return; }
    try {
      let res = null;
      // Try by ID first, then by order number
      res = await orderService.getOrderById(orderParam).catch(() =>
        orderService.trackOrder(orderParam).catch(() => null)
      );

      if (res?.data) {
        setOrder(res.data);
        setStatusKey(res.data.orderStatus || 'PENDING');
      }

      // Load status history
      if (res?.data?.id) {
        orderService.getOrderHistory(res.data.id)
          .then((h) => setHistory(h.data || []))
          .catch(() => {});
      }
    } catch (err) {
      console.warn('Track order fetch:', err.message);
    } finally {
      setLoading(false);
    }
  }, [orderParam]);

  // Initial load + fallback polling every 15 s (WebSocket is primary)
  useEffect(() => {
    fetchLiveOrder();
    pollRef.current = setInterval(fetchLiveOrder, 15000);
    return () => clearInterval(pollRef.current);
  }, [fetchLiveOrder]);

  // ─── WebSocket subscription ─────────────────────────────────────────────────
  useEffect(() => {
    if (!order?.id) return;

    // Subscribe to order-specific topic for real-time updates
    const unsub = subscribe(`/topic/order/${order.id}`, (event) => {
      setStatusKey(event.currentStatus || statusKey);
      if (event.message) setWsMessage(event.message);

      // Update order object with new status
      setOrder((prev) => prev ? { ...prev, orderStatus: event.currentStatus } : prev);

      // Reload history
      orderService.getOrderHistory(order.id)
        .then((h) => setHistory(h.data || []))
        .catch(() => {});
    });

    return unsub;
  }, [order?.id, subscribe]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── GSAP animations ────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      if (headerRef.current)
        gsap.fromTo(headerRef.current, { y: -20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' });
      gsap.fromTo('.track-step', { x: -20, autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: 0.1, duration: 0.5, ease: 'power2.out', delay: 0.2 });
    });
    return () => ctx.revert();
  }, [loading]);

  const currentStepIdx = Math.max(0, ORDER_STEPS.findIndex((s) => s.key === statusKey));
  const isCancelled = statusKey === 'CANCELLED' || statusKey === 'REJECTED';
  const orderNum = order?.orderNumber || orderParam || '—';

  // ─── UI ─────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0804' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#c9933a' }} />
      </div>
    );
  }

  if (!orderParam) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center px-4" style={{ background: '#0a0804' }}>
        <AlertCircle size={48} className="mb-4" style={{ color: '#7a6b4e' }} />
        <h2 className="text-xl font-bold mb-2" style={{ color: '#f8f0e3', fontFamily: 'Playfair Display, serif' }}>No Order Specified</h2>
        <p className="text-sm mb-6" style={{ color: '#7a6b4e' }}>Please open this page from your order confirmation or order history.</p>
        <Link to="/profile" className="text-sm font-semibold" style={{ color: '#c9933a' }}>View My Orders</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12" style={{ background: '#0a0804', color: '#f8f0e3' }}>
      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <div ref={headerRef} className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              background: isCancelled ? 'rgba(239,68,68,0.1)' : 'rgba(212,175,55,0.1)',
              border: `2px solid ${isCancelled ? 'rgba(239,68,68,0.4)' : 'rgba(212,175,55,0.4)'}`,
            }}
          >
            {isCancelled
              ? <AlertCircle size={36} style={{ color: '#ef4444' }} />
              : <CheckCircle size={36} style={{ color: '#d4af37' }} />
            }
          </div>
          <h1 className="font-bold text-3xl mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {isCancelled ? 'Order Cancelled' : 'Live Kitchen Tracking'}
          </h1>
          <p className="text-sm mb-3" style={{ color: '#a08c5b' }}>
            {isCancelled ? 'This order has been cancelled.' : 'Real-time operational status updates'}
          </p>
          <div
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-2"
            style={{ background: '#16120a', border: '1px solid rgba(201,147,58,0.3)' }}
          >
            <span className="text-xs" style={{ color: '#a08c5b' }}>Order</span>
            <span className="font-mono font-bold" style={{ color: '#d4af37' }}>#{orderNum}</span>
          </div>
        </div>

        {/* WebSocket status indicator */}
        <div className="flex justify-center mb-5">
          <div
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
            style={{
              background: connected ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)',
              border: `1px solid ${connected ? 'rgba(34,197,94,0.3)' : 'rgba(107,114,128,0.2)'}`,
              color: connected ? '#86efac' : '#9ca3af',
            }}
          >
            {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {connected ? 'Live updates active' : 'Polling mode'}
          </div>
        </div>

        {/* Live message banner */}
        {wsMessage && (
          <div
            className="rounded-xl px-4 py-3 mb-5 text-sm text-center"
            style={{ background: 'rgba(201,147,58,0.1)', border: '1px solid rgba(201,147,58,0.3)', color: '#d4af37' }}
          >
            {wsMessage}
          </div>
        )}

        {/* ETA card */}
        {!isCancelled && (
          <div
            className="rounded-2xl p-5 mb-6"
            style={{ background: '#16120a', border: '1px solid rgba(201,147,58,0.2)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.1)' }}>
                  <Clock size={20} style={{ color: '#d4af37' }} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#a08c5b' }}>Estimated Arrival</p>
                  <p className="text-xl font-bold font-mono" style={{ color: '#f8f0e3' }}>25–35 mins</p>
                </div>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                style={{ background: 'rgba(212,175,55,0.2)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' }}
              >
                {statusKey.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        )}

        {/* Timeline */}
        {!isCancelled && (
          <div ref={timelineRef} className="rounded-2xl p-6 mb-6" style={{ background: '#16120a', border: '1px solid rgba(201,147,58,0.2)' }}>
            <h3 className="font-bold text-lg mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Preparation Timeline</h3>
            <div className="space-y-6 relative pl-6" style={{ borderLeft: '2px solid rgba(201,147,58,0.15)' }}>
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={step.key} className="track-step relative">
                    <div
                      className="absolute -left-[31px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                      style={{
                        borderColor: isPassed ? '#22c55e' : isCurrent ? '#d4af37' : 'rgba(42,36,22,1)',
                        background: isPassed ? '#22c55e' : isCurrent ? '#d4af37' : '#0a0804',
                        color: isPassed || isCurrent ? '#0a0804' : '#7a6b4e',
                        animation: isCurrent ? 'pulse 2s infinite' : 'none',
                      }}
                    >
                      {isPassed ? <Check size={12} strokeWidth={3} /> : idx + 1}
                    </div>
                    <div>
                      <h4
                        className="text-sm font-semibold flex items-center gap-2"
                        style={{ color: isCurrent ? '#d4af37' : isPassed ? '#f8f0e3' : '#7a6b4e' }}
                      >
                        <step.Icon size={14} style={{ color: isCurrent ? '#d4af37' : isPassed ? '#86efac' : '#7a6b4e' }} />
                        {step.label}
                      </h4>
                      <p className="text-xs mt-0.5" style={{ color: '#7a6b4e' }}>{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Status history from DB */}
        {history.length > 0 && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: '#16120a', border: '1px solid rgba(201,147,58,0.2)' }}>
            <h3 className="font-bold text-base mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Update History</h3>
            <div className="space-y-3">
              {history.map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: '#c9933a' }} />
                  <div>
                    <p style={{ color: '#f8f0e3' }}>{h.customerMessage || `Status: ${h.newStatus}`}</p>
                    {h.timestamp && (
                      <p className="text-xs mt-0.5" style={{ color: '#7a6b4e' }}>
                        {new Date(h.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        {h.updatedByName ? ` · ${h.updatedByName}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order summary */}
        {order?.items?.length > 0 && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: '#16120a', border: '1px solid rgba(201,147,58,0.2)' }}>
            <h3 className="font-bold text-base mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Ordered Items</h3>
            <div className="space-y-3 mb-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#f8f0e3' }}>
                      {item.quantity}× {item.itemName || item.foodItemName || item.name}
                    </span>
                    {item.servingInfo && (
                      <span className="text-xs font-mono" style={{ color: '#a08c5b' }}>
                        ({item.servingInfo})
                      </span>
                    )}
                  </div>
                  <span className="font-mono" style={{ color: '#d4af37' }}>
                    {fmt((item.itemPrice || item.unitPrice || 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-sm" style={{ borderColor: 'rgba(201,147,58,0.15)' }}>
              <span>Total</span>
              <span className="font-mono" style={{ color: '#d4af37' }}>{fmt(order.totalAmount)}</span>
            </div>
          </div>
        )}

        {/* Delivery person info */}
        {order?.deliveryAssignment?.deliveryManName && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: '#16120a', border: '1px solid rgba(201,147,58,0.2)' }}>
            <div className="flex items-center gap-3">
              <Bike size={20} style={{ color: '#c9933a' }} />
              <div>
                <p className="text-xs uppercase tracking-wide mb-0.5" style={{ color: '#7a6b4e' }}>Delivery Partner</p>
                <p className="font-semibold text-sm" style={{ color: '#f8f0e3' }}>{order.deliveryAssignment.deliveryManName}</p>
                {order.deliveryAssignment.deliveryManPhone && (
                  <p className="text-xs" style={{ color: '#a08c5b' }}>{order.deliveryAssignment.deliveryManPhone}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delivery address */}
        {order?.deliveryAddressSnapshot && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: '#16120a', border: '1px solid rgba(201,147,58,0.2)' }}>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0" style={{ color: '#c9933a' }} />
              <div>
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#7a6b4e' }}>Delivering To</p>
                <p className="text-sm leading-relaxed" style={{ color: '#f8f0e3' }}>{order.deliveryAddressSnapshot}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={fetchLiveOrder}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ border: '1px solid rgba(201,147,58,0.3)', color: '#c9933a' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <Link
            to="/menu"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #c9933a, #d4af37)', color: '#0a0804' }}
          >
            Order More
          </Link>
        </div>
      </div>
    </div>
  );
}
