import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRight, Award } from 'lucide-react';
import { STORY_CHAPTERS, AWARDS } from '../data/data';

gsap.registerPlugin(ScrollTrigger);

export default function StoryPage() {
  const pageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.story-hero-text > *',
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.12, duration: 0.8, ease: 'power3.out', delay: 0.2 }
      );

      // Scroll reveals
      const reveals = document.querySelectorAll('[data-sr]');
      reveals.forEach(el => {
        gsap.fromTo(el,
          { y: 40, autoAlpha: 0 },
          {
            y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          }
        );
      });

      // Parallax chef image
      gsap.to('.chef-img', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: { trigger: '.chef-section', start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen">
      {/* Hero */}
      <div
        className="relative min-h-[60vh] flex items-end overflow-hidden"
        style={{ paddingTop: '100px', paddingBottom: '80px' }}
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1800&q=80"
            alt="Chef"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, rgba(10,8,4,0.9))' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="story-hero-text">
            <div className="section-label mb-4">
              <span className="spice-dot" />
              Our Story
            </div>
            <h1
              className="font-display font-bold text-[#f8f0e3] mb-6"
              style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 1.1 }}
            >
              A Love Letter to<br /><span className="text-gold-gradient">Indian Cuisine</span>
            </h1>
            <p className="text-[#f8f0e3]/70 text-lg max-w-2xl leading-relaxed">
              Savoria was born not just to serve food, but to tell a story — the story of India's 5,000-year culinary legacy, reimagined for the modern table.
            </p>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {STORY_CHAPTERS.map((chapter, i) => (
          <div
            key={i}
            data-sr
            className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-10 items-center mb-24 last:mb-0`}
          >
            <div className="flex-1">
              <p className="text-xs text-[#c9933a] uppercase tracking-widest mb-2">{chapter.label} · {chapter.stat}</p>
              <h2
                className="font-display font-bold text-3xl text-[#f8f0e3] mb-4"
                style={{ fontFamily: 'Playfair Display, serif', lineHeight: 1.2 }}
              >
                {chapter.title}
              </h2>
              <p className="text-[#7a6b4e] leading-relaxed">{chapter.body}</p>
            </div>
            <div className="flex-1 max-w-sm">
              <div className="aspect-square rounded-3xl overflow-hidden">
                <img
                  src={[
                    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=80',
                    'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=700&q=80',
                    'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=700&q=80',
                  ][i]}
                  alt={chapter.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chef Section */}
      <div
        className="chef-section relative py-24 overflow-hidden"
        style={{ background: '#111008' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div data-sr>
              <div className="section-label mb-4">
                <span className="spice-dot" />
                The Artist
              </div>
              <h2
                className="font-display font-bold text-[#f8f0e3] mb-4"
                style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.15 }}
              >
                Chef <span className="text-gold-gradient">Aryan Malhotra</span>
              </h2>
              <p className="text-[#7a6b4e] leading-relaxed mb-4">
                Trained at Le Cordon Bleu Paris and Noma Copenhagen, Chef Aryan returned to India with a singular mission: to give Indian cuisine the fine dining stage it deserves. With 14 years of experience, he blends classical technique with ancestral Indian wisdom.
              </p>
              <p className="text-[#7a6b4e] leading-relaxed mb-6">
                "Every dish on our menu is a conversation between past and present. I want diners to taste India's entire history in a single bite."
              </p>
              <div className="flex flex-wrap gap-3">
                {['Le Cordon Bleu', 'Noma Copenhagen', 'The Oberoi', '14 Years Exp.'].map(tag => (
                  <span key={tag} className="badge badge-gold">{tag}</span>
                ))}
              </div>
            </div>

            <div data-sr className="relative">
              <div className="chef-img rounded-3xl overflow-hidden aspect-[3/4]">
                <img
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&q=80"
                  alt="Chef Aryan"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="absolute -bottom-4 -left-4 glass-gold rounded-3xl p-4"
                data-sr
              >
                <p className="text-xs text-[#7a6b4e] mb-0.5">GQ India</p>
                <p className="font-bold text-[#c9933a]">Chef of the Year 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Awards */}
      <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div data-sr className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl text-[#f8f0e3]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Recognition & Awards
          </h2>
        </div>
        <div data-sr className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {AWARDS.map((award, i) => (
            <div key={i} className="glass-gold rounded-3xl p-6 text-center">
              <Award size={32} className="text-[#c9933a] mx-auto mb-3" />
              <p className="text-xs text-[#7a6b4e] mb-1">{award.year} · {award.org}</p>
              <p className="font-semibold text-[#f8f0e3] text-sm">{award.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 text-center px-4">
        <h2 data-sr className="font-display font-bold text-3xl text-[#f8f0e3] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
          Experience the Story Yourself
        </h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/menu" className="btn-primary">Explore Our Menu <ArrowRight size={15} /></Link>
          <a href="tel:+919876543210" className="btn-outline">Reserve a Table</a>
        </div>
      </div>
    </div>
  );
}
