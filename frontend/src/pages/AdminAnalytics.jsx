import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { formatCurrency } from '../utils/format';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/analytics`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        
        if (response.status === 401) {
          localStorage.removeItem("user");
          navigate("/auth");
          return;
        }

        const res = await response.json();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) return <p className="text-center pt-32">No data available.</p>;

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-12 pt-24 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Business Analytics</h1>
            <p className="text-gray-500 font-medium mt-2">Real-time overview of your rental platform performance.</p>
          </div>
          <Link to="/admin" className="px-6 py-3 bg-white border border-gray-100 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Total Users */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
             </div>
             <p className="text-gray-500 font-black text-xs uppercase tracking-widest mb-1">Total Users</p>
             <h3 className="text-4xl font-black text-gray-900">{data.totalUsers}</h3>
          </div>

          {/* Total Orders */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
             </div>
             <p className="text-gray-500 font-black text-xs uppercase tracking-widest mb-1">Total Orders</p>
             <h3 className="text-4xl font-black text-gray-900">{data.totalOrders}</h3>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
             <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <p className="text-gray-500 font-black text-xs uppercase tracking-widest mb-1">Total Revenue</p>
             <h3 className="text-4xl font-black text-gray-900">{formatCurrency(data.totalRevenue)}</h3>
          </div>

          {/* Active Rentals */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
             <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             </div>
             <p className="text-gray-500 font-black text-xs uppercase tracking-widest mb-1">Active Rentals</p>
             <h3 className="text-4xl font-black text-gray-900">{data.activeRentals}</h3>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
          <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Top Trending Products</h3>
          <div className="space-y-4">
            {data.topProducts.map((p, index) => (
              <div key={p._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                 <div className="flex items-center gap-4">
                    <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-black text-xs">#{index + 1}</span>
                    <div>
                      <p className="font-bold text-gray-900">Product ID: {p._id}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Ordered {p.count} times</p>
                    </div>
                 </div>
                 <Link to={`/product/${p._id}`} className="text-indigo-600 font-bold text-sm hover:underline">View Product &rarr;</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
