import { useState, useEffect, useRef } from 'react';
import { deliveryService } from '../api/services';
import gsap from 'gsap';
import { 
  Bike, Navigation, Phone, CheckCircle, MapPin, 
  Clock, Package, RefreshCw, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DeliveryDashboard() {
  const [activeAssignments, setActiveAssignments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const containerRef = useRef(null);

  const fetchDeliveryData = async () => {
    try {
      setLoading(true);
      const [activeRes, histRes] = await Promise.all([
        deliveryService.getActiveAssignments().catch(() => ({ data: [] })),
        deliveryService.getDeliveryHistory(0, 10).catch(() => ({ data: { content: [] } })),
      ]);

      if (activeRes?.data) setActiveAssignments(activeRes.data);
      if (histRes?.data?.content) setHistory(histRes.data.content);
    } catch (err) {
      toast.error('Failed to load courier assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
    const interval = setInterval(fetchDeliveryData, 15000);
    return () => clearInterval(interval);
  }, []);

  // GSAP animation
  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.delivery-card', {
          y: 25,
          opacity: 0,
          stagger: 0.1,
          duration: 0.6,
          ease: 'power3.out',
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, activeAssignments.length]);

  const handleUpdateStatus = async (assignmentId, newStatus) => {
    setActionLoading(true);
    try {
      await deliveryService.updateDeliveryStatus(assignmentId, {
        status: newStatus,
        notes: `Status updated to ${newStatus} by delivery courier`,
      });
      toast.success(`Delivery status updated to ${newStatus}`);
      fetchDeliveryData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0804] text-[#f8f0e3] pt-24 pb-16 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2a2416] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30 flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5" /> Courier Logistics Terminal
            </span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#f8f0e3] tracking-wide">
            Delivery Partner Dashboard
          </h1>
          <p className="text-sm text-[#a8997c]">
            Real-time route navigation, customer addresses, pickup verification, and drop-off confirmation.
          </p>
        </div>

        <button
          onClick={fetchDeliveryData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a140a] border border-[#d4af37]/30 text-xs font-semibold text-[#d4af37] hover:bg-[#d4af37]/10 transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Active Assignments */}
        <div>
          <h2 className="text-xl font-serif font-bold text-[#f8f0e3] mb-4 flex items-center gap-2">
            <span>Active Deliveries</span>
            <span className="text-xs bg-[#2a2416] text-[#d4af37] px-2 py-0.5 rounded-full font-mono">
              {activeAssignments.length}
            </span>
          </h2>

          {activeAssignments.length === 0 ? (
            <div className="bg-[#141008] border border-[#2a2416] rounded-2xl p-12 text-center text-[#a8997c]">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-serif text-[#f8f0e3]">No active delivery dispatches</p>
              <p className="text-xs mt-1">You are ready for incoming dispatches from the restaurant manager.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="delivery-card bg-gradient-to-b from-[#18130a] to-[#120e07] border border-[#d4af37]/40 rounded-2xl p-6 shadow-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-[#2a2416] pb-3 mb-4">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-[#a8997c]">Order Number</span>
                        <h4 className="font-mono text-xl font-bold text-[#d4af37]">
                          #{assignment.orderNumber}
                        </h4>
                      </div>
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
                        {assignment.status}
                      </span>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3 bg-[#0a0804] border border-[#2a2416] rounded-xl p-3.5">
                        <MapPin className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs uppercase tracking-wider text-[#a8997c]">Delivery Destination</p>
                          <p className="text-sm font-medium text-[#f8f0e3] mt-0.5">
                            {assignment.deliveryAddress?.streetLine}
                          </p>
                          <p className="text-xs text-[#a8997c]">
                            {assignment.deliveryAddress?.city}, {assignment.deliveryAddress?.postalCode}
                          </p>
                          {assignment.deliveryAddress?.landmark && (
                            <p className="text-xs text-amber-300 mt-1">
                              Landmark: {assignment.deliveryAddress.landmark}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-[#0a0804] border border-[#2a2416] rounded-xl p-3.5">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#d4af37]" />
                          <span className="text-xs font-mono text-[#f8f0e3]">
                            {assignment.deliveryAddress?.contactPhone || 'No phone recorded'}
                          </span>
                        </div>
                        <a
                          href={`tel:${assignment.deliveryAddress?.contactPhone}`}
                          className="px-3 py-1 rounded-lg bg-[#2a2416] text-[#d4af37] text-xs font-semibold hover:bg-[#d4af37] hover:text-black transition-all"
                        >
                          Call Customer
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Progressive Status Update Buttons */}
                  <div className="pt-4 border-t border-[#2a2416] space-y-2">
                    {assignment.status === 'ASSIGNED' && (
                      <button
                        onClick={() => handleUpdateStatus(assignment.id, 'PICKED_UP')}
                        disabled={actionLoading}
                        className="w-full py-3 rounded-xl bg-[#d4af37] text-black text-xs font-bold hover:bg-[#e6c35c] transition-all flex items-center justify-center gap-2"
                      >
                        <Package className="w-4 h-4" /> Confirm Food Pickup
                      </button>
                    )}

                    {assignment.status === 'PICKED_UP' && (
                      <button
                        onClick={() => handleUpdateStatus(assignment.id, 'OUT_FOR_DELIVERY')}
                        disabled={actionLoading}
                        className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-4 h-4" /> Start Delivery Route
                      </button>
                    )}

                    {assignment.status === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => handleUpdateStatus(assignment.id, 'DELIVERED')}
                        disabled={actionLoading}
                        className="w-full py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Mark Order Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery History */}
        <div className="bg-[#141008] border border-[#2a2416] rounded-2xl p-6">
          <h3 className="text-lg font-serif font-bold text-[#f8f0e3] mb-4">Completed Deliveries</h3>
          {history.length === 0 ? (
            <p className="text-xs text-[#a8997c] py-4">No completed deliveries logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#2a2416] text-xs uppercase tracking-wider text-[#a8997c]">
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Destination</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2416]/50">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-[#1f190e]/50">
                      <td className="py-3 font-mono font-bold text-[#d4af37]">#{h.orderNumber}</td>
                      <td className="py-3 text-xs text-[#f8f0e3]">{h.deliveryAddress?.streetLine}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-900/30 text-emerald-400 border border-emerald-500/30">
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

