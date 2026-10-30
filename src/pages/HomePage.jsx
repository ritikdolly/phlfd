import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Play, Star, ChevronDown, Award, UtensilsCrossed } from 'lucide-react';
import { FEATURED_DISHES, BESTSELLERS, TESTIMONIALS, MARQUEE_ITEMS, OFFERS, AWARDS, STORY_CHAPTERS } from '../data/data';
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
          <span key={i} className="text-sm font-medium tracking-widest text-[#7a6b4e] uppercase">
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
  const testimonialsRef = useRef(null);
  const offersRef = useRef(null);

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
  useSectionReveal(testimonialsRef);
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
              { val: 4.9, label: 'Rating', suffix: '★', isFloat: true },
              { val: 12000, label: 'Happy Diners', suffix: '+' },
              { val: 3, label: 'Awards Won', suffix: '' },
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
          <div className="text-xs font-semibold text-[#f8f0e3]">4.9/5</div>
          <div className="text-[0.6rem] text-[#7a6b4e]">12K+ Reviews</div>
        </div>

        {/* Floating dish */}
        <div className="hero-dish absolute left-8 lg:left-20 bottom-1/3 hidden lg:block">
          <div
            className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#c9933a]/30 shadow-2xl"
            style={{ boxShadow: '0 0 40px rgba(201,147,58,0.2)' }}
          >
            <img src="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&q=80" alt="Dish" className="w-full h-full object-cover" />
          </div>
          <div className="mt-2 text-center">
            <div className="text-xs font-semibold text-[#c9933a]">Butter Chicken</div>
            <div className="text-[0.6rem] text-[#7a6b4e]">Bestseller</div>
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

      {/* ═══ FEATURED DISHES ═══ */}
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

        <div data-reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_DISHES.map(dish => (
            <FoodCard key={dish.id} item={dish} />
          ))}
        </div>
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

      {/* ═══ BESTSELLERS ═══ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="section-label">
              <span className="spice-dot" />
              Most Loved
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
          {BESTSELLERS.slice(0, 6).map(dish => (
            <FoodCard key={dish.id} item={dish} />
          ))}
        </div>
      </section>

      {/* ═══ OFFERS ═══ */}
      <section ref={offersRef} className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div data-reveal className="text-center mb-12">
          <div className="section-label justify-center">
            <span className="spice-dot" />
            Exclusive Offers
            <span className="spice-dot" />
          </div>
          <h2
            className="font-display font-bold text-4xl md:text-5xl text-[#f8f0e3]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Savoria <span className="text-gold-gradient">Specials</span>
          </h2>
        </div>

        <div data-reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {OFFERS.map(offer => (
            <div
              key={offer.id}
              className={`relative rounded-3xl p-6 overflow-hidden border border-[#2e2a1e] bg-gradient-to-br ${offer.color} hover:border-[#c9933a]/30 transition-all hover:translate-y-[-4px] cursor-pointer`}
            >
              <div className="badge badge-gold mb-4">{offer.badge}</div>
              <h3 className="font-display text-xl font-bold text-[#f8f0e3] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                {offer.title}
              </h3>
              <p className="text-sm text-[#7a6b4e] mb-4">{offer.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#c9933a] text-lg">{offer.discount}</p>
                  <p className="text-xs text-[#4a4030]">Valid: {offer.validTill}</p>
                </div>
                {offer.code && (
                  <div className="glass-gold rounded-xl px-3 py-1.5">
                    <p className="text-xs text-[#7a6b4e]">Code</p>
                    <p className="font-mono font-bold text-[#c9933a] text-sm">{offer.code}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section ref={testimonialsRef} className="py-24" style={{ background: '#080605' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="text-center mb-12">
            <div className="section-label justify-center">
              <span className="spice-dot" />
              Testimonials
              <span className="spice-dot" />
            </div>
            <h2
              className="font-display font-bold text-4xl md:text-5xl text-[#f8f0e3]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Voices of Our <span className="text-gold-gradient">Guests</span>
            </h2>
          </div>

          <div data-reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.slice(0, 3).map(t => (
              <div key={t.id} className="glass rounded-3xl p-6 border border-[#2e2a1e] hover:border-[#c9933a]/20 transition-all">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < t.rating ? 'fill-[#c9933a] text-[#c9933a]' : 'text-[#2e2a1e]'} />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-sm text-[#f8f0e3]/80 leading-relaxed mb-5">
                  "{t.text}"
                </p>
                {/* Divider */}
                <div className="border-t border-[#2e2a1e] pt-4 flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-[#c9933a]/20" />
                  <div>
                    <p className="text-sm font-semibold text-[#f8f0e3]">{t.name}</p>
                    <p className="text-xs text-[#7a6b4e]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div data-reveal className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {TESTIMONIALS.slice(3, 5).map(t => (
              <div key={t.id} className="glass rounded-3xl p-6 border border-[#2e2a1e] hover:border-[#c9933a]/20 transition-all">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < t.rating ? 'fill-[#c9933a] text-[#c9933a]' : 'text-[#2e2a1e]'} />
                  ))}
                </div>
                <p className="text-sm text-[#f8f0e3]/80 leading-relaxed mb-4">"{t.text}"</p>
                <div className="border-t border-[#2e2a1e] pt-4 flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-[#c9933a]/20" />
                  <div>
                    <p className="text-sm font-semibold text-[#f8f0e3]">{t.name}</p>
                    <p className="text-xs text-[#7a6b4e]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
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
