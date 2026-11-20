import { useState, useEffect, useRef } from 'react';
import { ownerService } from '../api/services';
import { getImageUrl } from '../utils/imageUrl';
import gsap from 'gsap';
import {
  TrendingUp, Users, DollarSign, Package, ShieldCheck,
  ChevronRight, ArrowUpRight, Plus, RefreshCw, CheckCircle,
  Pencil, Trash2, Eye, EyeOff, Search, X, UserCheck, UserX,
  Tag, UtensilsCrossed, Upload, Image as ImageIcon, Sparkles, Percent,
  ChefHat, LayoutDashboard, FolderTree
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────
// Confirm Delete Modal
// ─────────────────────────────────────────────────────────────
function ConfirmModal({ label, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#16120a] border border-red-500/40 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
        <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-serif font-bold text-[#f8f0e3] mb-2">Confirm Delete</h3>
        <p className="text-sm text-[#a8997c] mb-6">Delete <span className="text-[#f8f0e3] font-semibold">"{label}"</span>? This cannot be undone.</p>
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
// Food Item Create / Edit Form Modal with Real Image Upload & Live Pricing
// ─────────────────────────────────────────────────────────────
function ItemFormModal({ item, categories, onSave, onClose }) {
  const isEdit = !!item?.id;

  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    detailedDescription: item?.detailedDescription || '',
    originalPrice: item?.originalPrice || item?.price || '',
    discountPercentage: item?.discountPercentage || 0,
    discountActive: item?.discountActive ?? true,
    categoryId: item?.categoryId || '',
    imageUrl: item?.imageUrl || '',
    isVeg: item ? (item.isVeg !== undefined ? Boolean(item.isVeg) : (item.veg !== undefined ? Boolean(item.veg) : true)) : true,
    isSpicy: item?.isSpicy ?? item?.spicy ?? false,
    isChefSpecial: item?.isChefSpecial ?? item?.chefSpecial ?? false,
    isBestseller: item?.isBestseller ?? item?.bestseller ?? false,
    cookTime: item?.cookTime || '20-25 mins',
    calories: item?.calories || '',
    servingInfo: item?.servingInfo || 'Serves 1-2',
    available: item?.available ?? true,
    tags: item?.tags || '',
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(item?.imageUrl || '');
  const fileInputRef = useRef(null);

  // Live Automatic Price Calculation (Real-world Formula)
  const origPriceNum = parseFloat(form.originalPrice) || 0;
  const discountPctNum = parseFloat(form.discountPercentage) || 0;
  const validDiscount = form.discountActive && discountPctNum > 0 && origPriceNum > 0;
  const calculatedDiscountAmt = validDiscount
    ? (origPriceNum * Math.min(100, Math.max(0, discountPctNum))) / 100
    : 0;
  const calculatedSellingPrice = Math.max(0, origPriceNum - calculatedDiscountAmt);

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
      const res = await ownerService.uploadFoodImage(file);
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
    if (!form.name.trim()) { toast.error('Item name is required'); return; }
    if (!origPriceNum || origPriceNum <= 0) { toast.error('Original price (MRP) must be greater than zero'); return; }
    if (!form.categoryId) { toast.error('Please select a food category'); return; }

    setSaving(true);
    try {
      const vegStatus = Boolean(form.isVeg);
      const payload = {
        ...form,
        isVeg: vegStatus,
        veg: vegStatus,
        originalPrice: origPriceNum,
        discountPercentage: Math.min(100, Math.max(0, discountPctNum)),
        price: calculatedSellingPrice,
        calories: form.calories ? parseInt(form.calories) : null,
        servingInfo: form.servingInfo?.trim() || 'Serves 1-2',
      };

      if (isEdit) {
        await ownerService.updateMenuItem(item.id, payload);
        toast.success('Food item updated successfully!');
      } else {
        await ownerService.createMenuItem(payload);
        toast.success('Food item created successfully!');
      }
      onSave();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save menu item');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full bg-[#0a0804] border border-[#2a2416] rounded-xl px-3 py-2 text-sm text-[#f8f0e3] focus:border-[#d4af37] outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#16120a] border border-[#d4af37]/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between mb-5 border-b border-[#2a2416] pb-3">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#f8f0e3]">
              {isEdit ? `Edit Dish: ${item.name}` : 'Add New Culinary Creation'}
            </h3>
            <p className="text-xs text-[#a8997c]">Manage images, pricing, automatic discounts, and categorization</p>
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
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#16120a] border border-[#2a2416] flex items-center justify-center relative flex-shrink-0">
                {imagePreview ? (
                  <img src={getImageUrl(imagePreview)} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[#7a6b4e]" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-[#d4af37] animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-semibold text-[#f8f0e3]">Dish Presentation Photo</h4>
                <p className="text-xs text-[#a8997c]">Supports JPG, PNG, WEBP up to 5MB. Unique filename generated automatically.</p>
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-lg bg-[#2a2416] hover:bg-[#d4af37] hover:text-black text-xs font-semibold text-[#d4af37] transition-all flex items-center gap-1.5"
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

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Item Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className={inputCls}
                placeholder="e.g. Awadhi Murgh Biryani"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Category *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                className={inputCls}
              >
                <option value="">-- Choose Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Short Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className={inputCls}
              placeholder="Crispy fried potato patties spiced with cumin..."
            />
          </div>

          {/* REAL-WORLD DYNAMIC PRICING ENGINE BOX */}
          <div className="bg-[#141008] border border-[#d4af37]/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5" /> Dynamic Discount & Pricing Engine
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.discountActive}
                  onChange={(e) => setForm((p) => ({ ...p, discountActive: e.target.checked }))}
                  className="rounded border-[#2a2416] text-[#d4af37]"
                />
                <span className="text-xs text-[#a8997c]">Enable Discount</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Original Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.originalPrice}
                  onChange={(e) => setForm((p) => ({ ...p, originalPrice: e.target.value }))}
                  className={inputCls}
                  placeholder="500"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Discount (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={form.discountPercentage}
                  onChange={(e) => setForm((p) => ({ ...p, discountPercentage: e.target.value }))}
                  className={inputCls}
                  placeholder="20"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Discount Amt</label>
                <div className="bg-[#0a0804] border border-[#2a2416] rounded-xl px-3 py-2 text-sm font-mono text-red-400">
                  -₹{calculatedDiscountAmt.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Selling Price</label>
                <div className="bg-[#0a0804] border border-emerald-500/40 rounded-xl px-3 py-2 text-sm font-mono font-bold text-emerald-400">
                  ₹{calculatedSellingPrice.toFixed(2)}
                </div>
              </div>
            </div>

            {validDiscount && (
              <p className="text-xs text-amber-300/80 bg-amber-950/20 px-3 py-1.5 rounded-lg border border-amber-500/20">
                <span className="font-semibold text-[#f8f0e3]">Preview:</span> Customers will see: <span className="line-through text-[#7a6b4e]">₹{origPriceNum.toFixed(0)}</span> <strong className="text-emerald-400">₹{calculatedSellingPrice.toFixed(0)}</strong> with badge <span className="text-red-400 font-bold">{discountPctNum}% OFF</span>
              </p>
            )}
          </div>

          {/* Dietary Type: Vegetarian vs Non-Vegetarian */}
          <div className="bg-[#141008] border border-[#2a2416] rounded-2xl p-4 space-y-2">
            <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] font-semibold">
              Dietary Classification *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, isVeg: true }))}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all ${
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
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all ${
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
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Serving Quantity / Portion *</label>
              <input
                value={form.servingInfo}
                onChange={(e) => setForm((p) => ({ ...p, servingInfo: e.target.value }))}
                className={inputCls}
                placeholder="e.g. Serves 1-2 (450g), 6 Pcs, 350ml"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Cook Time</label>
              <input
                value={form.cookTime}
                onChange={(e) => setForm((p) => ({ ...p, cookTime: e.target.value }))}
                className={inputCls}
                placeholder="25 mins"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Calories (kcal)</label>
              <input
                type="number"
                value={form.calories}
                onChange={(e) => setForm((p) => ({ ...p, calories: e.target.value }))}
                className={inputCls}
                placeholder="420"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              className={inputCls}
              placeholder="biryani, spicy, mughlai"
            />
          </div>

          {/* Badges / Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              ['isSpicy', 'Spicy Dish'],
              ['isChefSpecial', "Chef's Special"],
              ['isBestseller', 'Bestseller'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer bg-[#0a0804] border border-[#2a2416] p-2.5 rounded-xl">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))}
                  className="rounded border-[#2a2416] text-[#d4af37]"
                />
                <span className="text-xs text-[#f8f0e3]">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-[#2a2416]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#a8997c] hover:bg-[#2a2416] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#d4af37] text-black hover:bg-[#e6c35c] transition-all disabled:opacity-50 shadow-lg"
            >
              {saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Dish')}
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
  const inputCls = 'w-full bg-[#0a0804] border border-[#2a2416] rounded-xl px-3 py-2 text-sm text-[#f8f0e3] focus:border-[#d4af37] outline-none';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await ownerService.updateCategory(category.id, form);
        toast.success('Category updated!');
      } else {
        await ownerService.createCategory(form);
        toast.success('Category created!');
      }
      onSave();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save category');
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
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Name *</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="e.g. Biryanis" />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Badge Tag</label>
            <input value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} className={inputCls} placeholder="e.g. Signature" />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className={`${inputCls} resize-none`} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a8997c] hover:bg-[#2a2416] transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 rounded-xl text-xs font-semibold bg-[#d4af37] text-black hover:bg-[#e6c35c] transition-all disabled:opacity-50">
              {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Quick Discount Modifier Modal
// ─────────────────────────────────────────────────────────────
function DiscountModifierModal({ item, onSave, onClose }) {
  const [discountPercentage, setDiscountPercentage] = useState(item?.discountPercentage || 15);
  const [active, setActive] = useState(item?.discountActive ?? true);
  const [saving, setSaving] = useState(false);

  const origPrice = Number(item?.originalPrice || item?.price || 0);
  const discPct = Number(discountPercentage) || 0;
  const discAmt = (origPrice * discPct) / 100;
  const sellingPrice = Math.max(0, origPrice - discAmt);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ownerService.updateDiscount(item.id, {
        discountPercentage: discPct,
        active,
      });
      toast.success(`Updated discount for ${item.name}`);
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update discount');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#16120a] border border-[#d4af37]/40 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-[#2a2416] pb-3">
          <h3 className="font-serif font-bold text-base text-[#f8f0e3]">Set Discount: {item.name}</h3>
          <button onClick={onClose} className="text-[#a8997c] hover:text-[#f8f0e3]"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#a8997c] mb-1">Discount Percentage (%)</label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              className="w-full bg-[#0a0804] border border-[#2a2416] rounded-xl px-3 py-2 text-sm text-[#f8f0e3] focus:border-[#d4af37] outline-none"
            />
          </div>

          <div className="bg-[#0a0804] border border-[#2a2416] p-3 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between text-[#a8997c]">
              <span>Original MRP:</span> <span className="font-mono text-[#f8f0e3]">₹{origPrice}</span>
            </div>
            <div className="flex justify-between text-red-400">
              <span>Discount ({discPct}%):</span> <span className="font-mono">-₹{discAmt.toFixed(0)}</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-400 pt-1 border-t border-[#2a2416]">
              <span>Customer Pays:</span> <span className="font-mono text-sm">₹{sellingPrice.toFixed(0)}</span>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded text-[#d4af37]"
            />
            <span className="text-xs text-[#a8997c]">Discount Offer Active</span>
          </label>

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs text-[#a8997c] hover:bg-[#2a2416]">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl text-xs font-bold bg-[#d4af37] text-black hover:bg-[#e6c35c] disabled:opacity-50">
              {saving ? 'Saving...' : 'Apply Discount'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Staff Form Modal (create / edit)
// ─────────────────────────────────────────────────────────────
function StaffFormModal({ staff, onSave, onClose }) {
  const isEdit = !!staff?.id;
  const [form, setForm] = useState({
    fullName: staff?.fullName || '',
    email: staff?.email || '',
    password: '',
    phone: staff?.phone || '',
    role: staff?.role || 'ROLE_STAFF',
    active: staff?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const inputCls = 'w-full bg-[#0a0804] border border-[#2a2416] rounded-xl px-3 py-2 text-sm text-[#f8f0e3] focus:border-[#d4af37] outline-none';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) { toast.error('Name and email are required'); return; }
    if (!isEdit && !form.password) { toast.error('Password is required for new staff'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (isEdit) {
        await ownerService.updateStaff(staff.id, payload);
        toast.success('Staff updated!');
      } else {
        await ownerService.createStaff(payload);
        toast.success('Staff account created!');
      }
      onSave();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save staff');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#16120a] border border-[#d4af37]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-serif font-bold text-[#f8f0e3]">{isEdit ? `Edit: ${staff.fullName}` : 'Add Staff / Delivery'}</h3>
          <button onClick={onClose} className="text-[#a8997c] hover:text-[#f8f0e3]"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Full Name *</label>
            <input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">{isEdit ? 'New Password (optional)' : 'Password *'}</label>
            <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#a8997c] mb-1">Role *</label>
            <select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className={inputCls}>
              <option value="ROLE_STAFF">Kitchen Staff</option>
              <option value="ROLE_DELIVERY_MAN">Delivery Personnel</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a8997c] hover:bg-[#2a2416]">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 rounded-xl text-xs font-semibold bg-[#d4af37] text-black hover:bg-[#e6c35c] disabled:opacity-50">
              {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Owner Dashboard
// ─────────────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [menuList, setMenuList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [discountsList, setDiscountsList] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Modals
  const [itemModal, setItemModal] = useState(null);
  const [catModal, setCatModal] = useState(null);
  const [staffModal, setStaffModal] = useState(null);
  const [discountModal, setDiscountModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Search & Filters
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilterDiscount, setMenuFilterDiscount] = useState('all');

  const containerRef = useRef(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, staffRes, menuRes, catRes, discRes] = await Promise.all([
        ownerService.getDashboardStats().catch(() => ({ data: null })),
        ownerService.getAllOrders(null, 0, 10).catch(() => ({ data: { content: [] } })),
        ownerService.getStaffMembers(null, 0, 50).catch(() => ({ data: { content: [] } })),
        ownerService.getAllMenuItems(0, 100).catch(() => ({ data: { content: [] } })),
        ownerService.getAllCategories().catch(() => ({ data: [] })),
        ownerService.getAllDiscounts().catch(() => ({ data: [] })),
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      setOrders(ordersRes?.data?.content || ordersRes?.data || []);
      setStaffList(staffRes?.data?.content || staffRes?.data || []);
      setMenuList(menuRes?.data?.content || menuRes?.data || []);
      setCategories(catRes?.data || []);
      setDiscountsList(discRes?.data || []);
    } catch {
      toast.error('Failed to load portal data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleToggleMenuAvailability = async (item) => {
    try {
      await ownerService.toggleMenuItemAvailability(item.id, !item.available);
      setMenuList((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, available: !i.available } : i))
      );
      toast.success(`${item.name} availability updated`);
    } catch {
      toast.error('Failed to toggle availability');
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteTarget.type === 'item') {
        await ownerService.deleteMenuItem(deleteTarget.id);
      } else if (deleteTarget.type === 'cat') {
        await ownerService.deleteCategory(deleteTarget.id);
      }
      toast.success('Deleted successfully');
      setDeleteTarget(null);
      fetchAll();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filteredMenu = menuList.filter((item) => {
    const matchQuery = item.name?.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.categoryName?.toLowerCase().includes(menuSearch.toLowerCase());
    const hasDisc = item.discountActive && Number(item.discountPercentage) > 0;
    if (menuFilterDiscount === 'discounted') return matchQuery && hasDisc;
    if (menuFilterDiscount === 'regular') return matchQuery && !hasDisc;
    return matchQuery;
  });

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0804] text-[#f8f0e3] pt-24 pb-16 px-4 md:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2a2416] pb-6">
        <div>
          <span className="px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs font-semibold rounded-full border border-[#d4af37]/30 flex items-center gap-1.5 w-fit mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Owner Operations & Pricing Hub
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-wide">
            Savoria Restaurant Command
          </h1>
          <p className="text-sm text-[#a8997c]">
            Real-world menu management, dynamic discounts, high-resolution food images, and fleet oversight.
          </p>
        </div>

        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a140a] border border-[#d4af37]/30 text-xs font-semibold text-[#d4af37] hover:bg-[#d4af37]/10 transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Feed
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#2a2416] mb-8 gap-2 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
            { id: 'menu', label: `Menu (${menuList.length})`, Icon: UtensilsCrossed },
            { id: 'discounts', label: `Discounts (${discountsList.length})`, Icon: Percent },
            { id: 'categories', label: `Categories (${categories.length})`, Icon: FolderTree },
            { id: 'orders', label: 'Orders', Icon: Package },
            { id: 'staff', label: `Staff (${staffList.length})`, Icon: ChefHat },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#d4af37] text-black font-semibold shadow-lg shadow-[#d4af37]/20'
                  : 'text-[#a8997c] hover:text-[#f8f0e3] hover:bg-[#1a140a]'
              }`}
            >
              <tab.Icon size={15} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB: OVERVIEW ─────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', val: `₹${stats?.totalRevenue?.toLocaleString() ?? '84,250'}`, sub: '+14% this week', Icon: DollarSign, color: '#d4af37' },
                { label: "Today's Sales", val: `₹${stats?.todayRevenue?.toLocaleString() ?? '12,480'}`, sub: 'Real-time billing', Icon: TrendingUp, color: '#f59e0b' },
                { label: 'Menu Catalog', val: menuList.length, sub: `${discountsList.length} items on discount`, Icon: UtensilsCrossed, color: '#10b981' },
                { label: 'Operations Fleet', val: staffList.length, sub: 'Chefs & Couriers', Icon: Users, color: '#a78bfa' },
              ].map(({ label, val, sub, Icon, color }) => (
                <div key={label} className="bg-gradient-to-br from-[#16120a] to-[#0f0c07] border border-[#2a2416] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-wider text-[#a8997c]">{label}</span>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-serif font-bold text-[#f8f0e3]">{val}</div>
                  <p className="mt-2 text-xs text-emerald-400">{sub}</p>
                </div>
              ))}
            </div>

            {/* Live Promo Highlights */}
            <div className="bg-[#141008] border border-[#2a2416] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#f8f0e3] flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#d4af37]" /> Active Promotional Campaigns
                  </h3>
                  <p className="text-xs text-[#a8997c]">Dishes currently running with dynamic percentage discounts</p>
                </div>
                <button onClick={() => setActiveTab('discounts')} className="text-xs text-[#d4af37] hover:underline flex items-center gap-1">
                  Manage Discounts <ChevronRight size={14} />
                </button>
              </div>

              {discountsList.length === 0 ? (
                <p className="text-xs text-[#a8997c] py-6 text-center">No active promotional discounts configured.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {discountsList.slice(0, 6).map((d) => (
                    <div key={d.foodItemId} className="bg-[#1a140a] border border-red-500/30 rounded-xl p-3.5 flex items-center gap-3">
                      <img src={d.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'} alt={d.foodItemName} className="w-14 h-14 rounded-lg object-cover border border-[#2a2416]" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#f8f0e3] truncate">{d.foodItemName}</h4>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-sm font-bold text-emerald-400 font-mono">₹{d.sellingPrice}</span>
                          <span className="text-xs text-[#7a6b4e] line-through font-mono">₹{d.originalPrice}</span>
                        </div>
                        <span className="inline-block px-2 py-0.5 mt-1 rounded bg-red-900/30 text-red-300 font-black text-[10px]">
                          {d.discountPercentage}% OFF (Save ₹{d.discountAmount})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: MENU MANAGEMENT ──────────────────────────────── */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141008] border border-[#2a2416] p-4 rounded-2xl">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8997c]" />
                  <input
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Search food by name or category..."
                    className="w-full bg-[#0a0804] border border-[#2a2416] rounded-xl pl-9 pr-3 py-2 text-xs text-[#f8f0e3] focus:border-[#d4af37] outline-none"
                  />
                </div>

                <select
                  value={menuFilterDiscount}
                  onChange={(e) => setMenuFilterDiscount(e.target.value)}
                  className="bg-[#0a0804] border border-[#2a2416] rounded-xl px-3 py-2 text-xs text-[#f8f0e3] focus:border-[#d4af37] outline-none"
                >
                  <option value="all">All Items</option>
                  <option value="discounted">Discounted Only</option>
                  <option value="regular">Regular Price</option>
                </select>
              </div>

              <button
                onClick={() => setItemModal('create')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4af37] text-black text-xs font-bold hover:bg-[#e6c35c] transition-all shadow-lg self-start sm:self-auto"
              >
                <Plus size={16} /> Add New Dish
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenu.map((item) => {
                const hasDisc = item.discountActive && Number(item.discountPercentage) > 0;
                return (
                  <div key={item.id} className="bg-[#141008] border border-[#2a2416] hover:border-[#d4af37]/40 rounded-2xl p-4 flex gap-3.5 transition-all">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#0a0804] border border-[#2a2416] flex-shrink-0">
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.name}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'; }}
                        className="w-full h-full object-cover"
                      />
                      {hasDisc && (
                        <span className="absolute top-1 left-1 bg-red-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded">
                          {item.discountPercentage}% OFF
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-semibold text-sm text-[#f8f0e3] truncate">{item.name}</h4>
                          {(() => {
                            const isItemVeg = item.isVeg !== undefined ? Boolean(item.isVeg) : (item.veg !== undefined ? Boolean(item.veg) : true);
                            return (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                                isItemVeg ? 'bg-green-950/80 text-green-400 border border-green-500/30' : 'bg-red-950/80 text-red-400 border border-red-500/30'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isItemVeg ? 'bg-green-400' : 'bg-red-400'}`} />
                                {isItemVeg ? 'VEG' : 'NON-VEG'}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#a8997c] mt-0.5">
                          <span>{item.categoryName}</span>
                          {item.servingInfo && (
                            <>
                              <span>•</span>
                              <span className="text-[#c9933a] font-medium">{item.servingInfo}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-bold text-base text-[#d4af37] font-mono">₹{item.price}</span>
                          {hasDisc && (
                            <span className="text-xs text-[#7a6b4e] line-through font-mono">₹{item.originalPrice}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-2 border-t border-[#2a2416] mt-2">
                        <button
                          onClick={() => handleToggleMenuAvailability(item)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all ${
                            item.available
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-950/40 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {item.available ? <Eye size={11} /> : <EyeOff size={11} />}
                          {item.available ? 'In Stock' : 'Out of Stock'}
                        </button>

                        <button
                          onClick={() => setDiscountModal(item)}
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-[#2a2416] text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all flex items-center gap-1"
                          title="Quick discount settings"
                        >
                          <Tag size={11} /> % Off
                        </button>

                        <button
                          onClick={() => setItemModal(item)}
                          className="p-1.5 rounded-lg text-[#a8997c] hover:text-[#d4af37] hover:bg-[#2a2416] transition-all ml-auto"
                          title="Edit complete dish"
                        >
                          <Pencil size={13} />
                        </button>

                        <button
                          onClick={() => setDeleteTarget({ type: 'item', id: item.id, name: item.name })}
                          className="p-1.5 rounded-lg text-[#a8997c] hover:text-red-400 hover:bg-red-950/30 transition-all"
                          title="Delete dish"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB: DYNAMIC DISCOUNTS ENGINE ─────────────────────── */}
        {activeTab === 'discounts' && (
          <div className="space-y-6">
            <div className="bg-[#141008] border border-[#2a2416] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#f8f0e3] flex items-center gap-2">
                  <Percent className="w-5 h-5 text-[#d4af37]" /> Dynamic Promotional Offers & Discount Engine
                </h2>
                <p className="text-xs text-[#a8997c] max-w-xl mt-1">
                  Configure real-world percentage discounts for dishes. Selling prices are recalculated automatically with strict zero-floor validation.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('menu')}
                className="btn-primary text-xs py-2.5 px-4 self-start md:self-auto"
              >
                Apply Discounts from Menu Catalog
              </button>
            </div>

            <div className="overflow-x-auto bg-[#141008] border border-[#2a2416] rounded-2xl p-4">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#2a2416] text-xs uppercase tracking-wider text-[#a8997c]">
                    <th className="pb-3">Dish</th>
                    <th className="pb-3">Original MRP</th>
                    <th className="pb-3">Discount %</th>
                    <th className="pb-3">Customer Savings</th>
                    <th className="pb-3">Final Price</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2416]/50">
                  {discountsList.map((d) => (
                    <tr key={d.foodItemId} className="hover:bg-[#1a140a]/60">
                      <td className="py-4 font-medium text-[#f8f0e3] flex items-center gap-3">
                        <img src={d.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <div className="font-semibold">{d.foodItemName}</div>
                          <div className="text-xs text-[#a8997c]">{d.categoryName}</div>
                        </div>
                      </td>
                      <td className="py-4 font-mono text-[#a8997c]">₹{d.originalPrice}</td>
                      <td className="py-4 font-mono font-bold text-red-400">{d.discountPercentage}% OFF</td>
                      <td className="py-4 font-mono text-emerald-400">Save ₹{d.discountAmount}</td>
                      <td className="py-4 font-mono font-bold text-[#d4af37] text-base">₹{d.sellingPrice}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          d.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950 text-amber-400'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => setDiscountModal({ id: d.foodItemId, name: d.foodItemName, originalPrice: d.originalPrice, discountPercentage: d.discountPercentage, discountActive: d.active })}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2a2416] text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all"
                        >
                          Modify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {discountsList.length === 0 && (
                <div className="text-center py-16 text-[#a8997c]">
                  <Percent className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>No active discounts. Select a dish in the Menu tab to set a promotional discount!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: CATEGORIES ──────────────────────────────────── */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#141008] border border-[#2a2416] p-4 rounded-2xl">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#f8f0e3]">Restaurant Menu Categories</h3>
                <p className="text-xs text-[#a8997c]">Group food items for smooth guest browsing</p>
              </div>
              <button
                onClick={() => setCatModal('create')}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((c) => (
                <div key={c.id} className="bg-[#141008] border border-[#2a2416] p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2a2416] flex items-center justify-center text-[#d4af37]">
                      <Tag size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-[#f8f0e3]">{c.name}</h4>
                      <p className="text-xs text-[#a8997c]">{c.itemCount ?? 0} dishes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCatModal(c)} className="p-1.5 text-[#a8997c] hover:text-[#d4af37]">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget({ type: 'cat', id: c.id, name: c.name })} className="p-1.5 text-[#a8997c] hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: ORDERS ───────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="bg-[#141008] border border-[#2a2416] rounded-2xl p-6">
            <h2 className="text-xl font-serif font-bold text-[#f8f0e3] mb-4">Customer Orders & Immutable Historical Snapshots</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#2a2416] text-xs uppercase tracking-wider text-[#a8997c]">
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Dishes</th>
                    <th className="pb-3">Subtotal</th>
                    <th className="pb-3">Discount</th>
                    <th className="pb-3">Grand Total</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2416]/50">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-4 font-mono font-bold text-[#d4af37]">#{o.orderNumber}</td>
                      <td className="py-4 text-xs text-[#f8f0e3]">{o.items?.map((it) => `${it.itemName || it.name} (${it.quantity})`).join(', ')}</td>
                      <td className="py-4 font-mono text-[#a8997c]">₹{o.subtotal || o.totalAmount}</td>
                      <td className="py-4 font-mono text-emerald-400">{o.discountAmount ? `-₹${o.discountAmount}` : '₹0'}</td>
                      <td className="py-4 font-mono font-bold text-[#d4af37]">₹{o.totalAmount}</td>
                      <td className="py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {o.orderStatus || o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: STAFF ────────────────────────────────────────── */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#141008] border border-[#2a2416] p-4 rounded-2xl">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#f8f0e3]">Staff & Delivery Fleet</h3>
                <p className="text-xs text-[#a8997c]">Manage kitchen chefs and couriers (Owner only)</p>
              </div>
              <button onClick={() => setStaffModal('create')} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
                <Plus size={14} /> Add Personnel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffList.map((s) => (
                <div key={s.id} className="bg-[#141008] border border-[#2a2416] rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-[#f8f0e3]">{s.fullName}</h4>
                    <p className="text-xs text-[#a8997c]">{s.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#2a2416] text-[#d4af37]">
                      {s.role}
                    </span>
                  </div>
                  <button onClick={() => setStaffModal(s)} className="p-2 text-[#a8997c] hover:text-[#d4af37]">
                    <Pencil size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {itemModal && (
        <ItemFormModal
          item={itemModal === 'create' ? null : itemModal}
          categories={categories}
          onSave={() => { setItemModal(null); fetchAll(); }}
          onClose={() => setItemModal(null)}
        />
      )}

      {catModal && (
        <CategoryFormModal
          category={catModal === 'create' ? null : catModal}
          onSave={() => { setCatModal(null); fetchAll(); }}
          onClose={() => setCatModal(null)}
        />
      )}

      {discountModal && (
        <DiscountModifierModal
          item={discountModal}
          onSave={() => { setDiscountModal(null); fetchAll(); }}
          onClose={() => setDiscountModal(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          label={deleteTarget.name}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
