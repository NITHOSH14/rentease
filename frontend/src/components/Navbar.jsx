import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const [userState, setUserState] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  
  const syncUser = () => {
    setUserState(JSON.parse(localStorage.getItem('user') || '{}'));
  };

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Persisted across renders — uses sessionStorage so toasts don't repeat in the same session
  // but DO reset on a fresh browser tab (intentional UX: you see toasts once per session)
  const toastedIds = useRef(
    new Set(JSON.parse(sessionStorage.getItem('toastedNotifIds') || '[]'))
  );

  /* ─── Helpers ─────────────────────────────────────────────────── */

  const getAuthHeader = () => ({
    Authorization: `Bearer ${userState?.token}`
  });

  const fetchCartCount = async () => {
    const u = JSON.parse(localStorage.getItem('user'));
    if (!u?.token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
        headers: { Authorization: `Bearer ${u.token}` }
      });
      const data = await res.json();
      setCartCount(data.data?.items?.length || 0);
    } catch (_) {}
  };

  const fetchNotifications = async () => {
    if (!userState?.token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (data.success) setNotifications(data.data || []);
    } catch (_) {}
  };

  /* ─── Mount effects ─────────────────────────────────────────────── */

  // Event Listeners
  useEffect(() => {
    window.addEventListener('cartUpdated', fetchCartCount);
    window.addEventListener('authChanged', syncUser);
    return () => {
      window.removeEventListener('cartUpdated', fetchCartCount);
      window.removeEventListener('authChanged', syncUser);
    };
  }, []);

  // Data Fetching & Polling
  useEffect(() => {
    if (userState?.token) {
      fetchCartCount();
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setCartCount(0);
      setNotifications([]);
    }
  }, [userState?.token]);

  // Toast unread notifications ONCE per session
  useEffect(() => {
    notifications.forEach(n => {
      if (!n.is_read && !toastedIds.current.has(n._id)) {
        toast.success(n.message, { icon: '🔔', id: n._id });
        toastedIds.current.add(n._id);
        // Persist so refresh inside same tab won't re-toast
        sessionStorage.setItem(
          'toastedNotifIds',
          JSON.stringify([...toastedIds.current])
        );
      }
    });
  }, [notifications]);

  // Scroll styling
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotificationOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ─── Actions ─────────────────────────────────────────────────── */

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('toastedNotifIds');
    window.dispatchEvent(new Event('authChanged'));
    navigate('/auth');
  };

  const toggleNotifications = () => {
    setNotificationOpen(prev => !prev);
    setDropdownOpen(false);
  };

  const markOneRead = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: getAuthHeader()
      });
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, is_read: true } : n))
      );
    } catch (_) {}
  };

  const markAllRead = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: getAuthHeader()
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (_) {}
  };

  const deleteAll = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      setNotifications([]);
      sessionStorage.removeItem('toastedNotifIds');
      toastedIds.current.clear();
      toast.success('All notifications cleared');
    } catch (_) {
      toast.error('Failed to clear notifications');
    }
  };

  /* ─── Derived ─────────────────────────────────────────────────── */

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Browse', path: '/browse' },
    { name: 'Profile', path: '/profile' },
    { name: 'My Orders', path: '/my-orders' },
    { name: 'History', path: '/rental-history' }
  ];

  /* ─── Render ─────────────────────────────────────────────────── */

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm h-20 flex items-center transition-all duration-300 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-8 w-full flex justify-between items-center">

        {/* ── LOGO ── */}
        <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 transform group-hover:rotate-6 transition-transform">
            <span className="text-white font-black text-xl">R</span>
          </div>
          <Link to="/" className="font-black text-2xl tracking-tighter text-gray-900">
            RentEase<span className="text-indigo-600">.</span>
          </Link>
        </div>

        {/* ── NAV LINKS ── */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.path}
              className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-all hover:underline underline-offset-8 decoration-2"
            >
              {link.name}
            </Link>
          ))}
          {userState?.role === 'admin' && (
            <>
              <Link to="/admin" className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-all hover:underline underline-offset-8 decoration-2">Admin Hub</Link>
              <Link to="/admin/users" className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-all hover:underline underline-offset-8 decoration-2">Users</Link>
              <Link to="/admin/analytics" className="text-sm font-bold text-gray-500 hover:text-indigo-600 transition-all hover:underline underline-offset-8 decoration-2">Analytics</Link>
            </>
          )}
        </div>

        {/* ── RIGHT ACTIONS ── */}
        <div className="flex items-center gap-6">

          {/* Cart */}
          <Link to="/cart" className="text-gray-500 hover:text-indigo-600 transition-colors relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* ── Notifications ── */}
          {userState?.token && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={toggleNotifications}
                className="text-gray-500 hover:text-indigo-600 transition-colors relative"
                aria-label="Notifications"
              >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown panel */}
              {notificationOpen && (
                <div className="absolute right-0 mt-4 w-96 bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden z-50 flex flex-col"
                  style={{ maxHeight: '480px' }}
                >
                  {/* Header */}
                  <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <span className="font-black text-gray-800 text-sm flex items-center gap-2">
                      🔔 Notifications
                      {unreadCount > 0 && (
                        <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </span>
                    <div className="flex gap-3">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold hover:underline transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={deleteAll}
                          className="text-red-500 hover:text-red-700 text-[11px] font-bold hover:underline transition-colors"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="text-4xl mb-3">🔕</div>
                        <p className="font-bold text-gray-500 text-sm">No new notifications today</p>
                        <p className="text-gray-400 text-xs mt-1">You're all caught up!</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n._id}
                          onClick={() => markOneRead(n._id)}
                          className={`px-5 py-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors flex items-start gap-3 group ${
                            n.is_read ? 'opacity-60' : 'bg-indigo-50/30'
                          }`}
                        >
                          <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 transition-all ${n.is_read ? 'bg-gray-300' : 'bg-indigo-500 group-hover:scale-125'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${n.is_read ? 'text-gray-500' : 'text-gray-900'}`}>
                              {n.title || 'System Alert'}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1 font-medium">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User dropdown */}
          {userState?.token ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-gray-100 hover:bg-gray-50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {userState?.name?.charAt(0)}
                </div>
                <span className="hidden sm:block text-sm font-bold text-gray-700 mr-1">
                  {userState?.name?.split(' ')[0]}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-50 overflow-hidden z-50 py-1">
                  <Link to="/profile" className="block px-5 py-3 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="px-6 py-2.5 bg-gray-900 text-white text-sm font-black rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-gray-200">
              Sign In
            </Link>
          )}

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl p-6 flex flex-col gap-4 animate-fade-in">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-bold text-gray-700"
            >
              {link.name}
            </Link>
          ))}
          {!userState?.token && (
            <Link to="/auth" className="mt-2 py-4 bg-gray-900 text-white text-center rounded-2xl font-black">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
