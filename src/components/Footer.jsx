import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Camera, Send, Clock, Flame } from 'lucide-react';
import { RESTAURANT_INFO, CATEGORIES } from '../data/data';

const FOOTER_LINKS = {
  'Quick Links': [
    { label: 'Home', to: '/' },
    { label: 'Menu', to: '/menu' },
    { label: 'Our Story', to: '/story' },
    { label: 'Order Tracking', to: '/track' },
  ],
  'Categories': CATEGORIES.filter(c => c.id !== 'all').slice(0, 5).map(c => ({
    label: c.label,
    to: `/menu?category=${c.id}`,
  })),
  'Account': [
    { label: 'Sign In', to: '/login' },
    { label: 'Register', to: '/register' },
    { label: 'My Orders', to: '/profile' },
    { label: 'Profile', to: '/profile' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ background: '#080605', borderTop: '1px solid #2e2a1e' }}>
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-10"
          style={{ background: 'radial-gradient(ellipse, #c9933a, transparent)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top CTA band */}
        <div className="py-12 border-b border-[#2e2a1e] flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3
              className="font-display text-3xl font-bold text-gold-gradient"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Reserve Your Table
            </h3>
            <p className="text-[#7a6b4e] text-sm mt-1">
              Experience Savoria in person — Monday to Sunday, 12 PM – 11:30 PM
            </p>
          </div>
          <div className="flex gap-3">
            <a href="tel:+919876543210" className="btn-primary whitespace-nowrap">
              <Phone size={15} /> Call to Reserve
            </a>
            <Link to="/menu" className="btn-outline whitespace-nowrap">
              Order Online
            </Link>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🪔</span>
              <div>
                <div
                  className="font-display font-bold text-xl text-gold-gradient leading-tight"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  SAVORIA
                </div>
                <div className="text-[0.6rem] tracking-[0.2em] text-[#7a6b4e] uppercase">
                  Fine Indian Dining
                </div>
              </div>
            </div>
            <p className="text-sm text-[#7a6b4e] leading-relaxed mb-5">
              Where ancient spices meet modern culinary artistry. An orchestrated journey through the flavours of India.
            </p>
            <div className="flex gap-2">
              <a
                href="#"
                className="w-9 h-9 glass rounded-xl flex items-center justify-center text-[#7a6b4e] hover:text-[#c9933a] transition-colors"
              >
                <Camera size={15} />
              </a>
              <a
                href="#"
                className="w-9 h-9 glass rounded-xl flex items-center justify-center text-[#7a6b4e] hover:text-[#c9933a] transition-colors"
              >
                <Send size={15} />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold tracking-widest uppercase text-[#c9933a] mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-[#7a6b4e] hover:text-[#f8f0e3] transition-colors animated-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact info */}
        <div className="py-6 border-t border-[#2e2a1e] grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2.5 text-sm text-[#7a6b4e]">
            <MapPin size={14} className="text-[#c9933a] flex-shrink-0" />
            <span>{RESTAURANT_INFO.address}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-[#7a6b4e]">
            <Clock size={14} className="text-[#c9933a] flex-shrink-0" />
            <span>{RESTAURANT_INFO.hours}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-[#7a6b4e]">
            <Mail size={14} className="text-[#c9933a] flex-shrink-0" />
            <a href={`mailto:${RESTAURANT_INFO.email}`} className="hover:text-[#f8f0e3] transition-colors">
              {RESTAURANT_INFO.email}
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="py-5 border-t border-[#1a1710] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#4a4030]">
          <p>© 2026 Savoria. All rights reserved. Crafted with <Flame size={10} className="inline text-[#c9933a]" /> in Mumbai.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#7a6b4e] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#7a6b4e] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#7a6b4e] transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
