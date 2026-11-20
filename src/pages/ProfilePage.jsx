import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { 
  User, Package, MapPin, LogOut, Edit, ChevronRight, 
  Star, Clock, Check, Plus, RefreshCw, Shield,
  CheckCircle2, AlertCircle, Mail 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { orderService, customerService } from '../api/services';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'orders', label: 'Order History', icon: Package },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const { user, logout, updateProfile, addAddress } = useAuth();
  const [editForm, setEditForm] = useState(() => ({
    name: user?.name || user?.fullName || '',
    phone: user?.phone || '',
  }));

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Address modal state
  const [newAddressModal, setNewAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    streetLine: '',
    city: '',
    postalCode: '',
    landmark: '',
  });

  const navigate = useNavigate();
  const contentRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load customer order history and addresses from Spring Boot
  const loadUserData = async () => {
    setLoadingOrders(true);
    try {
      const [orderRes, addrRes] = await Promise.all([
        orderService.getMyOrders(0, 15).catch(() => ({ data: { content: [] } })),
        customerService.getAddresses().catch(() => ({ data: [] })),
      ]);

      if (orderRes?.data?.content) {
        setOrders(orderRes.data.content);
      }
      if (addrRes?.data) {
        setAddresses(addrRes.data);
      }
    } catch (err) {
      console.warn('Failed to load profile details:', err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { y: 15, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, [activeTab]);

  const handleSave = async () => {
    await updateProfile(editForm);
    setEditing(false);
    toast.success('Profile details updated');
  };

  const handleCreateAddress = async () => {
    if (!newAddr.streetLine || !newAddr.postalCode) {
      toast.error('Address line and PIN required');
      return;
    }
    await addAddress(newAddr);
    setNewAddressModal(false);
    loadUserData();
    toast.success('Address book updated');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#0a0804] text-[#f8f0e3]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8 border-b border-[#2a2416] pb-8">
          <div className="relative">
            <img
              src={user.avatar || user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'}
              alt={user.name || user.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#d4af37]/40 shadow-xl"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#d4af37] flex items-center justify-center text-black">
              <Star size={12} className="fill-current" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1
                className="font-display font-bold text-2xl text-[#f8f0e3]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {user.name || user.fullName || 'Patron'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
                {user.role}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="text-sm text-[#a8997c]">{user.email}</p>
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-900/30 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 size={11} /> Verified Email
                </span>
              ) : (
                <Link
                  to="/verify-email"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-900/30 text-amber-300 border border-amber-500/30 hover:bg-amber-900/50 transition-colors"
                >
                  <AlertCircle size={11} /> Unverified · Verify Email
                </Link>
              )}
            </div>
            {user.phone && <p className="text-xs text-[#a8997c] mt-0.5 font-mono">{user.phone}</p>}
          </div>

          <div className="flex gap-2">
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl border border-red-500/30 text-xs font-semibold text-red-400 hover:bg-red-950/40 transition-all flex items-center gap-1.5"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2a2416] mb-8 gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
                    : 'text-[#a8997c] hover:bg-[#1a140a]'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div ref={contentRef}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-[#141008] border border-[#2a2416] rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-bold text-lg text-[#f8f0e3]">Patron Information</h3>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="text-xs text-[#d4af37] flex items-center gap-1 hover:underline"
                    >
                      <Edit size={12} /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(false)}
                        className="text-xs text-[#a8997c] hover:text-[#f8f0e3]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="text-xs font-bold text-[#d4af37] hover:underline"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>

                {!editing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#a8997c]">Name</p>
                      <p className="text-sm font-semibold text-[#f8f0e3] mt-1">{user.name || user.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#a8997c]">Phone</p>
                      <p className="text-sm font-mono text-[#f8f0e3] mt-1">{user.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#a8997c]">Email</p>
                      <p className="text-sm text-[#f8f0e3] mt-1">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#a8997c]">Security Level</p>
                      <p className="text-sm text-[#d4af37] font-semibold mt-1">Verified Patron</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs uppercase tracking-wider text-[#a8997c] block mb-1">Name</label>
                      <input
                        className="w-full bg-[#0a0804] border border-[#2a2416] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4af37]"
                        value={editForm.name}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wider text-[#a8997c] block mb-1">Phone</label>
                      <input
                        className="w-full bg-[#0a0804] border border-[#2a2416] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#d4af37]"
                        value={editForm.phone}
                        onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-[#141008] border border-[#2a2416] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif font-bold text-lg text-[#f8f0e3]">Purchase Records</h3>
                <button
                  onClick={loadUserData}
                  className="text-xs text-[#d4af37] flex items-center gap-1 hover:underline"
                >
                  <RefreshCw size={12} /> Sync
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 text-[#a8997c]">
                  <p>No orders recorded yet.</p>
                  <Link
                    to="/menu"
                    className="mt-4 inline-block px-5 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-bold"
                  >
                    Explore Culinary Menu
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="bg-[#1a140a] border border-[#2a2416] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#d4af37]/40 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-sm text-[#d4af37]">
                            #{o.orderNumber}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
                            {o.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs text-[#a8997c] mt-1">
                          {o.items?.map((it) => `${it.quantity}× ${it.name}`).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-sm text-[#f8f0e3]">
                          ₹{o.totalAmount}
                        </span>
                        <Link
                          to={`/track?orderId=${o.orderNumber}`}
                          className="px-3.5 py-1.5 rounded-lg bg-[#2a2416] text-[#d4af37] text-xs font-semibold hover:bg-[#d4af37] hover:text-black transition-all"
                        >
                          Track Status
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-[#141008] border border-[#2a2416] rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#f8f0e3]">Saved Addresses</h3>
                  <p className="text-xs text-[#a8997c]">Manage verified delivery destinations</p>
                </div>
                <button
                  onClick={() => setNewAddressModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#d4af37] text-black text-xs font-bold flex items-center gap-1 hover:bg-[#e6c35c] transition-all"
                >
                  <Plus size={14} /> Add Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <p className="text-xs text-[#a8997c] py-6 text-center">No addresses registered yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="bg-[#1a140a] border border-[#2a2416] rounded-xl p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#d4af37]">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-900/30 text-emerald-400">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#f8f0e3] font-medium">{addr.streetLine}</p>
                        <p className="text-xs text-[#a8997c]">
                          {addr.city}, {addr.postalCode}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Address Modal */}
      {newAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#16120a] border border-[#d4af37]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-[#f8f0e3] mb-4">Add Delivery Address</h3>
            <div className="space-y-3 mb-6">
              <input
                className="w-full bg-[#0a0804] border border-[#2a2416] rounded-xl px-4 py-2.5 text-xs text-[#f8f0e3] outline-none"
                placeholder="Label (e.g. Home, Office)"
                value={newAddr.label}
                onChange={(e) => setNewAddr((a) => ({ ...a, label: e.target.value }))}
              />
              <input
                className="w-full bg-[#0a0804] border border-[#2a2416] rounded-xl px-4 py-2.5 text-xs text-[#f8f0e3] outline-none"
                placeholder="Street address line"
                value={newAddr.streetLine}
                onChange={(e) => setNewAddr((a) => ({ ...a, streetLine: e.target.value }))}
              />
              <input
                className="w-full bg-[#0a0804] border border-[#2a2416] rounded-xl px-4 py-2.5 text-xs text-[#f8f0e3] outline-none"
                placeholder="City"
                value={newAddr.city}
                onChange={(e) => setNewAddr((a) => ({ ...a, city: e.target.value }))}
              />
              <input
                className="w-full bg-[#0a0804] border border-[#2a2416] rounded-xl px-4 py-2.5 text-xs text-[#f8f0e3] outline-none"
                placeholder="Postal PIN Code"
                value={newAddr.postalCode}
                onChange={(e) => setNewAddr((a) => ({ ...a, postalCode: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setNewAddressModal(false)}
                className="px-4 py-2 text-xs text-[#a8997c] hover:bg-[#2a2416] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAddress}
                className="px-5 py-2 text-xs font-bold bg-[#d4af37] text-black rounded-xl hover:bg-[#e6c35c]"
              >
                Save Destination
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
