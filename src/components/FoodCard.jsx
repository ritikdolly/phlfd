import { Link } from 'react-router-dom';
import { Star, Clock, Flame, Plus, Heart, Tag, Sparkles, ShoppingCart, Users } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { getImageUrl, DEFAULT_FOOD_IMAGE } from '../utils/imageUrl';
import toast from 'react-hot-toast';

export function VegIndicator({ isVeg }) {
  const isVegetarian = Boolean(isVeg);
  return (
    <div
      className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center flex-shrink-0 bg-black/70 ${
        isVegetarian ? 'border-emerald-500' : 'border-red-500'
      }`}
      title={isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${isVegetarian ? 'bg-emerald-500' : 'bg-red-500'}`} />
    </div>
  );
}

export function VegBadge({ isVeg, veg, showText = true, className = '' }) {
  const isVegetarian = isVeg !== undefined ? Boolean(isVeg) : (veg !== undefined ? Boolean(veg) : true);
  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold tracking-wider backdrop-blur-md shadow-sm select-none ${
        isVegetarian
          ? 'border-emerald-500/50 bg-emerald-950/80 text-emerald-400 ring-1 ring-emerald-500/20'
          : 'border-red-500/50 bg-red-950/80 text-red-400 ring-1 ring-red-500/20'
      } ${className}`}
      title={isVegetarian ? 'Vegetarian Dish' : 'Non-Vegetarian Dish'}
    >
      <VegIndicator isVeg={isVegetarian} />
      {showText && <span>{isVegetarian ? 'VEG' : 'NON-VEG'}</span>}
    </div>
  );
}

export default function FoodCard({ item, layout = 'grid' }) {
  const [liked, setLiked] = useState(false);
  const { addItem } = useCart();

  // Consistent image URL resolution across client and owner uploads
  const displayImage = getImageUrl(item.imageUrl || item.image || item.img);

  // Robust veg classification checking both isVeg and veg
  const isItemVeg = item.isVeg !== undefined ? Boolean(item.isVeg) : (item.veg !== undefined ? Boolean(item.veg) : true);

  // Real-world dynamic discount computation
  const originalPrice = Number(item.originalPrice || item.price || 0);
  const discountPct = Number(item.discountPercentage || 0);
  const hasDiscount = item.discountActive !== false && discountPct > 0 && originalPrice > 0;
  const sellingPrice = hasDiscount && item.price !== undefined
    ? Number(item.price)
    : (hasDiscount ? originalPrice - (originalPrice * discountPct) / 100 : originalPrice);

  const servingQuantity = item.servingInfo?.trim() || 'Serves 1-2';

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      cartId: `${item.id}-quick`,
      id: item.id,
      name: item.name,
      price: sellingPrice,
      originalPrice: originalPrice,
      discountPercentage: hasDiscount ? discountPct : 0,
      image: displayImage,
      isVeg: isItemVeg,
      servingInfo: servingQuantity,
      quantity: 1,
    });
    toast.custom((t) => (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl glass-gold border border-[#c9933a]/30 shadow-xl transition-all ${t.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <ShoppingCart size={18} className="text-[#c9933a]" />
        <div className="text-left">
          <p className="text-sm font-medium text-[#f8f0e3]">{item.name} added to cart!</p>
          <p className="text-xs text-[#d4af37] font-mono">₹{sellingPrice.toFixed(0)} {hasDiscount && <span className="text-[#a8997c] line-through">₹{originalPrice.toFixed(0)}</span>}</p>
        </div>
      </div>
    ), { duration: 2000 });
  };

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
  };

  if (layout === 'list') {
    return (
      <Link to={`/menu/${item.id}`} className="block">
        <div className="flex gap-4 p-4 card-dark group cursor-pointer hover:border-[#d4af37]/40 transition-all">
          <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-[#16120a]">
            <img
              src={displayImage}
              alt={item.name}
              onError={(e) => { e.target.src = DEFAULT_FOOD_IMAGE; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {hasDiscount && (
              <span className="absolute top-1 left-1 bg-red-600/90 text-white font-bold text-[0.65rem] px-1.5 py-0.5 rounded shadow">
                {discountPct}% OFF
              </span>
            )}
            {item.isBestseller && !hasDiscount && (
              <span className="absolute top-1 left-1 badge badge-gold text-[0.6rem] px-1.5 py-0.5">Hot</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <VegBadge isVeg={isItemVeg} />
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#d4af37] font-semibold bg-[#1a140a] border border-[#2a2416] px-2 py-0.5 rounded">
                    <Users size={11} className="text-[#c9933a]" />
                    <span>{servingQuantity}</span>
                  </span>
                  {item.isChefSpecial && (
                    <span className="inline-flex items-center gap-1 text-[#c9933a] text-xs font-serif">
                      <Sparkles size={11} /> Chef's Special
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-[#f8f0e3] group-hover:text-[#c9933a] transition-colors leading-tight">
                  {item.name}
                </h3>
                <p className="text-xs text-[#7a6b4e] mt-1 line-clamp-2">{item.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-[#c9933a] text-lg font-mono">₹{sellingPrice.toFixed(0)}</span>
                {hasDiscount && (
                  <span className="text-xs text-[#7a6b4e] line-through font-mono">₹{originalPrice.toFixed(0)}</span>
                )}
              </div>
              <button
                onClick={handleQuickAdd}
                className="p-2 rounded-xl glass-gold text-[#c9933a] hover:scale-110 transition-transform"
                title="Add to order"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/menu/${item.id}`} className="block h-full">
      <div className="card-dark group cursor-pointer h-full flex flex-col hover:border-[#d4af37]/40 transition-all duration-300">
        {/* Image wrapper */}
        <div className="relative overflow-hidden rounded-t-[calc(1.25rem-1px)] flex-shrink-0 bg-[#16120a]">
          <img
            src={displayImage}
            alt={item.name}
            onError={(e) => { e.target.src = DEFAULT_FOOD_IMAGE; }}
            className="food-img h-52 w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Badges top-left */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            <div className="flex items-center gap-1.5">
              <VegBadge isVeg={isItemVeg} />
              {item.isSpicy && (
                <span className="bg-orange-950/80 text-orange-400 border border-orange-500/40 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Flame size={11} /> Spicy
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="bg-red-600/95 text-white font-black tracking-wide text-[0.65rem] px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 border border-red-400/40 animate-pulse">
                <Tag size={10} /> {discountPct}% OFF
              </span>
            )}
          </div>

          {/* Badges top-right */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
            <button
              onClick={handleLike}
              className="p-1.5 rounded-full glass transition-all hover:scale-110"
              title="Add to favorites"
            >
              <Heart
                size={14}
                className={liked ? 'fill-red-400 text-red-400' : 'text-white/60'}
              />
            </button>
            {item.isBestseller && (
              <span className="badge badge-gold text-[0.6rem] shadow">Bestseller</span>
            )}
            {item.isChefSpecial && (
              <span className="badge badge-gold text-[0.6rem] shadow flex items-center gap-1">
                <Sparkles size={9} /> Chef's Special
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 glass-gold rounded-full px-2 py-1">
            <Star size={11} className="fill-[#c9933a] text-[#c9933a]" />
            <span className="text-xs font-semibold text-[#e8b96a]">{item.rating || 4.8}</span>
            <span className="text-[0.65rem] text-[#7a6b4e]">({item.reviews || item.reviewCount || 45})</span>
          </div>

          {/* Quick add floating button */}
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-3 right-3 p-2.5 rounded-full glass-gold text-[#c9933a] opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl hover:bg-[#d4af37] hover:text-black"
            title="Quick add to cart"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 justify-between">
          <div>
            <h3
              className="font-semibold text-[#f8f0e3] group-hover:text-[#c9933a] transition-colors leading-tight mb-1"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.925rem' }}
            >
              {item.name}
            </h3>
            <p className="text-xs text-[#7a6b4e] line-clamp-2 mb-3">
              {item.description}
            </p>

            {/* Serving Quantity / Portion, Cook time & tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#a8997c] mb-3">
              <span className="flex items-center gap-1 text-[#d4af37] font-semibold bg-[#16120a] border border-[#2a2416] px-2 py-0.5 rounded-md">
                <Users size={11} className="text-[#c9933a]" />
                <span>{servingQuantity}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} /> {item.cookTime || '20 min'}
              </span>
              {item.calories && (
                <>
                  <span>·</span>
                  <span>{item.calories} kcal</span>
                </>
              )}
            </div>
          </div>

          {/* Price row */}
          <div className="flex items-center justify-between pt-2 border-t border-[#2a2416]">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-[#c9933a] text-lg font-mono">
                  ₹{sellingPrice.toFixed(0)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-[#7a6b4e] line-through font-mono">
                    ₹{originalPrice.toFixed(0)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-[10px] text-emerald-400 font-medium">
                  Save ₹{(originalPrice - sellingPrice).toFixed(0)}
                </p>
              )}
            </div>

            <button
              onClick={handleQuickAdd}
              className="btn-primary text-xs py-2 px-3.5 gap-1.5 flex items-center shadow"
            >
              <Plus size={13} /> Add
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
