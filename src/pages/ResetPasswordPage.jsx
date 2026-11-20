import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { Eye, EyeOff, Lock, Loader, CheckCircle, ArrowLeft, Flame, AlertCircle } from 'lucide-react';
import { authService } from '../api/services';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
  }, [success]);

  const getStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '#7a6b4e' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
      { label: 'Weak', color: '#ef4444' },
      { label: 'Fair', color: '#f97316' },
      { label: 'Good', color: '#eab308' },
      { label: 'Strong', color: '#22c55e' },
      { label: 'Very Strong', color: '#16a34a' },
    ];
    return { score, ...map[score] };
  };

  const strength = getStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0804' }}>
        <div className="text-center max-w-sm">
          <AlertCircle size={48} className="mx-auto mb-4" style={{ color: '#ef4444' }} />
          <h2 className="font-bold text-xl mb-3" style={{ fontFamily: 'Playfair Display, serif', color: '#f8f0e3' }}>
            Invalid Reset Link
          </h2>
          <p className="mb-6 text-sm" style={{ color: '#a08c5b' }}>
            This password reset link is missing or invalid. Please request a new one.
          </p>
          <Link to="/forgot-password" className="text-sm font-semibold" style={{ color: '#c9933a' }}>
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: '#0a0804' }}>
      <div className="w-full max-w-md">
        {/* Brand */}
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

        <div className="rounded-2xl p-8" style={{ background: '#16120a', border: '1px solid rgba(201,147,58,0.25)' }}>
          {success ? (
            <div ref={formRef} className="text-center">
              <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
              <h2 className="font-bold text-2xl mb-3" style={{ fontFamily: 'Playfair Display, serif', color: '#f8f0e3' }}>
                Password Reset!
              </h2>
              <p className="mb-6 leading-relaxed" style={{ color: '#a08c5b' }}>
                Your password has been updated successfully. Redirecting you to sign in…
              </p>
              <Link to="/login" className="text-sm font-semibold" style={{ color: '#c9933a' }}>
                Sign In Now
              </Link>
            </div>
          ) : (
            <div ref={formRef}>
              <div className="mb-6">
                <h2 className="font-bold text-2xl mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#f8f0e3' }}>
                  Set New Password
                </h2>
                <p className="text-sm" style={{ color: '#7a6b4e' }}>
                  Choose a strong password for your Savoria account.
                </p>
              </div>

              {error && (
                <div
                  className="rounded-xl px-4 py-3 mb-5 text-sm flex items-start gap-2"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
                >
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7a6b4e' }}>
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#7a6b4e' }} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
                      className="w-full pl-11 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ background: '#0a0804', border: '1px solid rgba(201,147,58,0.3)', color: '#f8f0e3' }}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: '#7a6b4e' }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{ background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)' }}
                          />
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7a6b4e' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#7a6b4e' }} />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className="w-full pl-11 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: '#0a0804',
                        border: `1px solid ${confirmPassword && confirmPassword !== newPassword ? 'rgba(239,68,68,0.5)' : 'rgba(201,147,58,0.3)'}`,
                        color: '#f8f0e3',
                      }}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: '#7a6b4e' }}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs mt-1" style={{ color: '#fca5a5' }}>Passwords do not match</p>
                  )}
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
                  {loading ? <Loader size={16} className="animate-spin" /> : 'Reset Password'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center gap-1 text-sm" style={{ color: '#7a6b4e' }}>
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
