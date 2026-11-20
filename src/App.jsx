import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { UtensilsCrossed } from 'lucide-react';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { RealTimeProvider } from './contexts/RealTimeContext';
import LoadingScreen from './components/LoadingScreen';
import ScrollProgress from './components/ScrollProgress';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import FoodDetailPage from './pages/FoodDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import StoryPage from './pages/StoryPage';

// Specialized role-based dashboards
import OwnerDashboard from './pages/OwnerDashboard';
import StaffDashboard from './pages/StaffDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';

// Layout wrapper that conditionally shows Navbar/Footer
function Layout({ children }) {
  const location = useLocation();
  const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthPage = authPages.includes(location.pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0a0804' }}>
      {!isAuthPage && <ScrollProgress />}
      {!isAuthPage && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

// 404 page
function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4 pt-20">
      <div>
        <UtensilsCrossed size={64} className="text-[#c9933a] mx-auto mb-6 opacity-60" />
        <h1
          className="font-display font-bold text-5xl text-[#f8f0e3] mb-4"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          404
        </h1>
        <p className="text-[#7a6b4e] text-lg mb-8">This page seems to have wandered off the menu</p>
        <a href="/" className="btn-primary">
          Return to Home
        </a>
      </div>
    </div>
  );
}

function AppContent() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      {!loading && (
        <Layout>
          <Routes>
            {/* Public Customer Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/:id" element={<FoodDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/track" element={<OrderTrackingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="/story" element={<StoryPage />} />

            {/* Authenticated Customer Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Role-Protected Operator Workspaces */}
            <Route
              path="/owner"
              element={
                <ProtectedRoute allowedRoles={['ROLE_OWNER']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_OWNER']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/delivery"
              element={
                <ProtectedRoute allowedRoles={['ROLE_DELIVERY_MAN', 'ROLE_OWNER']}>
                  <DeliveryDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      )}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#16120a',
            color: '#f8f0e3',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '16px',
            fontSize: '13px',
            padding: '12px 18px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
          },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RealTimeProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </RealTimeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
