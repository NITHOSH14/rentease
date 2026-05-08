import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import OrderTracking from '../components/OrderTracking';
import { formatCurrency } from '../utils/format';


const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userState = JSON.parse(localStorage.getItem('user'));
        if (!userState) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${userState._id}`, {
          headers: {
            'Authorization': `Bearer ${userState.token}`
          }
        });
        const result = await response.json();
        if (result.success) {
          setOrders(result.data);
        }
      } catch (error) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-10 text-center">Loading your orders...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 font-sans">
      <h1 className="text-3xl font-black text-gray-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <p className="text-gray-500 font-bold mb-4">You haven't placed any orders yet.</p>
          <Link to="/" className="text-indigo-600 font-extrabold hover:underline">Start Browsing</Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
              
              {/* Order Info Row */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                     <img 
                      src={order.product_id?.image || "https://via.placeholder.com/150"} 
                      alt={order.name} 
                      className="w-full h-full object-cover"
                     />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{order.name}</h2>
                    <p className="text-gray-500 text-sm font-medium">Order ID: #{order._id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 items-center w-full md:w-auto justify-between md:justify-end">
                  <div className="text-left md:text-right">
                     <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-1">Total Price</p>
                     <p className="text-xl font-black text-indigo-600">{formatCurrency(order.total_price)}</p>
                  </div>

                  <div className="text-left md:text-right">
                     <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-1">Delivery Date</p>
                     <p className="font-bold text-gray-700">{new Date(order.delivery_date).toLocaleDateString()}</p>
                  </div>

                  <div className={`px-4 py-2 rounded-full text-xs font-black border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>
              </div>

              {/* Order Tracking UI */}
              <div className="w-full border-t border-gray-50 mt-6">
                <OrderTracking currentStatus={order.status} deliveryDate={order.delivery_date} />
              </div>

              {order.status === 'Rejected' && order.rejection_reason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm">
                  <p className="text-red-800 font-bold">Reason for Rejection:</p>
                  <p className="text-red-600 mt-1">{order.rejection_reason}</p>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
