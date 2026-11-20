import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { 
  ArrowLeft, Star, Clock, Flame, Plus, Minus, 
  ShoppingCart, Tag, Sparkles, UtensilsCrossed, Users, CheckCircle2 
} from 'lucide-react';
import { MENU_ITEMS } from '../data/data';
import { menuService } from '../api/services';
import { useCart } from '../contexts/CartContext';
import FoodCard, { VegBadge, VegIndicator } from '../components/FoodCard';
import { getImageUrl, DEFAULT_FOOD_IMAGE } from '../utils/imageUrl';
import toast from 'react-hot-toast';

export default function FoodDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});

  const imgRef = useRef(null);
  const contentRef = useRef(null);

  // Fetch food item details from backend with fallback
  useEffect(() => {
    let isMounted = true;
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await menuService.getMenuItemById(id).catch(() => null);
        if (isMounted) {
          if (res?.data) {
            setItem(res.data);
            setSelectedImage(res.data.imageUrl);
          } else {
            const fallback = MENU_ITEMS.find((i) => i.id === id);
            if (fallback) {
              setItem(fallback);
              setSelectedImage(fallback.image);
            }
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchItem();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    if (!item) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { scale: 1.05, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'power3.out' }
      );
      gsap.fromTo(
        contentRef.current?.children || [],
        { y: 25, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 0.15 }
      );
    });
    return () => ctx.revert();
  }, [id, item]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-[#d4af37]">
        <div className="w-10 h-10 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <UtensilsCrossed size={48} className="text-[#3a3020] mx-auto mb-4" />
          <h2 className="font-display text-2xl text-[#f8f0e3] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Dish Not Found
          </h2>
          <Link to="/menu" className="btn-primary">Back to Menu</Link>
        </div>
      </div>
    );
  }

  // Price & Discount calculations
  const originalPrice = Number(item.originalPrice || item.price || 0);
  const discountPct = Number(item.discountPercentage || 0);
  const hasDiscount = item.discountActive !== false && discountPct > 0 && originalPrice > 0;
  const baseSellingPrice = hasDiscount && item.price !== undefined
    ? Number(item.price)
    : (hasDiscount ? originalPrice - (originalPrice * discountPct) / 100 : originalPrice);

  const unitPrice = baseSellingPrice;
  const totalPrice = unitPrice * quantity;
  const servingPortion = item.servingInfo?.trim() || 'Serves 1-2';
  const isItemVeg = item.isVeg !== undefined ? Boolean(item.isVeg) : (item.veg !== undefined ? Boolean(item.veg) : true);

  const defaultImage = DEFAULT_FOOD_IMAGE;
  const rawMainImage = selectedImage || item.imageUrl || item.image || defaultImage;
  const mainImage = getImageUrl(rawMainImage);
  const allImages = [
    item.imageUrl || item.image,
    ...(item.galleryImages || [])
  ].filter(Boolean).map((img) => getImageUrl(img));

  const handleAddToCart = () => {
    const optionsStr = Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ');
    addItem({
      cartId: `${item.id}-${JSON.stringify(selectedOptions)}`,
      id: item.id,
      name: item.name,
      price: unitPrice,
      originalPrice: originalPrice,
      discountPercentage: hasDiscount ? discountPct : 0,
      image: mainImage,
      isVeg: isItemVeg,
      servingInfo: servingPortion,
      quantity,
      selectedOptions: optionsStr || null,
    });
    toast.custom((t) => (
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl glass-gold border border-[#c9933a]/30 shadow-2xl ${t.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} transition-all`}>
        <ShoppingCart size={20} className="text-[#c9933a]" />
        <div>
          <p className="text-sm font-medium text-[#f8f0e3]">{quantity}× {item.name} added to cart!</p>
          <p className="text-xs text-[#d4af37] font-mono">Total: ₹{totalPrice.toFixed(0)}</p>
        </div>
      </div>
    ), { duration: 2500 });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#0a0804] text-[#f8f0e3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#a8997c] hover:text-[#d4af37] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Menu
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* LEFT: Image Gallery */}
          <div ref={imgRef} className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-[#141008] border border-[#2a2416] shadow-2xl">
              <img
                src={mainImage}
                alt={item.name}
                onError={(e) => { e.target.src = defaultImage; }}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {hasDiscount && (
                  <span className="bg-red-600/95 text-white font-black tracking-wide text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-red-400/40 animate-pulse">
                    <Tag size={12} /> {discountPct}% OFF
                  </span>
                )}
                {item.isBestseller && <span className="badge badge-gold">Bestseller</span>}
                {item.isChefSpecial && (
                  <span className="badge badge-gold flex items-center gap-1">
                    <Sparkles size={11} /> Chef's Special
                  </span>
                )}
              </div>

              <div className="absolute top-4 right-4">
                <VegBadge isVeg={isItemVeg} className="text-xs px-2.5 py-1" />
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      mainImage === img ? 'border-[#d4af37] scale-105 shadow-lg' : 'border-[#2a2416] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Food Details & Customization */}
          <div ref={contentRef} className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2a2416] text-[#d4af37] capitalize">
                  {item.categoryName || item.category || 'Specialty'}
                </span>
                {item.isSpicy && (
                  <span className="flex items-center gap-1 text-xs text-orange-400 font-medium">
                    <Flame size={13} /> Spicy
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#f8f0e3] tracking-wide mb-3">
                {item.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#a8997c]">
                <div className="flex items-center gap-1 text-[#d4af37]">
                  <Star size={14} className="fill-[#d4af37]" />
                  <span className="font-bold text-sm">{item.rating || 4.9}</span>
                  <span className="text-[#a8997c]">({item.reviews || item.reviewCount || 120} reviews)</span>
                </div>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-[#d4af37] font-semibold bg-[#1a140a] border border-[#2a2416] px-2.5 py-1 rounded-lg">
                  <Users size={13} className="text-[#c9933a]" />
                  <span>Portion: {servingPortion}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={13} /> {item.cookTime || '20-25 mins'}
                </span>
                {item.calories && (
                  <>
                    <span>•</span>
                    <span>{item.calories} kcal</span>
                  </>
                )}
              </div>
            </div>

            {/* Dietary Badge Banner */}
            <div className={`flex items-center gap-3 p-3.5 rounded-2xl border ${
              isItemVeg 
                ? 'bg-emerald-950/20 border-emerald-500/30' 
                : 'bg-red-950/20 border-red-500/30'
            }`}>
              <VegBadge isVeg={isItemVeg} className="text-xs px-2.5 py-1" />
              <div className="text-xs">
                <span className="font-bold text-[#f8f0e3]">
                  {isItemVeg ? 'Vegetarian Dish' : 'Non-Vegetarian Dish'}
                </span>
                <p className="text-[#a8997c] mt-0.5">
                  {isItemVeg 
                    ? 'Prepared with fresh plant-based produce in separate vegetarian cookware.' 
                    : 'Cooked with premium quality meats and traditional whole spices.'}
                </p>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-[#141008] border border-[#2a2416] rounded-2xl p-5 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#a8997c]">Price</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl font-serif font-bold text-[#d4af37] font-mono">
                    ₹{unitPrice.toFixed(0)}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-[#7a6b4e] line-through font-mono">
                      ₹{originalPrice.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
              {hasDiscount && (
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30">
                    Save ₹{(originalPrice - unitPrice).toFixed(0)} ({discountPct}% OFF)
                  </span>
                </div>
              )}
            </div>

            {/* Description & Portion */}
            <div className="space-y-2">
              <h3 className="text-sm uppercase tracking-wider text-[#a8997c]">Description</h3>
              <p className="text-sm text-[#f8f0e3]/80 leading-relaxed">
                {item.detailedDescription || item.description}
              </p>
            </div>

            {/* Serving Information Box */}
            <div className="bg-[#16120a] border border-[#2a2416] rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs text-[#a8997c] flex items-center gap-1.5">
                <Users size={14} className="text-[#c9933a]" /> Quantity / Serving Size
              </span>
              <span className="text-xs font-bold text-[#d4af37] font-mono">
                {servingPortion}
              </span>
            </div>

            {/* Quantity & Add to Cart Action */}
            <div className="pt-6 border-t border-[#2a2416] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#f8f0e3]">Quantity</span>
                <div className="flex items-center gap-3 bg-[#141008] border border-[#2a2416] rounded-xl px-3 py-1.5">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-1 text-[#a8997c] hover:text-[#d4af37] transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-mono text-base font-bold text-[#f8f0e3] w-6 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-1 text-[#a8997c] hover:text-[#d4af37] transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-transform"
                >
                  <ShoppingCart size={18} />
                  <span>Add {quantity} to Order • ₹{totalPrice.toFixed(0)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
