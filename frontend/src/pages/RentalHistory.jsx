import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';


const RentalHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
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
          // Filter only delivered orders for history
          const deliveredOrders = result.data.filter(order => order.status === 'Delivered');
          setHistory(deliveredOrders);
        }
      } catch (error) {
        toast.error("Failed to load rental history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading history...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 font-sans pt-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-900">Rental History</h1>
        <Link to="/my-orders" className="text-indigo-600 font-bold hover:underline text-sm">View Active Orders</Link>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-4xl opacity-40">📜</span>
          </div>
          <p className="text-gray-500 font-bold mb-4">No completed rentals found in your history.</p>
          <Link to="/" className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            Rent Something Now
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {history.map(item => (
            <div key={item._id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-100 transition-all group">
              <div className="flex gap-5 items-center">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                   <img 
                    src={item.product_id?.image || "https://via.placeholder.com/150"} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                   />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{item.name}</h2>
                  <div className="flex gap-3 mt-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-0.5 rounded">Duration: {item.duration} Mo</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded">Completed</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-8 items-center w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                <div className="text-left md:text-right">
                   <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Paid Total</p>
                   <p className="text-xl font-black text-gray-900">{formatCurrency(item.total_price)}</p>
                </div>

                <div className="text-left md:text-right">
                   <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Delivered On</p>
                   <p className="font-bold text-gray-600">{new Date(item.delivery_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RentalHistory;
