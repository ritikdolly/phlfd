import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ShoppingCart, Menu, X, User, ChevronDown, LogOut } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import CartDrawer from './CartDrawer';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/story', label: 'Our Story' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navRef = useRef(null);
  const mobileRef = useRef(null);
  const cartBadgeRef = useRef(null);
  const { itemCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Navbar entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(navRef.current,
        { y: -80, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 }
      );
    });
    return () => ctx.revert();
  }, []);

  // Cart badge pulse
  useEffect(() => {
    if (cartBadgeRef.current && itemCount > 0) {
      gsap.fromTo(cartBadgeRef.current,
        { scale: 0 },
        { scale: 1, duration: 0.4, ease: 'back.out(2)' }
      );
    }
  }, [itemCount]);

  // Mobile menu animation
  useEffect(() => {
    if (!mobileRef.current) return;
    if (mobileOpen) {
      gsap.to(mobileRef.current, { x: 0, duration: 0.4, ease: 'power3.out' });
      document.body.style.overflow = 'hidden';
    } else {
      gsap.to(mobileRef.current, { x: '100%', duration: 0.35, ease: 'power3.in' });
      document.body.style.overflow = '';
    }
  }, [mobileOpen]);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-[500] transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(10,8,4,0.95)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(46,42,30,0.8)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <span className="text-2xl" style={{ filter: 'drop-shadow(0 0 8px rgba(201,147,58,0.6))' }}>🪔</span>
              <div>
                <div
                  className="font-display font-bold text-xl leading-tight text-gold-gradient"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  SAVORIA
                </div>
                <div className="text-[0.6rem] tracking-[0.2em] text-[#7a6b4e] uppercase leading-none">
                  Fine Indian Dining
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `animated-underline text-sm font-medium tracking-wide transition-colors duration-200 ${
                      isActive ? 'text-[#c9933a]' : 'text-[#f8f0e3]/80 hover:text-[#c9933a]'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <Link to="/menu" className="btn-primary text-xs py-2.5 px-5">
                Order Now
              </Link>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-3">
              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-full glass-gold transition-all hover:scale-105"
                aria-label="Open cart"
              >
                <ShoppingCart size={18} className="text-[#c9933a]" />
                {itemCount > 0 && (
                  <span
                    ref={cartBadgeRef}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[0.65rem] font-bold flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #c9933a, #e8b96a)', color: '#0a0804' }}
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* Profile */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="hidden md:flex items-center gap-2 p-2 rounded-full glass transition-all hover:bg-white/8"
                  >
                    <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                    <ChevronDown size={14} className="text-[#7a6b4e]" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-12 w-52 glass rounded-2xl border border-[#2e2a1e] overflow-hidden shadow-2xl">
                      <div className="p-3 border-b border-[#2e2a1e]">
                        <p className="text-sm font-semibold text-[#f8f0e3]">{user.name}</p>
                        <p className="text-xs text-[#7a6b4e]">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-[#f8f0e3]/80 hover:text-[#c9933a] hover:bg-white/4 rounded-xl transition-colors">
                          <User size={14} /> Profile & Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-1.5 text-sm text-[#f8f0e3]/70 hover:text-[#c9933a] transition-colors"
                >
                  <User size={16} /> Sign In
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2.5 rounded-full glass transition-all"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[480] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Nav Drawer */}
      <div ref={mobileRef} className="mobile-nav md:hidden" style={{ transform: 'translateX(100%)' }}>
        <div className="flex items-center justify-between mb-8">
          <span className="font-display font-bold text-xl text-gold-gradient" style={{ fontFamily: 'Playfair Display, serif' }}>
            SAVORIA
          </span>
          <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full glass">
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-2 mb-8">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                  isActive
                    ? 'bg-[rgba(201,147,58,0.12)] text-[#c9933a]'
                    : 'text-[#f8f0e3]/80 hover:bg-white/4'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-3 mt-auto">
          <Link to="/menu" className="btn-primary w-full text-center">
            Order Now
          </Link>
          {isAuthenticated ? (
            <div>
              <div className="flex items-center gap-3 px-4 py-3 glass rounded-xl mb-2">
                <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-[#7a6b4e]">{user.email}</p>
                </div>
              </div>
              <Link to="/profile" className="btn-ghost w-full text-center">Profile</Link>
              <button onClick={handleLogout} className="btn-ghost w-full text-center text-red-400">Sign Out</button>
            </div>
          ) : (
            <Link to="/login" className="btn-outline w-full text-center">Sign In</Link>
          )}
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
