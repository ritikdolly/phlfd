// =============================================================
// SAVORIA RESTAURANT — BRAND DATA & CONFIGURATION
// (All product, menu, category, order, and pricing data
// are strictly retrieved dynamically from Spring Boot REST APIs)
// =============================================================

export const RESTAURANT_INFO = {
  name: 'Savoria',
  tagline: 'The Art of Indian Cuisine',
  description: 'Where ancient spices meet modern culinary artistry. Experience India reimagined.',
  phone: '+91 98765 43210',
  email: 'reservations@savoria.in',
  address: '42, Regal Tower, Marine Drive, Mumbai 400001',
  hours: 'Mon–Sun: 6 AM – 11:30 PM',
  instagram: '@savoria_restaurant',
  twitter: '@savoria_india',
};

// Database-driven collections (Empty fallbacks — all populated via Spring Boot APIs)
export const CATEGORIES = [];
export const MENU_ITEMS = [];
export const FEATURED_DISHES = [];
export const BESTSELLERS = [];
export const TESTIMONIALS = [];
export const COUPONS = [];

export const STORY_CHAPTERS = [
  {
    label: 'The Origin',
    title: 'Born from a grandmother\'s kitchen',
    body: 'Our founder, Chef Aryan Malhotra, grew up watching his grandmother transform humble spices into transcendent flavours in a small Mumbai kitchen. Every recipe at Savoria is a tribute to that magic.',
    stat: 'Est. 2019',
  },
  {
    label: 'The Ingredients',
    title: 'Sourced from 14 states across India',
    body: 'Saffron from Pampore, cardamom from Idukki, stone flower from the Western Ghats, kalpasi from Chettinad. We travel India so you taste India.',
    stat: '14 States',
  },
  {
    label: 'The Craft',
    title: 'Where tradition meets technique',
    body: 'Our chefs trained in Paris, Copenhagen, and Tokyo return to apply global technique to ancestral Indian recipes. The result is something unprecedented — authentic in soul, refined in execution.',
    stat: '3 Awards',
  },
];

export const AWARDS = [
  { year: '2025', name: "India's Best New Restaurant", org: 'Times Food Awards' },
  { year: '2025', name: "Chef of the Year — Aryan Malhotra", org: 'GQ India' },
  { year: '2026', name: "Michelin Bib Gourmand", org: 'Michelin Guide India' },
];

export const OFFERS = [
  {
    id: 'o1',
    title: 'Chef\'s Table Experience',
    description: 'Join Chef Aryan for a 6-course curated tasting menu with artisanal pairings.',
    discount: 'Exclusive Tasting',
    validTill: 'Reservations Required',
    badge: 'Experience',
    color: 'from-amber-900/40 to-yellow-900/20',
  },
  {
    id: 'o2',
    title: 'Artisanal Brunch Affair',
    description: 'Weekend culinary spread featuring live tandoor stations and classical music.',
    discount: 'Sat & Sun',
    validTill: '11:00 AM – 3:30 PM',
    badge: 'Signature',
    color: 'from-orange-900/40 to-red-900/20',
  },
];

export const MARQUEE_ITEMS = [
  'Handcrafted Starters',
  'Slow-Cooked Mains & Curries',
  'Royal Dum Biryanis',
  'Clay-Oven Tandoori Breads',
  'Artisanal Saffron Desserts',
  'Refreshing Heritage Coolers',
  'Chef\'s Seasonal Tasting',
  '100% Authentic Indian Spices',
];

export const TAX_RATE = 0.05; // 5% GST
export const DELIVERY_CHARGE = 60;
export const FREE_DELIVERY_ABOVE = 999;
