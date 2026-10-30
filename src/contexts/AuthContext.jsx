import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEMO_USERS = [
  {
    id: 'u1',
    name: 'Arjun Mehta',
    email: 'arjun@example.com',
    password: 'password',
    phone: '+91 98765 43210',
    avatar: 'https://i.pravatar.cc/100?img=52',
    addresses: [
      {
        id: 'a1',
        label: 'Home',
        line: '12, Shastri Nagar, Andheri West',
        city: 'Mumbai',
        pin: '400053',
        isDefault: true,
      },
    ],
    orders: [],
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('savoria_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) localStorage.setItem('savoria_user', JSON.stringify(user));
    else localStorage.removeItem('savoria_user');
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    await new Promise(r => setTimeout(r, 800));
    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...safe } = found;
      setUser(safe);
      setLoading(false);
      return { success: true };
    }
    setError('Invalid email or password');
    setLoading(false);
    return { success: false };
  };

  const register = async ({ name, email, phone }) => {
    setLoading(true);
    setError(null);
    await new Promise(r => setTimeout(r, 1000));
    const newUser = {
      id: `u${Date.now()}`,
      name,
      email,
      phone,
      avatar: `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70)}`,
      addresses: [],
      orders: [],
    };
    setUser(newUser);
    setLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  const addAddress = (addr) => {
    setUser(prev => ({
      ...prev,
      addresses: addr.isDefault
        ? [{ ...addr }, ...(prev.addresses || []).map(a => ({ ...a, isDefault: false }))]
        : [...(prev.addresses || []), addr],
    }));
  };

  const addOrder = (order) => {
    setUser(prev => ({
      ...prev,
      orders: [order, ...(prev.orders || [])],
    }));
  };

  return (
    <AuthContext.Provider value={{
      user, loading, error, login, register, logout, updateProfile, addAddress, addOrder,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
