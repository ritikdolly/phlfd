import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { User, Package, MapPin, LogOut, Edit, ChevronRight, Star, Clock, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
];

const DEMO_ORDERS = [
  {
    id: 'SAV-849201',
    items: [{ name: 'Dum Biryani Nawabi', qty: 1, price: 1280 }, { name: 'Butter Chicken Noir', qty: 2, price: 780 }],
    total: 2840,
    status: 'delivered',
    date: '2026-10-20T14:32:00Z',
  },
  {
    id: 'SAV-728456',
    items: [{ name: 'Rogan Josh Imperiale', qty: 1, price: 1080 }, { name: 'Warqi Paratha', qty: 3, price: 150 }],
    total: 1530,
    status: 'delivered',
    date: '2026-10-12T19:45:00Z',
  },
];

const STATUS_COLORS = {
  delivered: 'text-green-400 bg-green-500/10 border-green-500/20',
  preparing: 'text-[#c9933a] bg-[#c9933a]/10 border-[#c9933a]/20',
  cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const { user, logout, updateProfile } = useAuth();
  const [editForm, setEditForm] = useState(() => ({ name: user?.name || '', phone: user?.phone || '' }));
  const navigate = useNavigate();
  const contentRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!contentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current,
        { y: 15, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, [activeTab]);

  const handleSave = () => {
    updateProfile(editForm);
    setEditing(false);
  };

  const orders = [...(user?.orders || []), ...DEMO_ORDERS];

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-3xl object-cover border-2 border-[#c9933a]/30"
            />
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #c9933a, #e8b96a)' }}
            >
              <Star size={10} className="text-[#0a0804] fill-current" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="font-display font-bold text-2xl text-[#f8f0e3]" style={{ fontFamily: 'Playfair Display, serif' }}>
              {user.name}
            </h1>
            <p className="text-[#7a6b4e] text-sm">{user.email}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="badge badge-gold">Gold Member</span>
              <span className="text-xs text-[#4a4030]">{orders.length} orders</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="btn-ghost text-sm text-red-400 hover:bg-red-500/10"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl mb-8 glass" style={{ maxWidth: 'fit-content' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[rgba(201,147,58,0.15)] text-[#c9933a]'
                    : 'text-[#7a6b4e] hover:text-[#f8f0e3]'
                }`}
              >
                <Icon size={15} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div ref={contentRef}>
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile card */}
              <div className="card-dark p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-lg text-[#f8f0e3]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Profile Details
                  </h2>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="flex items-center gap-1.5 text-xs text-[#c9933a] hover:text-[#e8b96a] transition-colors"
                  >
                    <Edit size={12} /> {editing ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[#7a6b4e] mb-1 block">Name</label>
                      <input
                        className="input-dark"
                        value={editForm.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#7a6b4e] mb-1 block">Phone</label>
                      <input
                        className="input-dark"
                        value={editForm.phone}
                        onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                      />
                    </div>
                    <button onClick={handleSave} className="btn-primary w-full text-sm py-3">
                      <Check size={14} /> Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { label: 'Name', val: user.name },
                      { label: 'Email', val: user.email },
                      { label: 'Phone', val: user.phone || '—' },
                    ].map(field => (
                      <div key={field.label} className="flex justify-between text-sm border-b border-[#2e2a1e] pb-3 last:border-0">
                        <span className="text-[#7a6b4e]">{field.label}</span>
                        <span className="text-[#f8f0e3]">{field.val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-4">
                {[
                  { label: 'Total Orders', val: orders.length, icon: Package, color: 'text-[#c9933a]' },
                  { label: 'Total Spent', val: `₹${orders.reduce((s, o) => s + o.total, 0).toLocaleString()}`, icon: Star, color: 'text-[#e8b96a]' },
                  { label: 'Saved Addresses', val: user.addresses?.length || 0, icon: MapPin, color: 'text-purple-400' },
                ].map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center gap-4 card-dark p-4">
                      <div className="w-11 h-11 rounded-2xl glass-gold flex items-center justify-center">
                        <Icon size={18} className={stat.color} />
                      </div>
                      <div>
                        <p className="font-bold text-xl text-[#f8f0e3]">{stat.val}</p>
                        <p className="text-xs text-[#7a6b4e]">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <Package size={48} className="text-[#2e2a1e] mx-auto mb-4" />
                  <h3 className="font-display text-xl text-[#7a6b4e]" style={{ fontFamily: 'Playfair Display, serif' }}>No orders yet</h3>
                  <p className="text-[#4a4030] text-sm mt-1 mb-6">Your order history will appear here</p>
                  <Link to="/menu" className="btn-primary">Order Now</Link>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="card-dark p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-mono text-sm font-semibold text-[#c9933a]">{order.id}</p>
                          <span className={`badge text-[0.6rem] border ${STATUS_COLORS[order.status] || STATUS_COLORS.delivered}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#7a6b4e] flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#c9933a]">₹{order.total.toLocaleString()}</p>
                        <p className="text-xs text-[#7a6b4e]">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="text-sm text-[#7a6b4e] mb-3">
                      {order.items.map((i, idx) => (
                        <span key={idx}>{i.qty}× {i.name}{idx < order.items.length - 1 ? ', ' : ''}</span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-outline text-xs py-2 px-4">Reorder</button>
                      <Link to="/track" className="btn-ghost text-xs py-2 px-4">
                        Track <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-4">
              {(user.addresses || []).length === 0 ? (
                <div className="text-center py-16">
                  <MapPin size={48} className="text-[#2e2a1e] mx-auto mb-4" />
                  <h3 className="font-display text-xl text-[#7a6b4e]" style={{ fontFamily: 'Playfair Display, serif' }}>No saved addresses</h3>
                  <p className="text-[#4a4030] text-sm mt-1">Add an address during checkout</p>
                </div>
              ) : (
                user.addresses.map(addr => (
                  <div key={addr.id} className="card-dark p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl glass-gold flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin size={16} className="text-[#c9933a]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm text-[#f8f0e3]">{addr.label}</p>
                        {addr.isDefault && <span className="badge badge-gold text-[0.6rem]">Default</span>}
                      </div>
                      <p className="text-sm text-[#7a6b4e]">{addr.line}</p>
                      <p className="text-xs text-[#4a4030]">{addr.city} — {addr.pin}</p>
                    </div>
                  </div>
                ))
              )}
              <button className="w-full card-dark p-4 flex items-center justify-center gap-2 text-sm text-[#7a6b4e] hover:text-[#c9933a] hover:border-[#c9933a]/30 transition-all border-2 border-dashed border-[#2e2a1e] rounded-2xl">
                + Add New Address
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
