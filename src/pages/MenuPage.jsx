import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { Search, Grid, List, X, Leaf, Flame, ChevronDown } from 'lucide-react';
import { MENU_ITEMS, CATEGORIES } from '../data/data';
import FoodCard from '../components/FoodCard';

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [vegOnly, setVegOnly] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [layout, setLayout] = useState('grid');
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  // Header animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { y: -30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 }
      );
    });
    return () => ctx.revert();
  }, []);

  // Grid animation on filter change
  const animateGrid = () => {
    if (!gridRef.current) return;
    gsap.fromTo(gridRef.current.children,
      { y: 20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.04, ease: 'power2.out' }
    );
  };

  const filteredItems = useMemo(() => {
    let items = MENU_ITEMS;
    if (activeCategory !== 'all') items = items.filter(i => i.category === activeCategory);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (vegOnly) items = items.filter(i => i.isVeg);
    if (spicyOnly) items = items.filter(i => i.isSpicy);
    if (sortBy === 'price-asc') items = [...items].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') items = [...items].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') items = [...items].sort((a, b) => b.rating - a.rating);
    if (sortBy === 'popular') items = [...items].sort((a, b) => b.reviews - a.reviews);
    return items;
  }, [activeCategory, query, vegOnly, spicyOnly, sortBy]);

  useEffect(() => {
    animateGrid();
  }, [filteredItems]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setSearchParams(catId === 'all' ? {} : { category: catId });
  };

  const clearFilters = () => {
    setQuery('');
    setActiveCategory('all');
    setVegOnly(false);
    setSpicyOnly(false);
    setSortBy('default');
    setSearchParams({});
  };

  const hasFilters = query || activeCategory !== 'all' || vegOnly || spicyOnly || sortBy !== 'default';

  return (
    <div className="min-h-screen pt-20">
      {/* Page Header */}
      <div
        ref={headerRef}
        className="relative py-16 overflow-hidden"
        style={{ background: 'linear-gradient(to bottom, #111008, #0a0804)' }}
      >
        <div className="absolute inset-0">
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(201,147,58,0.3), transparent)' }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="section-label justify-center mb-4">
            <span className="spice-dot" />
            Our Menu
            <span className="spice-dot" />
          </div>
          <h1
            className="font-display font-bold text-4xl md:text-6xl text-[#f8f0e3] mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            The <span className="text-gold-gradient">Savoria</span> Collection
          </h1>
          <p className="text-[#7a6b4e] text-lg max-w-xl mx-auto">
            {MENU_ITEMS.length} dishes crafted with the finest ingredients from across India
          </p>
        </div>
      </div>

      {/* Sticky filters */}
      <div
        className="sticky top-[72px] z-40 border-b border-[#2e2a1e]"
        style={{ background: 'rgba(10,8,4,0.95)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search + Controls row */}
          <div className="flex gap-3 items-center mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a6b4e]" />
              <input
                type="text"
                placeholder="Search dishes, ingredients..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="input-dark pl-10 pr-10 py-3 text-sm"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a6b4e] hover:text-[#f8f0e3]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="input-dark text-sm py-3 pl-4 pr-8 appearance-none cursor-pointer"
                style={{ backgroundImage: 'none', minWidth: '140px' }}
              >
                <option value="default">Sort: Default</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
                <option value="price-asc">Price: Low–High</option>
                <option value="price-desc">Price: High–Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a6b4e] pointer-events-none" />
            </div>

            {/* Layout toggle */}
            <div className="hidden md:flex glass rounded-xl overflow-hidden">
              <button
                onClick={() => setLayout('grid')}
                className={`p-2.5 transition-colors ${layout === 'grid' ? 'bg-[rgba(201,147,58,0.15)] text-[#c9933a]' : 'text-[#7a6b4e] hover:text-[#f8f0e3]'}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setLayout('list')}
                className={`p-2.5 transition-colors ${layout === 'list' ? 'bg-[rgba(201,147,58,0.15)] text-[#c9933a]' : 'text-[#7a6b4e] hover:text-[#f8f0e3]'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Categories + Quick filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 horizontal-scroll">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                  activeCategory === cat.id
                    ? `${cat.colorClass} scale-105`
                    : 'border-[#2e2a1e] text-[#7a6b4e] hover:border-[#c9933a]/30 hover:text-[#f8f0e3]'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}

            <div className="w-px h-6 bg-[#2e2a1e] mx-1 flex-shrink-0" />

            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                vegOnly
                  ? 'bg-green-500/15 text-green-400 border-green-500/30'
                  : 'border-[#2e2a1e] text-[#7a6b4e] hover:border-green-500/30'
              }`}
            >
              <Leaf size={12} /> Veg Only
            </button>

            <button
              onClick={() => setSpicyOnly(!spicyOnly)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                spicyOnly
                  ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                  : 'border-[#2e2a1e] text-[#7a6b4e] hover:border-orange-500/30'
              }`}
            >
              <Flame size={12} /> Spicy
            </button>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 rounded-full text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 whitespace-nowrap transition-colors"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[#7a6b4e]">
            {filteredItems.length === 0 ? 'No dishes found' : `${filteredItems.length} dish${filteredItems.length !== 1 ? 'es' : ''}`}
            {activeCategory !== 'all' && (
              <span className="ml-1">in <span className="text-[#c9933a]">{CATEGORIES.find(c => c.id === activeCategory)?.label}</span></span>
            )}
          </p>
          {hasFilters && (
            <span className="badge badge-gold">Filtered</span>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-display text-2xl text-[#7a6b4e] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              No dishes found
            </h3>
            <p className="text-sm text-[#4a4030] mb-6">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
          </div>
        ) : (
          <div
            ref={gridRef}
            className={
              layout === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                : 'grid grid-cols-1 md:grid-cols-2 gap-4'
            }
          >
            {filteredItems.map(item => (
              <FoodCard key={item.id} item={item} layout={layout} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
