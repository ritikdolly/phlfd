import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Leaf, Flame, Tag, RefreshCw, Sparkles, UtensilsCrossed } from 'lucide-react';
import { menuService } from '../api/services';
import { MENU_ITEMS, CATEGORIES } from '../data/data';
import FoodCard from '../components/FoodCard';

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [vegOnly, setVegOnly] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [layout, setLayout] = useState('grid');

  // Backend state
  const [backendItems, setBackendItems] = useState([]);
  const [backendCategories, setBackendCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load menu & categories
  const fetchMenu = async () => {
    try {
      setLoading(true);
      const [menuRes, catRes] = await Promise.all([
        menuService.getAllMenuItems().catch(() => null),
        menuService.getCategories().catch(() => null),
      ]);

      if (menuRes?.data && Array.isArray(menuRes.data) && menuRes.data.length > 0) {
        setBackendItems(menuRes.data);
      } else {
        setBackendItems(MENU_ITEMS);
      }

      if (catRes?.data && Array.isArray(catRes.data) && catRes.data.length > 0) {
        setBackendCategories(catRes.data);
      } else {
        setBackendCategories(CATEGORIES);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Filter & Sort
  const filteredItems = useMemo(() => {
    let result = [...backendItems];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (i) => i.name?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== 'all') {
      result = result.filter(
        (i) => (i.categorySlug || i.category || '').toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (vegOnly) result = result.filter((i) => (i.isVeg !== undefined ? Boolean(i.isVeg) : (i.veg !== undefined ? Boolean(i.veg) : true)));
    if (nonVegOnly) result = result.filter((i) => !(i.isVeg !== undefined ? Boolean(i.isVeg) : (i.veg !== undefined ? Boolean(i.veg) : true)));
    if (spicyOnly) result = result.filter((i) => i.isSpicy);
    if (discountOnly) {
      result = result.filter((i) => {
        const pct = Number(i.discountPercentage || 0);
        return i.discountActive !== false && pct > 0;
      });
    }
    if (featuredOnly) {
      result = result.filter((i) => i.isChefSpecial || i.isBestseller);
    }

    if (sortBy === 'price-low') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortBy === 'discount') {
      result.sort((a, b) => Number(b.discountPercentage || 0) - Number(a.discountPercentage || 0));
    }

    return result;
  }, [backendItems, query, activeCategory, vegOnly, nonVegOnly, spicyOnly, discountOnly, featuredOnly, sortBy]);

  return (
    <div className="min-h-screen bg-[#0a0804] text-[#f8f0e3] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 text-center space-y-3">
        <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#2a2416] text-[#d4af37] border border-[#d4af37]/30 tracking-widest uppercase">
          Culinary Catalog
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-wide">
          Savoria Restaurant Menu
        </h1>
        <p className="text-sm sm:text-base text-[#a8997c] max-w-2xl mx-auto">
          Explore artisanal dishes crafted with authentic spices, fresh ingredients, and exclusive chef specials.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Search & Quick Controls */}
        <div className="bg-[#141008] border border-[#2a2416] rounded-2xl p-4 sm:p-5 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8997c]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by dish name, spice, or ingredients..."
                className="w-full bg-[#0a0804] border border-[#2a2416] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#f8f0e3] placeholder-[#7a6b4e] focus:border-[#d4af37] outline-none"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
              <button
                onClick={() => { setVegOnly(!vegOnly); if (!vegOnly) setNonVegOnly(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  vegOnly ? 'bg-green-950/70 text-green-300 border-green-500/60 ring-1 ring-green-500/30' : 'bg-[#1a140a] text-[#a8997c] border-[#2a2416] hover:border-green-500/30'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-sm border-2 border-green-500 flex items-center justify-center bg-black/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>
                <span>Veg</span>
              </button>

              <button
                onClick={() => { setNonVegOnly(!nonVegOnly); if (!nonVegOnly) setVegOnly(false); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  nonVegOnly ? 'bg-red-950/70 text-red-300 border-red-500/60 ring-1 ring-red-500/30' : 'bg-[#1a140a] text-[#a8997c] border-[#2a2416] hover:border-red-500/30'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-sm border-2 border-red-500 flex items-center justify-center bg-black/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                </div>
                <span>Non-Veg</span>
              </button>

              <button
                onClick={() => setDiscountOnly(!discountOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  discountOnly ? 'bg-red-950/60 text-red-300 border-red-500/40' : 'bg-[#1a140a] text-[#a8997c] border-[#2a2416]'
                }`}
              >
                <Tag size={13} className={discountOnly ? 'text-red-400' : ''} /> On Offer %
              </button>

              <button
                onClick={() => setFeaturedOnly(!featuredOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  featuredOnly ? 'bg-amber-950/60 text-[#d4af37] border-[#d4af37]/40' : 'bg-[#1a140a] text-[#a8997c] border-[#2a2416]'
                }`}
              >
                <Sparkles size={13} className={featuredOnly ? 'text-[#d4af37]' : ''} /> Chef's Picks
              </button>

              <button
                onClick={() => setSpicyOnly(!spicyOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  spicyOnly ? 'bg-orange-950/60 text-orange-300 border-orange-500/40' : 'bg-[#1a140a] text-[#a8997c] border-[#2a2416]'
                }`}
              >
                <Flame size={13} className={spicyOnly ? 'text-orange-400' : ''} /> Spicy
              </button>

              {/* Sorting */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#1a140a] border border-[#2a2416] rounded-xl px-3 py-1.5 text-xs text-[#f8f0e3] focus:border-[#d4af37] outline-none"
              >
                <option value="default">Sort: Recommended</option>
                <option value="discount">Highest Discount</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>

              <button
                onClick={fetchMenu}
                className="p-2 rounded-xl bg-[#1a140a] border border-[#2a2416] text-[#d4af37] hover:bg-[#d4af37]/10 transition-all"
                title="Refresh Menu"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Categories Bar */}
          <div className="flex gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none border-t border-[#2a2416]">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-medium tracking-wide whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategory === 'all'
                  ? 'bg-[#d4af37] text-black font-semibold shadow'
                  : 'bg-[#1a140a] text-[#a8997c] hover:text-[#f8f0e3] hover:bg-[#2a2416]'
              }`}
            >
              <UtensilsCrossed size={12} />
              <span>All Menu ({backendItems.length})</span>
            </button>
            {backendCategories.map((c) => (
              <button
                key={c.id || c.slug}
                onClick={() => setActiveCategory(c.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-medium tracking-wide whitespace-nowrap transition-all ${
                  activeCategory === c.slug
                    ? 'bg-[#d4af37] text-black font-semibold shadow'
                    : 'bg-[#1a140a] text-[#a8997c] hover:text-[#f8f0e3] hover:bg-[#2a2416]'
                }`}
              >
                {c.icon || ''} {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Food Items Grid */}
        {loading ? (
          <div className="py-24 text-center text-[#d4af37]">
            <RefreshCw size={32} className="animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Loading delicious items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-[#141008] border border-[#2a2416] rounded-2xl py-20 text-center text-[#a8997c]">
            <Search size={40} className="text-[#3a3020] mx-auto mb-3" />
            <h3 className="text-lg font-serif text-[#f8f0e3] mb-1">No Matching Dishes Found</h3>
            <p className="text-xs">Try adjusting your search keywords, category, or discount filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <FoodCard key={item.id} item={item} layout={layout} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
