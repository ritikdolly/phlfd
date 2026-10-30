import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Eye, EyeOff, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(formRef.current.children,
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.6, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) navigate('/');
  };

  const fillDemo = () => {
    setEmail('arjun@example.com');
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex">
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
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, rgba(10,8,4,0.8), rgba(10,8,4,0.5))' }} />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🪔</span>
            <div>
              <div className="font-display font-bold text-xl text-gold-gradient" style={{ fontFamily: 'Playfair Display, serif' }}>SAVORIA</div>
              <div className="text-[0.6rem] tracking-[0.2em] text-[#7a6b4e] uppercase">Fine Indian Dining</div>
            </div>
          </div>
        </div>
        <div className="relative">
          <blockquote className="font-serif italic text-2xl text-[#f8f0e3]/80 leading-relaxed mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            "Great food is the foundation of great happiness."
          </blockquote>
          <p className="text-sm text-[#7a6b4e]">— Auguste Escoffier</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md" ref={formRef}>
          {/* Header */}
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <span className="text-xl">🪔</span>
              <span className="font-display font-bold text-lg text-gold-gradient" style={{ fontFamily: 'Playfair Display, serif' }}>SAVORIA</span>
            </div>
            <h1 className="font-display font-bold text-3xl text-[#f8f0e3] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Welcome back
            </h1>
            <p className="text-[#7a6b4e]">Sign in to your Savoria account</p>
          </div>

          {/* Demo credentials hint */}
          <div
            className="glass-gold rounded-2xl p-4 mb-6 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={fillDemo}
          >
            <p className="text-xs text-[#7a6b4e] mb-1">Demo Account (click to fill)</p>
            <p className="text-sm text-[#c9933a] font-medium">arjun@example.com / password</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-[#7a6b4e] block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-dark"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#7a6b4e] block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-dark pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a6b4e] hover:text-[#f8f0e3]"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-sm py-4 mt-2 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={15} className="animate-spin" /> Signing in...
                </span>
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-sm text-[#7a6b4e] text-center mt-6">
            New to Savoria?{' '}
            <Link to="/register" className="text-[#c9933a] hover:text-[#e8b96a] transition-colors font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
