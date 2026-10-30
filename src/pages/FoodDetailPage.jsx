import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowLeft, Star, Clock, Flame, Plus, Minus, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react';
import { MENU_ITEMS } from '../data/data';
import { useCart } from '../contexts/CartContext';
import FoodCard from '../components/FoodCard';
import toast from 'react-hot-toast';

export default function FoodDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const item = MENU_ITEMS.find(i => i.id === id);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const defaults = {};
    item?.customizations?.forEach(c => {
      defaults[c.name] = c.default;
    });
    return defaults;
  });
  const [prevId, setPrevId] = useState(id);
  if (prevId !== id) {
    setPrevId(id);
    const defaults = {};
    item?.customizations?.forEach(c => {
      defaults[c.name] = c.default;
    });
    setSelectedOptions(defaults);
    setQuantity(1);
  }
  const [showFullDesc, setShowFullDesc] = useState(false);
  const imgRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!item) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(imgRef.current,
        { scale: 1.08, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.9, ease: 'power3.out' }
      );
      gsap.fromTo(contentRef.current.children,
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
      );
    });
    return () => ctx.revert();
  }, [id, item]);

  if (!item) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🍽️</p>
          <h2 className="font-display text-2xl text-[#7a6b4e] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Dish not found
          </h2>
          <Link to="/menu" className="btn-primary">Back to Menu</Link>
        </div>
      </div>
    );
  }

  const totalPrice = (() => {
    let price = item.price;
    item.customizations.forEach(c => {
      if (c.priceModifier) {
        const idx = c.options.indexOf(selectedOptions[c.name]);
        if (idx >= 0 && c.priceModifier[idx]) {
          price += c.priceModifier[idx];
        }
      }
    });
    return price * quantity;
  })();

  const handleAddToCart = () => {
    const optionsStr = Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ');
    addItem({
      cartId: `${item.id}-${JSON.stringify(selectedOptions)}`,
      id: item.id,
      name: item.name,
      price: Math.round(totalPrice / quantity),
      image: item.image,
      isVeg: item.isVeg,
      quantity,
      selectedOptions: optionsStr || null,
    });
    toast.custom((t) => (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl glass-gold border border-[#c9933a]/30 shadow-xl ${t.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} transition-all`}>
        <span className="text-lg">🛒</span>
        <span className="text-sm font-medium text-[#f8f0e3]">{quantity}× {item.name} added to cart!</span>
      </div>
    ), { duration: 2500 });
  };

  const related = MENU_ITEMS.filter(i => i.category === item.category && i.id !== item.id).slice(0, 4);

  return (
    <div className="min-h-screen pt-20">
      {/* Back */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#7a6b4e] hover:text-[#c9933a] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Menu
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* LEFT — Image */}
          <div ref={imgRef} className="relative">
            <div className="rounded-3xl overflow-hidden aspect-[4/3]">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Badges overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {item.isBestseller && <span className="badge badge-gold">Bestseller</span>}
              {item.isChefSpecial && <span className="badge badge-gold">Chef's Special</span>}
            </div>

            {/* Veg/Non-veg */}
            <div className="absolute top-4 right-4">
              <div className={`w-7 h-7 rounded-md border-2 flex items-center justify-center glass ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                <div className={`w-3.5 h-3.5 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {item.tags.map(tag => (
                <span key={tag} className="badge badge-gold">{tag}</span>
              ))}
            </div>
          </div>

          {/* RIGHT — Details */}
          <div ref={contentRef} className="space-y-6">
            {/* Title & rating */}
            <div>
              <h1
                className="font-display font-bold text-3xl md:text-4xl text-[#f8f0e3] mb-3"
                style={{ fontFamily: 'Playfair Display, serif', lineHeight: '1.15' }}
              >
                {item.name}
              </h1>
              <div className="flex items-center flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1.5 glass-gold rounded-full px-3 py-1.5">
                  <Star size={14} className="fill-[#c9933a] text-[#c9933a]" />
                  <span className="font-semibold text-[#e8b96a]">{item.rating}</span>
                  <span className="text-[#7a6b4e]">({item.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#7a6b4e]">
                  <Clock size={14} /> {item.cookTime}
                </div>
                <div className="text-[#7a6b4e]">{item.calories} kcal</div>
                {item.isSpicy && (
                  <div className="flex items-center gap-1 text-orange-400">
                    <Flame size={14} /> Spicy
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-[#7a6b4e] leading-relaxed text-sm">
                {showFullDesc ? item.description : item.description.slice(0, 150) + (item.description.length > 150 ? '...' : '')}
              </p>
              {item.description.length > 150 && (
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="flex items-center gap-1 text-xs text-[#c9933a] mt-1 hover:opacity-80 transition-opacity"
                >
                  {showFullDesc ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-[#2e2a1e]" />

            {/* Customizations */}
            {item.customizations.length > 0 && (
              <div className="space-y-5">
                <h3 className="font-semibold text-[#f8f0e3] text-sm uppercase tracking-widest">Customize</h3>
                {item.customizations.map(cust => (
                  <div key={cust.name}>
                    <p className="text-xs text-[#7a6b4e] mb-2.5 uppercase tracking-wider">{cust.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {cust.options.map((opt, oi) => (
                        <button
                          key={opt}
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [cust.name]: opt }))}
                          className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                            selectedOptions[cust.name] === opt
                              ? 'bg-[rgba(201,147,58,0.15)] border-[#c9933a] text-[#c9933a]'
                              : 'border-[#2e2a1e] text-[#7a6b4e] hover:border-[#c9933a]/40'
                          }`}
                        >
                          {opt}
                          {cust.priceModifier && cust.priceModifier[oi] > 0 && (
                            <span className="ml-1 text-[#c9933a]">+₹{cust.priceModifier[oi]}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-[#2e2a1e]" />

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-4">
              {/* Quantity */}
              <div className="flex items-center gap-3 glass rounded-2xl px-4 py-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="qty-btn w-8 h-8"
                >
                  <Minus size={14} />
                </button>
                <span className="font-semibold text-lg w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="qty-btn w-8 h-8"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                className="btn-primary flex-1 text-sm py-4"
              >
                <ShoppingCart size={16} />
                Add to Cart · ₹{totalPrice.toLocaleString()}
              </button>
            </div>

            {/* Nutritional info */}
            <div className="glass rounded-2xl p-4">
              <p className="text-xs uppercase tracking-widest text-[#7a6b4e] mb-3">Nutritional Info (approx.)</p>
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { label: 'Calories', val: item.calories },
                  { label: 'Protein', val: '12g' },
                  { label: 'Carbs', val: '28g' },
                  { label: 'Fat', val: '14g' },
                ].map(n => (
                  <div key={n.label} className="p-2 rounded-xl" style={{ background: '#211e14' }}>
                    <p className="font-bold text-[#c9933a] text-sm">{n.val}</p>
                    <p className="text-[0.65rem] text-[#7a6b4e] mt-0.5">{n.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related dishes */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2
              className="font-display font-bold text-2xl text-[#f8f0e3] mb-8"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map(r => (
                <FoodCard key={r.id} item={r} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
