import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { Eye, EyeOff, ArrowRight, Loader, Shield, User, ChefHat, Bike, Flame } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        formRef.current.children,
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.6, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success && result.user) {
      const role = result.user.role;
      if (role === 'ROLE_OWNER' || role === 'OWNER') {
        navigate('/owner');
      } else if (role === 'ROLE_STAFF' || role === 'STAFF') {
        navigate('/staff');
      } else if (role === 'ROLE_DELIVERY_MAN' || role === 'DELIVERY_MAN') {
        navigate('/delivery');
      } else {
        const queryParams = new URLSearchParams(location.search);
        const returnTo = queryParams.get('returnTo');
        const dest = returnTo || location.state?.from?.pathname || '/profile';
        navigate(dest);
      }
    }
  };

  const fillQuick = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
  };

  return (
    <div className="min-h-screen flex bg-[#0a0804] text-[#f8f0e3]">
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ width: '45%', background: 'linear-gradient(135deg, #111008, #1a1710)' }}
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom right, rgba(10,8,4,0.85), rgba(10,8,4,0.6))',
            }}
          />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9933a]/15 border border-[#c9933a]/30 flex items-center justify-center text-[#c9933a]">
              <Flame className="w-5 h-5 fill-[#c9933a]/20" />
            </div>
            <div>
              <div
                className="font-display font-bold text-xl text-gold-gradient"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                SAVORIA
              </div>
              <div className="text-[0.6rem] tracking-[0.2em] text-[#7a6b4e] uppercase">
                Fine Indian Dining
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <blockquote
            className="font-serif italic text-2xl text-[#f8f0e3]/80 leading-relaxed mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            "Where authentic royal heritage fuses seamlessly with modern culinary mastery."
          </blockquote>
          <p className="text-sm text-[#7a6b4e]">— Savoria Grand Kitchen</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md" ref={formRef}>
          {/* Header */}
          <div className="mb-6">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#c9933a]/15 border border-[#c9933a]/30 flex items-center justify-center text-[#c9933a]">
                <Flame className="w-4 h-4 fill-[#c9933a]/20" />
              </div>
              <span
                className="font-display font-bold text-lg text-gold-gradient"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                SAVORIA
              </span>
            </div>
            <h1
              className="font-display font-bold text-3xl text-[#f8f0e3] mb-2"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Sign In
            </h1>
            <p className="text-sm text-[#a8997c]">Access your account or role workspace</p>
          </div>

          {/* Quick Role Fill Pills */}
          <div className="mb-6 bg-[#141008] border border-[#2a2416] rounded-2xl p-4">
            <p className="text-xs text-[#a8997c] mb-2 font-semibold uppercase tracking-wider">
              Quick Role Test Logins:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillQuick('owner@savoria.in', 'Owner@123456')}
                className="p-2 rounded-xl bg-[#1e190e] border border-[#d4af37]/30 text-left hover:border-[#d4af37] transition-all flex items-center gap-1.5 text-[#d4af37]"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="font-semibold">Owner</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuick('staff@savoria.in', 'Staff@123456')}
                className="p-2 rounded-xl bg-[#1e190e] border border-amber-500/30 text-left hover:border-amber-400 transition-all flex items-center gap-1.5 text-amber-300"
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span className="font-semibold">Kitchen Staff</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuick('delivery@savoria.in', 'Delivery@123456')}
                className="p-2 rounded-xl bg-[#1e190e] border border-blue-500/30 text-left hover:border-blue-400 transition-all flex items-center gap-1.5 text-blue-300"
              >
                <Bike className="w-3.5 h-3.5" />
                <span className="font-semibold">Courier</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuick('arjun@example.com', 'Customer@123456')}
                className="p-2 rounded-xl bg-[#1e190e] border border-[#2a2416] text-left hover:border-[#d4af37] transition-all flex items-center gap-1.5 text-[#f8f0e3]"
              >
                <User className="w-3.5 h-3.5" />
                <span className="font-semibold">Customer</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-[#a8997c] block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#141008] border border-[#2a2416] rounded-xl px-4 py-3 text-sm focus:border-[#d4af37] outline-none"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#a8997c] block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#141008] border border-[#2a2416] rounded-xl px-4 py-3 pr-10 text-sm focus:border-[#d4af37] outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8997c] hover:text-[#f8f0e3]"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div className="text-right -mt-2">
              <Link
                to="/forgot-password"
                className="text-xs"
                style={{ color: '#7a6b4e' }}
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="rounded-xl p-3 text-xs text-red-400 bg-red-950/40 border border-red-500/30">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#d4af37] text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-[#e6c35c] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={15} className="animate-spin" /> Authenticating...
                </span>
              ) : (
                <>
                  Enter Savoria Portal <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2416]" />
            </div>
            <span className="relative bg-[#0a0804] px-4 text-[11px] text-[#7a6b4e] uppercase tracking-wider font-semibold">
              Or continue with
            </span>
          </div>

          <GoogleSignInButton
            text="Sign in with Google"
            onSuccessRedirect={new URLSearchParams(location.search).get('returnTo') || '/'}
          />

          <p className="text-xs text-[#a8997c] text-center mt-6">
            New to Savoria?{' '}
            <Link to="/register" className="text-[#d4af37] hover:underline font-medium">
              Create customer account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
