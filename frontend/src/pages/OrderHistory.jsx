import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/format';


const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userState = JSON.parse(localStorage.getItem('user'));
        if (!userState || !userState._id) {
           setError('Please sign in securely to view your customized rental timeline and orders.');
           setLoading(false);
           return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${userState._id}`, {
          headers: {
            'Authorization': `Bearer ${userState.token}`
          }
        });
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || 'Failed to retrieve orders');
        }
        
        if (result.success) {
          setOrders(result.data);
        } else {
          throw new Error(result.message || 'Error parsing order payload');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-10">
        <div className="max-w-5xl mx-auto space-y-8">
           <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse"></div>
           {[1, 2, 3].map(i => (
             <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 flex gap-6 h-48 animate-pulse">
                <div className="w-1/4 h-full bg-gray-200 rounded-xl"></div>
                <div className="flex-1 flex flex-col justify-between py-2">
                   <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="h-16 bg-gray-200 rounded-xl"></div>
                      <div className="h-16 bg-gray-200 rounded-xl"></div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 text-red-700 p-8 rounded-3xl text-center max-w-md w-full border border-red-100 shadow-sm">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <p className="font-extrabold text-2xl mb-2">Error Retrieving Data</p>
          <p className="text-sm font-medium opacity-80">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-8 inline-block bg-white text-red-700 border border-red-200 px-8 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors w-full shadow-sm">Try Again</button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100 max-w-lg w-full flex flex-col items-center transform animate-fade-in-up">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
             <span className="text-5xl opacity-80">📦</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">No Orders Yet</h2>
          <p className="text-gray-500 mb-8 font-medium px-4">You haven't rented any products from us logically inside your history. Browse our collection to enhance your space!</p>
          <Link 
            to="/" 
            className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-xl font-extrabold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all w-full"
          >
            Start Exploring Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center break-words gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Your Order History</h1>
            <p className="text-gray-500 mt-3 font-medium text-lg">Review your past specific rentals, duration, and delivery schedules.</p>
          </div>
          <Link to="/" className="text-indigo-600 bg-white hover:bg-indigo-50 border-2 border-indigo-100 px-6 py-3 rounded-xl font-extrabold transition-all shadow-sm flex items-center gap-2">
            Browse More Items
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {orders.map((order) => {
            // Providing an elegant generic fallback if user's specific Backend JSON hasn't tracked direct image URL routing logic internally
            const displayImage = order.image || (order.product_id && order.product_id.image) || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80";
            
            return (
            <div key={order._id} className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col sm:flex-row group relative">
              
              {/* Card Image Block */}
              <div className="sm:w-1/3 xl:w-1/4 h-64 sm:h-auto bg-gray-100/80 relative overflow-hidden flex-shrink-0">
                <img 
                  src={displayImage}
                  alt={order.name} 
                  className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                {/* Floating Duration specific Tag overlay */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur shadow-sm text-gray-900 text-xs font-black uppercase tracking-wider px-4 py-2 border border-gray-100 rounded-lg">
                  {order.duration} Month{order.duration > 1 ? 's' : ''}
                </div>
              </div>

              {/* Data Properties Feed */}
              <div className="p-6 sm:p-8 flex-grow flex flex-col justify-center bg-white relative z-10">
                <div className="flex justify-between items-start mb-6 gap-4 flex-col md:flex-row">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 line-clamp-2 leading-tight">{order.name}</h3>
                    <div className="flex items-center gap-2 text-xs font-semibold mt-2.5 text-gray-400 font-mono">
                      <span>Order #</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{order._id.slice(-8)}</span>
                    </div>
                  </div>
                  
                  {/* Financial Tag */}
                  <div className="text-left md:text-right flex-shrink-0 bg-gray-50 border border-gray-100 px-5 py-3 rounded-2xl w-full md:w-auto mt-2 md:mt-0">
                    <div className="text-xs text-gray-500 font-extrabold uppercase tracking-wider mb-1">Total Paid</div>
                    <div className="text-2xl font-black text-indigo-700 leading-none">{formatCurrency(order.total_price)}</div>
                  </div>
                </div>
                
                {/* Visual Separator Grid */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 mt-2 pt-6 border-t border-gray-100">
                   {/* Creation Date Node */}
                   <div className="group">
                     <span className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                       Placed On
                     </span>
                     <span className="font-extrabold text-gray-900">{formatDate(order.created_at)}</span>
                   </div>
                   
                   {/* Delivery Node */}
                   <div>
                     <span className="block text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                       <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                       Delivery Setup
                     </span>
                     <span className="font-extrabold text-gray-900 block">{formatDate(order.delivery_date)}</span>
                   </div>
                </div>

              </div>
            </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
