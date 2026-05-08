import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import BrowsePage from './pages/BrowsePage';
import ProductDetail from './pages/ProductDetail';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import Auth from './pages/Auth';
import AdminUsers from './pages/AdminUsers';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import RentalHistory from './pages/RentalHistory';
import AdminAnalytics from './pages/AdminAnalytics';
import { getUser, isTokenExpired, logout } from './utils/auth';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user || !user?.token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || "null");

  if (!user || !user?.token) {
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [loading, setLoading] = useState(true);
  const checkToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user?.token && typeof user.token === 'string') {
      const parts = user.token.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          const expiry = payload.exp * 1000;
          if (Date.now() > expiry) {
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('authChanged'));
          }
        } catch (e) {
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('authChanged'));
        }
      } else {
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('authChanged'));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkToken();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#363636', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: 'bold' } }} />
      <Navbar />

      {/* All pages render below the fixed 80px (h-20) navbar */}
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/rental-history" element={<ProtectedRoute><RentalHistory /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route 
            path="/auth" 
            element={JSON.parse(localStorage.getItem("user") || "null")?.token 
              ? <Navigate to="/" replace /> 
              : <Auth />} 
          />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route
            path="/admin/users"
            element={<AdminRoute><AdminUsers /></AdminRoute>}
          />
          <Route 
            path="/admin/analytics" 
            element={<AdminRoute><AdminAnalytics /></AdminRoute>} 
          />
          <Route path="*" element={
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-10 text-center">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">404</h1>
              <p className="text-gray-500 font-bold text-lg mb-8">Oops! Page not found.</p>
              <a href="/" className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all">Go Home</a>
            </div>
          } />
        </Routes>
      </main>
    </Router>
  );
}

export default App;