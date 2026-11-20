import { useState, useEffect, useRef } from 'react';
import { staffService } from '../api/services';
import { getImageUrl } from '../utils/imageUrl';
import gsap from 'gsap';
import {
  ChefHat, Clock, CheckCircle2, Flame, RefreshCw, Check, X, BellRing,
  UtensilsCrossed, Tag, Plus, Pencil, Trash2, Eye, EyeOff, Search,
  Upload, Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────
// Reusable Item Form Modal (create / edit)
// ─────────────────────────────────────────────────────────────
function ItemFormModal({ item, categories, onSave, onClose }) {
  const isEdit = !!item?.id;
  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    originalPrice: item?.originalPrice || '',
    categoryId: item?.categoryId || '',
    imageUrl: item?.imageUrl || '',
    isVeg: item ? (item.isVeg !== undefined ? Boolean(item.isVeg) : (item.veg !== undefined ? Boolean(item.veg) : true)) : true,
    isSpicy: item?.isSpicy ?? item?.spicy ?? false,
    isChefSpecial: item?.isChefSpecial ?? item?.chefSpecial ?? false,
    isBestseller: item?.isBestseller ?? item?.bestseller ?? false,
    cookTime: item?.cookTime || '',
    calories: item?.calories || '',
    servingInfo: item?.servingInfo || 'Serves 1-2',
    available: item?.available ?? true,
    tags: item?.tags || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(item?.imageUrl || '');
  const fileInputRef = useRef(null);

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setImagePreview(localPreviewUrl);

    try {
      setUploading(true);
      const res = await staffService.uploadFoodImage(file);
      if (res?.data?.imageUrl) {
        setForm((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
        setImagePreview(res.data.imageUrl);
        toast.success('Food image uploaded successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image to server');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.categoryId) {
      toast.error('Name, Price, and Category are required.');
      return;
    }
    setSaving(true);
    try {
      const vegStatus = Boolean(form.isVeg);
      const payload = {
        ...form,
        isVeg: vegStatus,
        veg: vegStatus,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : parseFloat(form.price),
        calories: form.calories ? parseInt(form.calories) : null,
        servingInfo: form.servingInfo?.trim() || 'Serves 1-2',
      };
      if (isEdit) {
        await staffService.updateMenuItem(item.id, payload);
        toast.success('Item updated!');
      } else {
        await staffService.createMenuItem(payload);
        toast.success('Item created!');
      }
      onSave();
    } catch (err) {
      toast.error(err?.message || (isEdit ? 'Failed to update' : 'Failed to create'));
    } finally {
      setSaving(false);
    }
  };

  const field = (label, name, type = 'text', extra = {}) => (
    <div>
      <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
        className="w-full bg-[#0a0804] border border-[#2a2416] rounded-xl px-3 py-2 text-sm text-[#f8f0e3] focus:border-[#d4af37] outline-none"
        {...extra}
      />
    </div>
  );

  const toggle = (label, name) => (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => setForm((p) => ({ ...p, [name]: !p[name] }))}
        className={`w-10 h-5 rounded-full transition-all relative ${form[name] ? 'bg-[#d4af37]' : 'bg-[#2a2416]'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form[name] ? 'left-5' : 'left-0.5'}`} />
      </div>
      <span className="text-xs text-[#a8997c]">{label}</span>
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#16120a] border border-[#d4af37]/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between mb-5 border-b border-[#2a2416] pb-3">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#f8f0e3]">
              {isEdit ? `Edit: ${item.name}` : 'Add New Menu Item'}
            </h3>
            <p className="text-xs text-[#a8997c]">Manage images, pricing, dietary status, and portion size</p>
          </div>
          <button onClick={onClose} className="text-[#a8997c] hover:text-[#f8f0e3]"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Box */}
          <div className="bg-[#0a0804] border-2 border-dashed border-[#2a2416] hover:border-[#d4af37]/50 rounded-2xl p-4 transition-all">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
            />
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#16120a] border border-[#2a2416] flex items-center justify-center relative flex-shrink-0">
                {imagePreview ? (
                  <img src={getImageUrl(imagePreview)} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-7 h-7 text-[#7a6b4e]" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-[#d4af37] animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-semibold text-[#f8f0e3]">Dish Presentation Photo</h4>
                <p className="text-xs text-[#a8997c]">Upload food image (JPG, PNG, WEBP max 5MB)</p>
                <div className="pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-[#2a2416] hover:bg-[#d4af37] hover:text-black text-xs font-semibold text-[#d4af37] transition-all flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Image
                  </button>
                  {form.imageUrl && (
                    <button
                      type="button"
                      onClick={() => { setForm((p) => ({ ...p, imageUrl: '' })); setImagePreview(''); }}
                      className="px-3 py-1.5 rounded-lg bg-red-950/40 text-red-400 text-xs hover:bg-red-900/50 transition-all"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Item Name *', 'name')}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Category *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                className="w-full bg-[#0a0804] border border-[#2a2416] rounded-xl px-3 py-2 text-sm text-[#f8f0e3] focus:border-[#d4af37] outline-none"
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full bg-[#0a0804] border border-[#2a2416] rounded-xl px-3 py-2 text-sm text-[#f8f0e3] focus:border-[#d4af37] outline-none resize-none"
            />
          </div>

          {/* Dietary Selection: Vegetarian vs Non-Vegetarian */}
          <div className="bg-[#141008] border border-[#2a2416] rounded-2xl p-3.5 space-y-2">
            <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] font-semibold">
              Dietary Classification *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, isVeg: true }))}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  form.isVeg
                    ? 'border-green-500 bg-green-950/40 text-green-300 shadow-md ring-1 ring-green-500/50'
                    : 'border-[#2a2416] bg-[#0a0804] text-[#a8997c] hover:border-green-500/40'
                }`}
              >
                <div className="w-4 h-4 rounded-sm border-2 border-green-500 flex items-center justify-center bg-black/80">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <span>VEGETARIAN (VEG)</span>
              </button>

              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, isVeg: false }))}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  !form.isVeg
                    ? 'border-red-500 bg-red-950/40 text-red-300 shadow-md ring-1 ring-red-500/50'
                    : 'border-[#2a2416] bg-[#0a0804] text-[#a8997c] hover:border-red-500/40'
                }`}
              >
                <div className="w-4 h-4 rounded-sm border-2 border-red-500 flex items-center justify-center bg-black/80">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                </div>
                <span>NON-VEGETARIAN (NON-VEG)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {field('Selling Price (₹) *', 'price', 'number', { step: '0.01', min: '0' })}
            {field('Original Price (₹)', 'originalPrice', 'number', { step: '0.01', min: '0' })}
            {field('Serving Info / Portion *', 'servingInfo', 'text', { placeholder: 'Serves 1-2 (450g), 6 Pcs' })}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('Cook Time', 'cookTime', 'text', { placeholder: '20-25 mins' })}
            {field('Calories (kcal)', 'calories', 'number', { min: '0' })}
          </div>

          {field('Tags (comma separated)', 'tags', 'text', { placeholder: 'spicy, north-indian' })}

          <div className="grid grid-cols-3 gap-4 pt-2">
            {toggle('Spicy', 'isSpicy')}
            {toggle('Chef Special', 'isChefSpecial')}
            {toggle('Bestseller', 'isBestseller')}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a8997c] hover:bg-[#2a2416] transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-6 py-2 rounded-xl text-xs font-semibold bg-[#d4af37] text-black hover:bg-[#e6c35c] transition-all disabled:opacity-50">
              {saving ? 'Saving...' : (isEdit ? 'Update Item' : 'Create Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Category Form Modal
// ─────────────────────────────────────────────────────────────
function CategoryFormModal({ category, onSave, onClose }) {
  const isEdit = !!category?.id;
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    icon: category?.icon || '',
    displayOrder: category?.displayOrder || 0,
    active: category?.active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await staffService.updateCategory(category.id, form);
        toast.success('Category updated!');
      } else {
        await staffService.createCategory(form);
        toast.success('Category created!');
      }
      onSave();
    } catch (err) {
      toast.error(err?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#16120a] border border-[#d4af37]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-serif font-bold text-[#f8f0e3]">
            {isEdit ? `Edit: ${category.name}` : 'New Category'}
          </h3>
          <button onClick={onClose} className="text-[#a8997c] hover:text-[#f8f0e3]"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            ['Name *', 'name'],
            ['Slug (auto if empty)', 'slug'],
            ['Icon / Emoji', 'icon'],
          ].map(([label, key]) => (
            <div key={key}>
              <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">{label}</label>
              <input value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full bg-[#0a0804] border border-[#2a2416] rounded-xl px-3 py-2 text-sm text-[#f8f0e3] focus:border-[#d4af37] outline-none" />
            </div>
          ))}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Description</label>
            <textarea rows={2} value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full bg-[#0a0804] border border-[#2a2416] rounded-xl px-3 py-2 text-sm text-[#f8f0e3] focus:border-[#d4af37] outline-none resize-none" />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Display Order</label>
            <input type="number" value={form.displayOrder} onChange={(e) => setForm((p) => ({ ...p, displayOrder: parseInt(e.target.value) }))}
              className="w-full bg-[#0a0804] border border-[#2a2416] rounded-xl px-3 py-2 text-sm text-[#f8f0e3] focus:border-[#d4af37] outline-none" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
              className={`w-10 h-5 rounded-full transition-all relative ${form.active ? 'bg-[#d4af37]' : 'bg-[#2a2416]'}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.active ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-xs text-[#a8997c]">Active (visible on menu)</span>
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a8997c] hover:bg-[#2a2416] transition-all">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-6 py-2 rounded-xl text-xs font-semibold bg-[#d4af37] text-black hover:bg-[#e6c35c] transition-all disabled:opacity-50">
              {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Confirm Delete Modal
// ─────────────────────────────────────────────────────────────
function ConfirmDeleteModal({ label, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#16120a] border border-red-500/40 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
        <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-serif font-bold text-[#f8f0e3] mb-2">Confirm Delete</h3>
        <p className="text-sm text-[#a8997c] mb-6">Are you sure you want to delete <span className="text-[#f8f0e3] font-semibold">"{label}"</span>? This cannot be undone.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-5 py-2 rounded-xl text-xs font-semibold text-[#a8997c] hover:bg-[#2a2416] transition-all">Cancel</button>
          <button disabled={loading} onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); }}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-500 transition-all disabled:opacity-50">
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Staff Dashboard
// ─────────────────────────────────────────────────────────────
export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('kitchen');
  const [dashboard, setDashboard] = useState(null);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Modals
  const [itemModal, setItemModal] = useState(null);      // null | 'create' | item object
  const [catModal, setCatModal] = useState(null);        // null | 'create' | category object
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'item'|'cat', id, name }

  const containerRef = useRef(null);

  const fetchKitchenData = async () => {
    try {
      const [dashRes, incomingRes] = await Promise.all([
        staffService.getDashboard().catch(() => ({ data: null })),
        staffService.getIncomingOrders().catch(() => ({ data: [] })),
      ]);
      if (dashRes?.data) setDashboard(dashRes.data);
      const orders = incomingRes?.data;
      if (Array.isArray(orders)) setIncomingOrders(orders);
      else if (orders?.content) setIncomingOrders(orders.content);
    } catch { toast.error('Failed to load kitchen feed'); }
  };

  const fetchMenuData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        staffService.getAllMenuItems(0, 100).catch(() => ({ data: { content: [] } })),
        staffService.getAllCategories().catch(() => ({ data: [] })),
      ]);
      const items = menuRes?.data?.content ?? menuRes?.data ?? [];
      const cats = catRes?.data?.content ?? catRes?.data ?? [];
      setMenuItems(Array.isArray(items) ? items : []);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch { toast.error('Failed to load menu data'); }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchKitchenData(), fetchMenuData()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const timer = setInterval(fetchKitchenData, 12000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeTab === 'menu' || activeTab === 'categories') fetchMenuData();
  }, [activeTab]);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from('.kitchen-card', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out' });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, activeTab]);

  // ── Kitchen handlers ──────────────────────────────────────
  const handleAccept = async (orderId) => {
    setActionLoading(true);
    try { await staffService.acceptOrder(orderId); toast.success('Order accepted!'); fetchKitchenData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to accept'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async (orderId) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    setActionLoading(true);
    try { await staffService.rejectOrder(orderId, reason); toast.error('Order rejected'); fetchKitchenData(); }
    catch { toast.error('Failed to reject'); }
    finally { setActionLoading(false); }
  };

  const handleStartPreparing = async (orderId) => {
    setActionLoading(true);
    try { await staffService.startPreparing(orderId); toast.success('Cooking started!'); fetchKitchenData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActionLoading(false); }
  };

  const handleMarkReady = async (orderId) => {
    setActionLoading(true);
    try { await staffService.markReadyForPickup(orderId); toast.success('Order READY!'); fetchKitchenData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActionLoading(false); }
  };

  // ── Menu handlers ─────────────────────────────────────────
  const handleToggleAvailability = async (item) => {
    try {
      await staffService.toggleMenuItemAvailability(item.id, !item.available);
      setMenuItems((prev) => prev.map((i) => i.id === item.id ? { ...i, available: !i.available } : i));
      toast.success(`${item.name} marked ${!item.available ? 'available' : 'unavailable'}`);
    } catch { toast.error('Failed to update availability'); }
  };

  const handleDeleteItem = async () => {
    await staffService.deleteMenuItem(deleteTarget.id);
    toast.success('Item deleted');
    setDeleteTarget(null);
    fetchMenuData();
  };

  const handleDeleteCategory = async () => {
    await staffService.deleteCategory(deleteTarget.id);
    toast.success('Category deleted');
    setDeleteTarget(null);
    fetchMenuData();
  };

  const filteredItems = menuItems.filter(
    (i) => i.name?.toLowerCase().includes(search.toLowerCase()) || i.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0804] text-[#f8f0e3] pt-24 pb-16 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2a2416] pb-6">
        <div>
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/30 flex items-center gap-1.5 w-fit mb-2">
            <ChefHat className="w-3.5 h-3.5" /> Kitchen & Item Management
          </span>
          <h1 className="text-3xl font-serif font-bold text-[#f8f0e3] tracking-wide">Staff Terminal</h1>
          <p className="text-sm text-[#a8997c]">Manage kitchen orders, menu items, and categories.</p>
        </div>
        <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a140a] border border-[#d4af37]/30 text-xs font-semibold text-[#d4af37] hover:bg-[#d4af37]/10 transition-all self-start md:self-auto">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex border-b border-[#2a2416] mb-8 gap-2 overflow-x-auto pb-2">
          {[
            { id: 'kitchen', label: 'Kitchen KDS', Icon: ChefHat },
            { id: 'menu', label: 'Menu Items', Icon: UtensilsCrossed },
            { id: 'categories', label: 'Categories', Icon: Tag },
          ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === t.id ? 'bg-[#d4af37] text-black font-semibold shadow-lg shadow-[#d4af37]/20' : 'text-[#a8997c] hover:text-[#f8f0e3] hover:bg-[#1a140a]'}`}>
              <t.Icon size={15} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB: KITCHEN ─────────────────────────────────────── */}
        {activeTab === 'kitchen' && (
          <div className="space-y-8">
            {/* Metric row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Incoming Pending', val: incomingOrders.length, color: 'amber', Icon: BellRing },
                { label: 'On Cooktops', val: dashboard?.preparingOrdersCount ?? 0, color: 'orange', Icon: Flame },
                { label: 'Ready for Handover', val: dashboard?.readyForPickupCount ?? 0, color: 'emerald', Icon: CheckCircle2 },
              ].map(({ label, val, color, Icon }) => (
                <div key={label} className={`bg-[#141008] border border-${color}-500/30 rounded-2xl p-5 flex items-center justify-between`}>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#a8997c]">{label}</p>
                    <h3 className={`text-3xl font-serif font-bold text-${color}-400 mt-1`}>{val}</h3>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 flex items-center justify-center text-${color}-400`}>
                    <Icon className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

            {/* Incoming */}
            <div>
              <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                <BellRing size={18} className="text-[#d4af37]" /> Incoming Orders
                <span className="text-xs bg-[#2a2416] text-[#d4af37] px-2 py-0.5 rounded-full font-mono">{incomingOrders.length}</span>
              </h2>
              {incomingOrders.length === 0 ? (
                <div className="bg-[#141008] border border-[#2a2416] rounded-2xl p-12 text-center text-[#a8997c]">
                  <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-base font-serif text-[#f8f0e3]">No pending incoming orders</p>
                  <p className="text-xs mt-1">All tickets acknowledged.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {incomingOrders.map((order) => (
                    <div key={order.id} className="kitchen-card bg-gradient-to-b from-[#18130a] to-[#120e07] border border-amber-500/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-[#2a2416] pb-3 mb-4">
                          <div>
                            <span className="text-xs uppercase tracking-wider text-[#a8997c]">Order</span>
                            <h4 className="font-mono text-lg font-bold text-[#d4af37]">#{order.orderNumber}</h4>
                          </div>
                          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-[11px] font-semibold rounded-full border border-amber-500/30 animate-pulse">PENDING</span>
                        </div>
                        <div className="space-y-2 mb-4">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="font-semibold text-[#f8f0e3]">{item.quantity}× {item.name}</span>
                              <span className="text-xs font-mono text-[#a8997c]">₹{item.subtotal}</span>
                            </div>
                          ))}
                        </div>
                        {order.customerNotes && (
                          <div className="bg-[#0a0804] border border-[#2a2416] rounded-lg p-2 text-xs text-amber-200/80 mb-4">
                            <span className="font-semibold text-amber-400">Note: </span>{order.customerNotes}
                          </div>
                        )}
                      </div>
                      <div className="pt-4 border-t border-[#2a2416] flex gap-2">
                        <button onClick={() => handleReject(order.id)} disabled={actionLoading}
                          className="px-3 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-900/50 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleAccept(order.id)} disabled={actionLoading}
                          className="flex-1 py-2.5 rounded-xl bg-[#d4af37] text-black text-xs font-bold hover:bg-[#e6c35c] transition-all flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4" /> Accept Ticket
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prep & Ready */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#141008] border border-[#2a2416] rounded-2xl p-6">
                <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" /> Active Cooking Queue
                </h3>
                {!dashboard?.preparingOrders?.length ? (
                  <p className="text-xs text-[#a8997c] py-6 text-center">No orders on cooktops</p>
                ) : dashboard.preparingOrders.map((ord) => (
                  <div key={ord.id} className="bg-[#1a140a] border border-[#2a2416] rounded-xl p-4 flex justify-between items-center mb-3">
                    <div>
                      <div className="font-mono text-sm font-bold text-[#d4af37]">#{ord.orderNumber}</div>
                      <div className="text-xs text-[#f8f0e3] mt-1">{ord.items?.map((it) => `${it.quantity}× ${it.name}`).join(', ')}</div>
                    </div>
                    <button onClick={() => handleMarkReady(ord.id)} disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all">
                      Mark Ready
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-[#141008] border border-[#2a2416] rounded-2xl p-6">
                <h3 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Ready for Handover
                </h3>
                {!dashboard?.readyOrders?.length ? (
                  <p className="text-xs text-[#a8997c] py-6 text-center">No packed orders yet</p>
                ) : dashboard.readyOrders.map((ord) => (
                  <div key={ord.id} className="bg-[#1a140a] border border-emerald-900/30 rounded-xl p-4 flex justify-between items-center mb-3">
                    <div>
                      <div className="font-mono text-sm font-bold text-emerald-400">#{ord.orderNumber}</div>
                      <div className="text-xs text-[#a8997c] mt-0.5">Packed & Inspected</div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">Awaiting Driver</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: MENU ITEMS ───────────────────────────────────── */}
        {activeTab === 'menu' && (
          <div>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8997c]" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search items..."
                  className="w-full bg-[#141008] border border-[#2a2416] rounded-xl pl-9 pr-4 py-2 text-sm text-[#f8f0e3] focus:border-[#d4af37] outline-none" />
              </div>
              <button onClick={() => setItemModal('create')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-bold hover:bg-[#e6c35c] transition-all self-start sm:self-auto">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-[#141008] border border-[#2a2416] rounded-xl p-4 flex gap-3 items-start">
                  {item.imageUrl ? (
                    <img src={getImageUrl(item.imageUrl)} alt={item.name} onError={(e) => { e.target.style.display = 'none'; }}
                      className="w-16 h-16 rounded-lg object-cover border border-[#2a2416] flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-[#2a2416] flex items-center justify-center flex-shrink-0 text-[#c9933a]">
                      <UtensilsCrossed className="w-6 h-6 opacity-60" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-[#f8f0e3] truncate">{item.name}</h3>
                    <p className="text-xs text-[#a8997c] mb-1">
                      {item.categoryName} · ₹{item.price} {item.servingInfo && <span className="text-[#c9933a] font-medium">• {item.servingInfo}</span>}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(() => {
                        const isItemVeg = item.isVeg !== undefined ? Boolean(item.isVeg) : (item.veg !== undefined ? Boolean(item.veg) : true);
                        return (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                            isItemVeg
                              ? 'bg-green-900/30 text-green-400 border-green-500/20'
                              : 'bg-red-900/30 text-red-400 border-red-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isItemVeg ? 'bg-green-400' : 'bg-red-400'}`} />
                            {isItemVeg ? 'VEG' : 'NON-VEG'}
                          </span>
                        );
                      })()}
                      {item.isSpicy && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/30 text-red-400 border border-red-500/20">SPICY</span>}
                      {item.isChefSpecial && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/30 text-amber-400 border border-amber-500/20">CHEF</span>}
                      {item.isBestseller && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-400 border border-purple-500/20">BEST</span>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => handleToggleAvailability(item)}
                        className={`flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full font-medium transition-all ${item.available ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30' : 'bg-red-900/30 text-red-400 border border-red-500/30'}`}>
                        {item.available ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {item.available ? 'Available' : 'Unavailable'}
                      </button>
                      <button onClick={() => setItemModal(item)}
                        className="p-1 rounded-lg text-[#a8997c] hover:text-[#d4af37] hover:bg-[#2a2416] transition-all">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget({ type: 'item', id: item.id, name: item.name })}
                        className="p-1 rounded-lg text-[#a8997c] hover:text-red-400 hover:bg-red-950/30 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="col-span-3 text-center py-16 text-[#a8997c]">
                  <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No items found. Add your first menu item!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: CATEGORIES ──────────────────────────────────── */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-[#f8f0e3]">Food Categories</h2>
              <button onClick={() => setCatModal('create')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-bold hover:bg-[#e6c35c] transition-all">
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-[#141008] border border-[#2a2416] rounded-xl p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#2a2416] flex items-center justify-center text-[#d4af37]">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#f8f0e3] text-sm">{cat.name}</h3>
                      <p className="text-xs text-[#a8997c]">{cat.itemCount ?? 0} items · order #{cat.displayOrder}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${cat.active ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                        {cat.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCatModal(cat)}
                      className="p-1.5 rounded-lg text-[#a8997c] hover:text-[#d4af37] hover:bg-[#2a2416] transition-all">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget({ type: 'cat', id: cat.id, name: cat.name })}
                      className="p-1.5 rounded-lg text-[#a8997c] hover:text-red-400 hover:bg-red-950/30 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="col-span-3 text-center py-16 text-[#a8997c]">
                  <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No categories yet. Create one to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ────────────────────────────────────────────── */}
      {itemModal && (
        <ItemFormModal
          item={itemModal === 'create' ? null : itemModal}
          categories={categories}
          onSave={() => { setItemModal(null); fetchMenuData(); }}
          onClose={() => setItemModal(null)}
        />
      )}

      {catModal && (
        <CategoryFormModal
          category={catModal === 'create' ? null : catModal}
          onSave={() => { setCatModal(null); fetchMenuData(); }}
          onClose={() => setCatModal(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          label={deleteTarget.name}
          onConfirm={deleteTarget.type === 'item' ? handleDeleteItem : handleDeleteCategory}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
