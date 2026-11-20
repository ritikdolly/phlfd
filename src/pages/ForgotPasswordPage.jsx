import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { Mail, ArrowRight, Loader, ArrowLeft, Flame, CheckCircle } from 'lucide-react';
import { authService } from '../api/services';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    if (!formRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        formRef.current.children,
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.6, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, [submitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: '#0a0804' }}
    >
      <div className="w-full max-w-md">
        {/* Brand crest */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
            style={{ background: 'linear-gradient(135deg, #c9933a, #d4af37)' }}
          >
            <Flame size={26} style={{ color: '#0a0804' }} />
          </div>
          <h1
            className="font-bold tracking-widest text-2xl mb-1"
            style={{ fontFamily: 'Playfair Display, serif', color: '#f8f0e3' }}
          >
            SAVORIA
          </h1>
          <p style={{ color: '#7a6b4e', fontSize: '13px' }}>Fine Indian Dining · Mumbai</p>
        </div>

        {submitted ? (
          <div
            ref={formRef}
            className="rounded-2xl p-8 text-center"
            style={{ background: '#16120a', border: '1px solid rgba(201,147,58,0.25)' }}
          >
            <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#c9933a' }} />
            <h2
              className="font-bold text-2xl mb-3"
              style={{ fontFamily: 'Playfair Display, serif', color: '#f8f0e3' }}
            >
              Check Your Email
            </h2>
            <p className="mb-6 leading-relaxed" style={{ color: '#a08c5b' }}>
              If <strong style={{ color: '#f8f0e3' }}>{email}</strong> is registered with Savoria,
              you will receive a password reset link shortly.
            </p>
            <p className="text-sm mb-8" style={{ color: '#7a6b4e' }}>
              The link will expire in 1 hour. Check your spam folder if you don't see it.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 font-semibold text-sm"
              style={{ color: '#c9933a' }}
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <div
            className="rounded-2xl p-8"
            style={{ background: '#16120a', border: '1px solid rgba(201,147,58,0.25)' }}
          >
            <div ref={formRef}>
              <div className="mb-6">
                <h2
                  className="font-bold text-2xl mb-2"
                  style={{ fontFamily: 'Playfair Display, serif', color: '#f8f0e3' }}
                >
                  Forgot Password?
                </h2>
                <p style={{ color: '#7a6b4e', fontSize: '14px' }}>
                  Enter your registered email and we'll send a secure reset link.
                </p>
              </div>

              {error && (
                <div
                  className="rounded-xl px-4 py-3 mb-5 text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7a6b4e' }}>
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#7a6b4e' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: '#0a0804',
                        border: '1px solid rgba(201,147,58,0.3)',
                        color: '#f8f0e3',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #c9933a, #d4af37)',
                    color: '#0a0804',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <>Send Reset Link <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-sm"
                  style={{ color: '#7a6b4e' }}
                >
                  <ArrowLeft size={14} />
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
