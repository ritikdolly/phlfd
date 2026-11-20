import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MailCheck, AlertCircle, ArrowRight, RefreshCw, 
  CheckCircle2, Mail, ShieldCheck, Home 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token');
  const navigate = useNavigate();

  const { user, verifyEmail, resendVerification, isEmailVerified } = useAuth();

  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(isEmailVerified);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [resendEmail, setResendEmail] = useState(user?.email || '');
  const [resending, setResending] = useState(false);

  // Auto-verify if token is provided in URL
  useEffect(() => {
    if (tokenParam && !verified) {
      handleVerification(tokenParam);
    }
  }, [tokenParam]);

  const handleVerification = async (tokenToVerify) => {
    if (!tokenToVerify) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await verifyEmail(tokenToVerify);
      if (res.success) {
        setVerified(true);
        toast.success('Your email is now verified!');
      } else {
        setErrorMsg(res.error || 'Invalid or expired verification token');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Verification process encountered an error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      toast.error('Please enter your account email');
      return;
    }

    setResending(true);
    try {
      const res = await resendVerification(resendEmail);
      if (res.success) {
        toast.success('A fresh verification link has been sent to your email');
        setErrorMsg('');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#0a0804] text-[#f8f0e3] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#141008] border border-[#2a2416] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

        {loading ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center mx-auto text-[#d4af37]">
              <RefreshCw size={28} className="animate-spin" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#f8f0e3]">Verifying Address</h2>
            <p className="text-sm text-[#a8997c]">Validating cryptographic verification crest...</p>
          </div>
        ) : verified ? (
          <div className="text-center py-6 space-y-5 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#f8f0e3] mb-2">
                Email Successfully Verified
              </h2>
              <p className="text-sm text-[#a8997c] leading-relaxed">
                Your credentials are fully authenticated. You have unrestricted access to table bookings, fine delivery, and promotional campaigns.
              </p>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Link
                to="/menu"
                className="w-full py-3.5 bg-[#d4af37] text-black font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-[#e6c35c] transition-all flex items-center justify-center gap-2"
              >
                Browse Restaurant Menu <ArrowRight size={15} />
              </Link>
              <Link
                to="/profile"
                className="w-full py-3 rounded-xl border border-[#2a2416] text-[#a8997c] hover:text-[#f8f0e3] hover:bg-[#1a140a] text-xs font-semibold transition-all"
              >
                View Patron Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center mx-auto text-[#d4af37] mb-4">
                <Mail size={30} />
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#f8f0e3]">
                Verify Your Email
              </h1>
              <p className="text-xs text-[#a8997c] leading-relaxed">
                We safeguard every patron account. Confirm ownership of your email address to activate your full privileges.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Manual Token Verification */}
            <form onSubmit={(e) => { e.preventDefault(); handleVerification(manualToken); }} className="space-y-3">
              <label className="text-[11px] uppercase tracking-wider text-[#a8997c] block">
                Paste Verification Token / Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Paste token received in email..."
                  className="flex-1 bg-[#0a0804] border border-[#2a2416] rounded-xl px-3.5 py-2.5 text-xs text-[#f8f0e3] font-mono focus:border-[#d4af37] outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !manualToken.trim()}
                  className="px-4 py-2.5 bg-[#d4af37] text-black text-xs font-bold rounded-xl hover:bg-[#e6c35c] transition-all disabled:opacity-50"
                >
                  Verify
                </button>
              </div>
            </form>

            <div className="relative border-t border-[#2a2416] pt-5">
              <h3 className="text-xs font-semibold text-[#f8f0e3] mb-2 flex items-center gap-1.5">
                <RefreshCw size={12} className="text-[#d4af37]" /> Didn't receive an email?
              </h3>
              <p className="text-[11px] text-[#a8997c] mb-3">
                Check your spam folder, or request a fresh verification link below:
              </p>

              <form onSubmit={handleResend} className="space-y-3">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full bg-[#0a0804] border border-[#2a2416] rounded-xl px-3.5 py-2.5 text-xs text-[#f8f0e3] focus:border-[#d4af37] outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full py-2.5 rounded-xl border border-[#d4af37]/30 text-[#d4af37] text-xs font-semibold hover:bg-[#d4af37]/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resending ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
              </form>
            </div>

            <div className="pt-2 text-center">
              <Link to="/" className="text-xs text-[#a8997c] hover:text-[#d4af37] inline-flex items-center gap-1">
                <Home size={12} /> Return to Savoria Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
