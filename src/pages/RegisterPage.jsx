import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { Eye, EyeOff, ArrowRight, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const STRENGTH_LEVELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['#4a4030', '#ef4444', '#f97316', '#eab308', '#22c55e'];

function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const strength = getPasswordStrength(form.password);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(formRef.current.children,
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.07, duration: 0.6, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return;
    const result = await register(form);
    if (result.success) navigate('/');
  };

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ width: '45%', background: 'linear-gradient(135deg, #111008, #1a1710)' }}
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600891964092-4316c288032e?w=900&q=80"
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
        <div className="relative space-y-6">
          {[
            { icon: '🎁', text: '20% off your first order' },
            { icon: '📦', text: 'Track orders in real-time' },
            { icon: '⭐', text: 'Exclusive member offers' },
            { icon: '🛵', text: 'Fast 30-minute delivery' },
          ].map(perk => (
            <div key={perk.icon} className="flex items-center gap-3">
              <span className="text-2xl">{perk.icon}</span>
              <span className="text-[#f8f0e3]/80 text-sm">{perk.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-start justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8" ref={formRef}>
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <span className="text-xl">🪔</span>
              <span className="font-display font-bold text-lg text-gold-gradient" style={{ fontFamily: 'Playfair Display, serif' }}>SAVORIA</span>
            </div>
            <h1 className="font-display font-bold text-3xl text-[#f8f0e3] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Join Savoria
            </h1>
            <p className="text-[#7a6b4e]">Create your account and start ordering</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-[#7a6b4e] block mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                className="input-dark"
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#7a6b4e] block mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                className="input-dark"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#7a6b4e] block mb-1.5">Phone (optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                className="input-dark"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#7a6b4e] block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  className="input-dark pr-10"
                  placeholder="Minimum 8 characters"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a6b4e] hover:text-[#f8f0e3]">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength indicator */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all"
                        style={{ background: i < strength ? STRENGTH_COLORS[strength] : '#2e2a1e' }}
                      />
                    ))}
                  </div>
                  <p className="text-xs mt-1" style={{ color: STRENGTH_COLORS[strength] }}>
                    {STRENGTH_LEVELS[strength]}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-[#7a6b4e] block mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={form.confirm}
                  onChange={e => update('confirm', e.target.value)}
                  className="input-dark pr-10"
                  placeholder="Repeat password"
                  required
                />
                {form.confirm && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${form.password === form.confirm ? 'text-green-400' : 'text-red-400'}`}>
                    {form.password === form.confirm ? <CheckCircle size={15} /> : '✗'}
                  </span>
                )}
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
              )}
            </div>

            {error && (
              <div className="rounded-xl p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || form.password !== form.confirm}
              className="btn-primary w-full text-sm py-4 mt-2 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={15} className="animate-spin" /> Creating account...
                </span>
              ) : (
                <>Create Account <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-sm text-center text-[#7a6b4e] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#c9933a] hover:text-[#e8b96a] transition-colors font-medium">Sign in</Link>
          </p>

          <p className="text-xs text-center text-[#4a4030] mt-4">
            By creating an account you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
