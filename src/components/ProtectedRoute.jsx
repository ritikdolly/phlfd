import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0804] text-[#d4af37]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm tracking-wider uppercase">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role?.startsWith('ROLE_') ? user.role : `ROLE_${user?.role}`;
    const normalizedAllowed = allowedRoles.map((r) => (r.startsWith('ROLE_') ? r : `ROLE_${r}`));

    const hasPermission = normalizedAllowed.includes(userRole);

    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0804] px-4 pt-20">
          <div className="max-w-md w-full bg-[#141008] border border-red-900/40 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif text-[#f8f0e3] mb-2">Access Denied</h2>
            <p className="text-[#a8997c] text-sm mb-6">
              Your account ({user?.role || 'User'}) does not have permission to view this section.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/"
                className="px-6 py-2.5 rounded-full text-xs uppercase font-medium tracking-wider bg-[#d4af37] text-black hover:bg-[#e6c35c] transition-all"
              >
                Return to Home
              </a>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
}

