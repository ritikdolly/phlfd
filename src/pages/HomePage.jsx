import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ArrowRight, Play, Star, ChevronDown, Award, UtensilsCrossed, 
  Sparkles, Clock, Wine, HeartHandshake, ShieldCheck 
} from 'lucide-react';
import { MARQUEE_ITEMS, OFFERS, AWARDS, STORY_CHAPTERS } from '../data/data';
import { menuService } from '../api/services';
import FoodCard from '../components/FoodCard';

gsap.registerPlugin(ScrollTrigger);

// Marquee component
function Marquee({ items, direction = 1, speed = 30 }) {
  const trackRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const el = trackRef.current;
      if (!el) return;
      const clone = el.cloneNode(true);
      el.parentNode.appendChild(clone);
      gsap.to([el, clone], {
        xPercent: direction * -100,
        repeat: -1,
        duration: items.length * speed / 10,
        ease: 'none',
      });
    });
    return () => ctx.revert();
  }, [items, direction, speed]);

  return (
    <div className="overflow-hidden whitespace-nowrap py-4">
      <div ref={trackRef} className="inline-flex gap-8">
        {items.map((item, i) => (
          <span key={i} className="text-sm font-medium tracking-widest text-[#7a6b4e] uppercase flex items-center gap-2">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// Section reveal hook
function useSectionReveal(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      const elements = ref.current.querySelectorAll('[data-reveal]');
      elements.forEach((el) => {
        gsap.fromTo(el,
          { y: 50, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, [ref]);
}

export default function HomePage() {
  const heroRef = useRef(null);
  const featuredRef = useRef(null);
  const storyRef = useRef(null);
  const diningExpRef = useRef(null);
  const offersRef = useRef(null);

  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [bestsellerDishes, setBestsellerDishes] = useState([]);
  const [loadingDishes, setLoadingDishes] = useState(true);

  // Fetch real menu data from Spring Boot REST APIs
  useEffect(() => {
    const fetchHomeMenu = async () => {
      try {
        setLoadingDishes(true);
        const [featuredRes, allRes] = await Promise.all([
          menuService.getFeaturedItems().catch(() => ({ data: [] })),
          menuService.getAllItems().catch(() => ({ data: [] })),
        ]);

        const featured = featuredRes?.data || [];
        const allItems = allRes?.data || [];

        setFeaturedDishes(featured.length > 0 ? featured : allItems.slice(0, 6));
        setBestsellerDishes(allItems.filter((item) => item.isBestseller).slice(0, 6));
      } catch (err) {
        console.warn('Notice: Home menu loaded with default database state', err.message);
      } finally {
        setLoadingDishes(false);
      }
    };

    fetchHomeMenu();
  }, []);

  // Hero animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });
      tl.fromTo('.hero-eyebrow', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' })
        .fromTo('.hero-line-1', { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out' }, '-=0.4')
        .fromTo('.hero-line-2', { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out' }, '-=0.7')
        .fromTo('.hero-subtitle', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, '-=0.5')
        .fromTo('.hero-cta', { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power2.out', stagger: 0.1 }, '-=0.4')
        .fromTo('.hero-scroll', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, '-=0.2');

      // Floating dish animation
      gsap.to('.hero-dish', {
        y: -15,
        repeat: -1,
        yoyo: true,
        duration: 3,
        ease: 'sine.inOut',
      });

      // Parallax on scroll
      gsap.to('.hero-bg-img', {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Award badges
      gsap.fromTo('.hero-badge',
        { scale: 0, autoAlpha: 0 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.5,
          ease: 'back.out(2)',
          stagger: 0.15,
          delay: 1.5,
        }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // Section scroll reveals
  useSectionReveal(featuredRef);
  useSectionReveal(storyRef);
  useSectionReveal(diningExpRef);
  useSectionReveal(offersRef);

  // Stats counter animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      const stats = document.querySelectorAll('[data-count]');
      stats.forEach(el => {
        const target = parseFloat(el.dataset.count);
        if (isNaN(target)) return;
        const countObj = { val: 0 };
        gsap.to(countObj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onUpdate: () => {
            el.textContent = Number.isInteger(target)
              ? Math.floor(countObj.val).toLocaleString()
              : countObj.val.toFixed(1);
          },
        });
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* ═══ HERO SECTION ═══ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image with parallax */}
        <div className="hero-bg-img absolute inset-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1800&q=80"
            alt="Restaurant ambiance"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,8,4,0.4) 0%, rgba(10,8,4,0.6) 50%, rgba(10,8,4,0.95) 100%)' }} />
        </div>

        {/* Decorative rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[300, 500, 700].map((size, i) => (
            <div
              key={i}
              className="absolute border border-[#c9933a] rounded-full"
              style={{
                width: size,
                height: size,
                opacity: 0.04 - i * 0.01,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col items-center text-center">
          {/* Eyebrow */}
          <div className="hero-eyebrow section-label mb-6">
            <span className="spice-dot" />
            <span>Mumbai's Premier Fine Dining</span>
            <span className="spice-dot" />
          </div>

          {/* Title */}
          <div className="overflow-hidden mb-2">
            <h1 className="hero-title hero-line-1 text-cream-gradient">
              Where Spice
            </h1>
          </div>
          <div className="overflow-hidden mb-6">
            <h1 className="hero-title hero-line-2 text-gold-gradient">
              Meets Soul
            </h1>
          </div>

          {/* Subtitle */}
          <p className="hero-subtitle text-[#f8f0e3]/70 text-lg max-w-xl leading-relaxed mb-10">
            Experience India reimagined — where ancestral recipes meet modern culinary artistry in an unforgettable fine dining journey.
          </p>

          {/* CTAs */}
          <div className="hero-cta flex flex-col sm:flex-row gap-4 mb-16">
            <Link to="/menu" className="btn-primary text-sm py-4 px-8">
              Explore the Menu <ArrowRight size={16} />
            </Link>
            <Link to="/story" className="btn-outline text-sm py-4 px-8">
              <Play size={14} className="fill-current" />
              Our Story
            </Link>
          </div>

          {/* Hero stats */}
          <div className="hero-cta flex items-center gap-8 text-center">
            {[
              { val: 4.9, label: 'Patron Rating', suffix: ' / 5', isFloat: true },
              { val: 12000, label: 'Feasts Served', suffix: '+' },
              { val: 3, label: 'Culinary Honors', suffix: '' },
            ].map(({ val, label, suffix, isFloat }) => (
              <div key={label} className="px-6 border-r border-[#2e2a1e] last:border-0">
                <div className="font-display text-2xl font-bold text-[#c9933a]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <span data-count={val}>{isFloat ? val.toFixed(1) : val.toLocaleString()}</span>
                  {suffix}
                </div>
                <div className="text-xs text-[#7a6b4e] uppercase tracking-widest mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Award badges floating */}
        <div className="hero-badge absolute top-32 right-8 lg:right-16 glass-gold rounded-2xl p-3 text-center hidden lg:block">
          <Award size={20} className="text-[#c9933a] mx-auto mb-1" />
          <div className="text-xs font-semibold text-[#e8b96a]">Michelin</div>
          <div className="text-[0.6rem] text-[#7a6b4e]">Bib Gourmand</div>
        </div>
        <div className="hero-badge absolute bottom-40 right-8 lg:right-20 glass rounded-2xl p-3 text-center hidden lg:block">
          <Star size={20} className="text-[#c9933a] mx-auto mb-1 fill-current" />
          <div className="text-xs font-semibold text-[#f8f0e3]">4.9 / 5.0</div>
          <div className="text-[0.6rem] text-[#7a6b4e]">Verified Reviews</div>
        </div>

        {/* Floating signature presentation */}
        <div className="hero-dish absolute left-8 lg:left-20 bottom-1/3 hidden lg:block">
          <div
            className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#c9933a]/30 shadow-2xl"
            style={{ boxShadow: '0 0 40px rgba(201,147,58,0.2)' }}
          >
            <img src="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&q=80" alt="Dish" className="w-full h-full object-cover" />
          </div>
          <div className="mt-2 text-center">
            <div className="text-xs font-semibold text-[#c9933a]">Artisanal Curry</div>
            <div className="text-[0.6rem] text-[#7a6b4e]">Master Kitchen</div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[0.65rem] tracking-widest uppercase text-[#7a6b4e]">Scroll</span>
          <ChevronDown size={16} className="text-[#c9933a] animate-bounce" />
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <div className="border-y border-[#2e2a1e]">
        <Marquee items={MARQUEE_ITEMS} />
      </div>

      {/* ═══ FEATURED DISHES (DATABASE-DRIVEN) ═══ */}
      <section ref={featuredRef} className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div data-reveal className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="section-label">
              <span className="spice-dot" />
              Chef's Recommendations
            </div>
            <h2
              className="font-display font-bold text-4xl md:text-5xl text-[#f8f0e3]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Signature
              <span className="block text-gold-gradient">Masterpieces</span>
            </h2>
          </div>
          <Link to="/menu" className="btn-outline flex-shrink-0">
            View Full Menu <ArrowRight size={15} />
          </Link>
        </div>

        {loadingDishes ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-[#141008] border border-[#2a2416] rounded-2xl h-80 animate-pulse p-4">
                <div className="w-full h-44 bg-[#2a2416] rounded-xl mb-4" />
                <div className="h-4 bg-[#2a2416] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#2a2416] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : featuredDishes.length > 0 ? (
          <div data-reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDishes.map((dish) => (
              <FoodCard key={dish.id} item={dish} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#141008] border border-[#2a2416] rounded-3xl">
            <UtensilsCrossed size={48} className="text-[#3a3020] mx-auto mb-4" />
            <h3 className="font-serif font-bold text-lg text-[#f8f0e3] mb-1">
              Curating Seasonal Specialties
            </h3>
            <p className="text-sm text-[#7a6b4e] max-w-md mx-auto mb-6">
              Our culinary team is currently refining today's signature preparations. Browse our full carte du jour.
            </p>
            <Link to="/menu" className="btn-primary text-xs py-3 px-6">
              Browse Entire Menu
            </Link>
          </div>
        )}
      </section>

      {/* ═══ STORY SECTION ═══ */}
      <section ref={storyRef} className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1800&q=80"
            alt="Kitchen"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #0a0804 40%, transparent 100%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div data-reveal className="section-label mb-4">
              <span className="spice-dot" />
              The Savoria Story
            </div>
            <h2
              data-reveal
              className="font-display font-bold text-4xl md:text-5xl text-[#f8f0e3] leading-tight mb-8"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              A Journey Through
              <span className="block text-gold-gradient">14 States of India</span>
            </h2>

            <div className="space-y-8">
              {STORY_CHAPTERS.map((chapter, i) => (
                <div key={i} data-reveal className="flex gap-5">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full glass-gold flex items-center justify-center text-xs font-bold text-[#c9933a]">
                      {i + 1}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#c9933a] mb-1">{chapter.label} · {chapter.stat}</p>
                    <h3 className="font-display text-xl font-semibold text-[#f8f0e3] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {chapter.title}
                    </h3>
                    <p className="text-sm text-[#7a6b4e] leading-relaxed">{chapter.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div data-reveal className="mt-10">
              <Link to="/story" className="btn-primary">
                Read Our Full Story <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* Awards panel */}
        <div data-reveal className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {AWARDS.map((award, i) => (
              <div key={i} className="glass-gold rounded-2xl p-5 flex items-center gap-4">
                <Award size={28} className="text-[#c9933a] flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#7a6b4e] mb-0.5">{award.year} · {award.org}</p>
                  <p className="text-sm font-semibold text-[#f8f0e3]">{award.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BESTSELLERS (DATABASE-DRIVEN) ═══ */}
      {bestsellerDishes.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#2a2416]/50">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="section-label">
                <span className="spice-dot" />
                Patron Favorites
              </div>
              <h2
                className="font-display font-bold text-4xl md:text-5xl text-[#f8f0e3]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Our Bestsellers
              </h2>
            </div>
            <Link to="/menu" className="btn-outline flex-shrink-0">
              Order Now <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestsellerDishes.map((dish) => (
              <FoodCard key={dish.id} item={dish} />
            ))}
          </div>
        </section>
      )}

      {/* ═══ CURATED EXPERIENCES & OFFERS ═══ */}
      <section ref={offersRef} className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div data-reveal className="text-center mb-12">
          <div className="section-label justify-center">
            <span className="spice-dot" />
            Curated Experiences
            <span className="spice-dot" />
          </div>
          <h2
            className="font-display font-bold text-4xl md:text-5xl text-[#f8f0e3]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Savoria <span className="text-gold-gradient">Happenings</span>
          </h2>
        </div>

        <div data-reveal className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {OFFERS.map((offer) => (
            <div
              key={offer.id}
              className={`relative rounded-3xl p-8 overflow-hidden border border-[#2e2a1e] bg-gradient-to-br ${offer.color} hover:border-[#c9933a]/30 transition-all hover:translate-y-[-4px]`}
            >
              <div className="badge badge-gold mb-4">{offer.badge}</div>
              <h3 className="font-display text-2xl font-bold text-[#f8f0e3] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                {offer.title}
              </h3>
              <p className="text-sm text-[#a8997c] mb-6 leading-relaxed">{offer.description}</p>
              <div className="flex items-center justify-between border-t border-[#2e2a1e]/60 pt-4">
                <div>
                  <p className="font-bold text-[#c9933a] text-lg">{offer.discount}</p>
                  <p className="text-xs text-[#7a6b4e]">{offer.validTill}</p>
                </div>
                <Link to="/menu" className="btn-outline text-xs py-2 px-4">
                  Experience
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ THE DINING AMBIANCE (ELEGANT REAL EXPERIENCE) ═══ */}
      <section ref={diningExpRef} className="py-24" style={{ background: '#080605' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="text-center mb-16">
            <div className="section-label justify-center">
              <span className="spice-dot" />
              Gastronomic Artistry
              <span className="spice-dot" />
            </div>
            <h2
              className="font-display font-bold text-4xl md:text-5xl text-[#f8f0e3]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              The Savoria <span className="text-gold-gradient">Standards</span>
            </h2>
          </div>

          <div data-reveal className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass rounded-3xl p-8 border border-[#2e2a1e] hover:border-[#c9933a]/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#c9933a]/10 flex items-center justify-center text-[#c9933a] mb-6">
                <Wine size={24} />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#f8f0e3] mb-2">Heritage Cellar & Spirits</h3>
              <p className="text-sm text-[#7a6b4e] leading-relaxed">
                Expertly paired beverage programs curated to balance delicate smoke, rich saffron, and pungent roasted spices.
              </p>
            </div>

            <div className="glass rounded-3xl p-8 border border-[#2e2a1e] hover:border-[#c9933a]/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#c9933a]/10 flex items-center justify-center text-[#c9933a] mb-6">
                <Sparkles size={24} />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#f8f0e3] mb-2">Charcoal Clay Ovens</h3>
              <p className="text-sm text-[#7a6b4e] leading-relaxed">
                Tandoors fired with select hardwoods reaching 900°F to guarantee authentic char and smoky depth on every skewer.
              </p>
            </div>

            <div className="glass rounded-3xl p-8 border border-[#2e2a1e] hover:border-[#c9933a]/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#c9933a]/10 flex items-center justify-center text-[#c9933a] mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#f8f0e3] mb-2">Ethically Sourced Harvest</h3>
              <p className="text-sm text-[#7a6b4e] leading-relaxed">
                Every pinch of Kashmiri saffron, Malabar pepper, and organic dairy is directly sourced from multi-generational farming families.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1800&q=80"
            alt="Restaurant"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,8,4,0.6), rgba(10,8,4,0.9))' }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <UtensilsCrossed size={40} className="text-[#c9933a] mx-auto mb-6" />
          <h2
            className="font-display font-bold text-4xl md:text-5xl text-[#f8f0e3] mb-6"
            style={{ fontFamily: 'Playfair Display, serif', lineHeight: '1.1' }}
          >
            Ready to Experience <span className="text-gold-gradient">Savoria?</span>
          </h2>
          <p className="text-[#7a6b4e] text-lg mb-8">
            Order online for delivery or dine in. Each dish is prepared with intention, love, and the finest ingredients.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/menu" className="btn-primary text-sm py-4 px-10">
              Order Now <ArrowRight size={15} />
            </Link>
            <a href="tel:+919876543210" className="btn-outline text-sm py-4 px-10">
              Reserve a Table
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
