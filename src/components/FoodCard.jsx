import { Link } from 'react-router-dom';
import { Star, Clock, Flame, Plus, Heart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

export default function FoodCard({ item, layout = 'grid' }) {
  const [liked, setLiked] = useState(false);
  const { addItem } = useCart();

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      cartId: `${item.id}-quick`,
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      isVeg: item.isVeg,
      quantity: 1,
    });
    toast.custom((t) => (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl glass-gold border border-[#c9933a]/30 shadow-xl transition-all ${t.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <span className="text-lg">🛒</span>
        <span className="text-sm font-medium text-[#f8f0e3]">{item.name} added to cart!</span>
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
        <div className="flex gap-4 p-4 card-dark group cursor-pointer">
          <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover food-img" />
            {item.isBestseller && (
              <span className="absolute top-1 left-1 badge badge-gold text-[0.6rem] px-1.5 py-0.5">Hot</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <VegIndicator isVeg={item.isVeg} />
                  {item.isChefSpecial && <span className="text-[#c9933a] text-xs">★ Chef's Special</span>}
                </div>
                <h3 className="font-medium text-[#f8f0e3] group-hover:text-[#c9933a] transition-colors leading-tight">
                  {item.name}
                </h3>
                <p className="text-xs text-[#7a6b4e] mt-1 line-clamp-2">{item.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div>
                <span className="font-bold text-[#c9933a]">₹{item.price}</span>
                {item.originalPrice && (
                  <span className="text-xs text-[#4a4030] line-through ml-2">₹{item.originalPrice}</span>
                )}
              </div>
              <button
                onClick={handleQuickAdd}
                className="p-2 rounded-xl glass-gold text-[#c9933a] hover:scale-110 transition-transform"
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
    <Link to={`/menu/${item.id}`} className="block">
      <div className="card-dark group cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden rounded-t-[calc(1.25rem-1px)] flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="food-img h-52 w-full"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Badges top-left */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <VegIndicator isVeg={item.isVeg} />
            {item.isSpicy && <Flame size={14} className="text-orange-400" />}
          </div>

          {/* Badges top-right */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
            <button
              onClick={handleLike}
              className="p-1.5 rounded-full glass transition-all hover:scale-110"
            >
              <Heart
                size={14}
                className={liked ? 'fill-red-400 text-red-400' : 'text-white/60'}
              />
            </button>
            {item.isBestseller && (
              <span className="badge badge-gold text-[0.6rem]">Bestseller</span>
            )}
            {item.isChefSpecial && (
              <span className="badge badge-gold text-[0.6rem]">Chef's Special</span>
            )}
          </div>

          {/* Rating bottom */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 glass-gold rounded-full px-2 py-1">
            <Star size={11} className="fill-[#c9933a] text-[#c9933a]" />
            <span className="text-xs font-semibold text-[#e8b96a]">{item.rating}</span>
            <span className="text-[0.65rem] text-[#7a6b4e]">({item.reviews})</span>
          </div>

          {/* Quick add */}
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-3 right-3 p-2 rounded-full glass-gold text-[#c9933a] opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3
            className="font-semibold text-[#f8f0e3] group-hover:text-[#c9933a] transition-colors leading-tight mb-1"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.925rem' }}
          >
            {item.name}
          </h3>
          <p className="text-xs text-[#7a6b4e] line-clamp-2 flex-1 mb-3">
            {item.description}
          </p>

          {/* Cook time & calories */}
          <div className="flex items-center gap-3 text-xs text-[#4a4030] mb-3">
            <span className="flex items-center gap-1">
              <Clock size={11} /> {item.cookTime}
            </span>
            <span>·</span>
            <span>{item.calories} kcal</span>
          </div>

          {/* Price row */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-[#c9933a] text-base">₹{item.price}</span>
              {item.originalPrice && (
                <span className="text-xs text-[#4a4030] line-through ml-1.5">₹{item.originalPrice}</span>
              )}
            </div>
            <button
              onClick={handleQuickAdd}
              className="btn-primary text-xs py-2 px-4 gap-1"
            >
              <Plus size={12} /> Add
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

function VegIndicator({ isVeg }) {
  return (
    <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${isVeg ? 'border-green-500' : 'border-red-500'}`}>
      <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
    </div>
  );
}
