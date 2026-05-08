import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.token) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data || []);
        }
      } catch (_) {
      } finally {
        setLoadingNotifs(false);
      }
    };
    fetchNotifications();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m12-3V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 font-medium mb-8">Please login first to view your profile details.</p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-gray-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const todayNotifs = notifications; // Backend already filters to today only
  const unreadCount = todayNotifs.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">

          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600" />

          <div className="px-8 pb-10 -mt-12">

            {/* Avatar + role badge */}
            <div className="relative flex justify-between items-end mb-8">
              <div className="w-24 h-24 bg-white p-1.5 rounded-3xl shadow-md">
                <div className="w-full h-full bg-indigo-100 rounded-[1.2rem] flex items-center justify-center text-indigo-700 text-3xl font-black">
                  {user.name?.charAt(0)}
                </div>
              </div>
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-black rounded-full border border-indigo-100 uppercase tracking-wider">
                {user.role}
              </span>
            </div>

            {/* Name & email */}
            <div className="space-y-1 mb-8">
              <h1 className="text-3xl font-black text-gray-900">{user.name}</h1>
              <p className="text-gray-500 font-medium">{user.email}</p>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Account Status</p>
                <p className="text-gray-900 font-bold">Verified Member</p>
              </div>
              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Last Activity</p>
                <p className="text-gray-900 font-bold">Today</p>
              </div>
            </div>

            {/* ── Today's Notifications ── */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-black text-gray-900">Today's Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="bg-indigo-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>

              {loadingNotifs ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse h-20 bg-gray-100 rounded-2xl" />
                  ))}
                </div>
              ) : todayNotifs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <div className="text-4xl mb-3">🔕</div>
                  <p className="font-bold text-gray-500">No new notifications today</p>
                  <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayNotifs.map(n => (
                    <div
                      key={n._id}
                      className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                        n.is_read
                          ? 'bg-white border-gray-100 opacity-60'
                          : 'bg-indigo-50/40 border-indigo-100 shadow-sm'
                      }`}
                    >
                      {/* Unread dot */}
                      <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${n.is_read ? 'bg-gray-300' : 'bg-indigo-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className={`font-black text-sm ${n.is_read ? 'text-gray-500' : 'text-gray-900'}`}>
                            {n.title || 'System Alert'}
                          </h4>
                          <span className="text-[10px] font-bold text-gray-400 shrink-0 whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm font-medium leading-snug mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-10 pt-8 border-t border-gray-100 flex gap-4">
              <button className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all">
                Edit Profile
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('user');
                  sessionStorage.removeItem('toastedNotifIds');
                  navigate('/auth');
                }}
                className="px-8 py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
