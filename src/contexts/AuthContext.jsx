import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, customerService } from '../api/services';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('savoria_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('savoria_access_token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync state to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('savoria_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('savoria_user');
    }
  }, [user]);

  const logout = useCallback(async () => {
    try {
      if (localStorage.getItem('savoria_access_token')) {
        await authService.logout().catch(() => {});
      }
    } finally {
      localStorage.removeItem('savoria_access_token');
      localStorage.removeItem('savoria_refresh_token');
      localStorage.removeItem('savoria_user');
      setAccessToken(null);
      setUser(null);
      setError(null);
      toast.success('Logged out successfully');
    }
  }, []);

  // Listen for unauthorized 401 broadcast events from api interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      toast.error('Session expired. Please log in again.');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  // Synchronize freshest profile on mount if token exists
  useEffect(() => {
    if (accessToken) {
      customerService.getProfile()
        .then((res) => {
          if (res?.data) {
            setUser((prev) => ({
              ...(prev || {}),
              ...res.data,
              name: res.data.fullName || prev?.name,
              role: res.data.role,
            }));
          }
        })
        .catch(() => {
          // Fall back gracefully to stored profile
        });
    }
  }, [accessToken]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login({ email, password });
      if (res?.success && res.data) {
        const { accessToken: newAccess, refreshToken: newRefresh, user: authUser } = res.data;
        localStorage.setItem('savoria_access_token', newAccess);
        if (newRefresh) {
          localStorage.setItem('savoria_refresh_token', newRefresh);
        }
        setAccessToken(newAccess);

        const normalizedUser = {
          ...authUser,
          name: authUser.fullName || authUser.name,
          role: authUser.role,
        };

        setUser(normalizedUser);
        setLoading(false);
        return { success: true, user: normalizedUser };
      }
      throw new Error(res?.message || 'Login failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid email or password';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  const register = async ({ name, email, password, phone }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.register({
        fullName: name,
        email,
        password: password || 'Customer@123456',
        phone,
      });

      if (res?.success && res.data) {
        const { accessToken: newAccess, refreshToken: newRefresh, user: authUser } = res.data;
        localStorage.setItem('savoria_access_token', newAccess);
        if (newRefresh) {
          localStorage.setItem('savoria_refresh_token', newRefresh);
        }
        setAccessToken(newAccess);

        const normalizedUser = {
          ...authUser,
          name: authUser.fullName || authUser.name,
          role: authUser.role,
        };

        setUser(normalizedUser);
        setLoading(false);
        return { success: true, user: normalizedUser };
      }
      throw new Error(res?.message || 'Registration failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await customerService.updateProfile({
        fullName: data.name || data.fullName,
        phone: data.phone,
        avatarUrl: data.avatar || data.avatarUrl,
      });
      if (res?.data) {
        const updated = {
          ...user,
          ...res.data,
          name: res.data.fullName || user.name,
        };
        setUser(updated);
        return { success: true, user: updated };
      }
    } catch (err) {
      // Fallback local update
      setUser((prev) => ({ ...prev, ...data }));
    }
  };

  const addAddress = async (addr) => {
    try {
      const res = await customerService.addAddress({
        label: addr.label || 'Home',
        streetLine: addr.line || addr.streetLine,
        city: addr.city,
        state: addr.state || 'Maharashtra',
        postalCode: addr.pin || addr.postalCode,
        landmark: addr.landmark || '',
        contactPhone: addr.phone || user?.phone || '',
        isDefault: addr.isDefault || false,
      });
      if (res?.data) {
        // Refresh customer profile
        const profRes = await customerService.getProfile();
        if (profRes?.data) {
          setUser((prev) => ({ ...prev, ...profRes.data }));
        }
      }
    } catch (err) {
      // Graceful local append
      setUser((prev) => ({
        ...prev,
        addresses: addr.isDefault
          ? [{ ...addr }, ...(prev.addresses || []).map((a) => ({ ...a, isDefault: false }))]
          : [...(prev.addresses || []), addr],
      }));
    }
  };

  const googleLogin = async (credentialData) => {
    setLoading(true);
    setError(null);
    try {
      const payload = typeof credentialData === 'string'
        ? { credential: credentialData }
        : credentialData;

      const res = await authService.googleLogin(payload);
      if (res?.success && res.data) {
        const { accessToken: newAccess, refreshToken: newRefresh, user: authUser } = res.data;
        localStorage.setItem('savoria_access_token', newAccess);
        if (newRefresh) {
          localStorage.setItem('savoria_refresh_token', newRefresh);
        }
        setAccessToken(newAccess);

        const normalizedUser = {
          ...authUser,
          name: authUser.fullName || authUser.name,
          role: authUser.role,
          emailVerified: true,
        };

        setUser(normalizedUser);
        setLoading(false);
        toast.success(`Welcome back, ${normalizedUser.name}!`);
        return { success: true, user: normalizedUser };
      }
      throw new Error(res?.message || 'Google authentication failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Google authentication failed';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  const verifyEmail = async (token) => {
    setLoading(true);
    try {
      const res = await authService.verifyEmail(token);
      if (res?.success && res.data) {
        setUser((prev) => (prev ? { ...prev, emailVerified: true } : prev));
        toast.success('Email verified successfully!');
        return { success: true, user: res.data };
      }
      throw new Error(res?.message || 'Verification failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Verification failed';
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email) => {
    try {
      const targetEmail = email || user?.email;
      if (!targetEmail) throw new Error('Email address required');
      await authService.resendVerification(targetEmail);
      toast.success('Verification link dispatched to your inbox');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to dispatch verification email';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Helper role checkers
  const isOwner = user?.role === 'ROLE_OWNER' || user?.role === 'OWNER';
  const isStaff = user?.role === 'ROLE_STAFF' || user?.role === 'STAFF';
  const isDelivery = user?.role === 'ROLE_DELIVERY_MAN' || user?.role === 'DELIVERY_MAN';
  const isCustomer = user?.role === 'ROLE_CUSTOMER' || user?.role === 'CUSTOMER';
  const isEmailVerified = !!user?.emailVerified;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        error,
        login,
        register,
        googleLogin,
        verifyEmail,
        resendVerification,
        logout,
        updateProfile,
        addAddress,
        isAuthenticated: !!user && !!accessToken,
        isOwner,
        isStaff,
        isDelivery,
        isCustomer,
        isEmailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
