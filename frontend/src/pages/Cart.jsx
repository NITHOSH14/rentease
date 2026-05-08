import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';


const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchCart = async () => {
    if (!user || !user.token) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      setCartItems(data.data?.items || []);
    } catch (error) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (productId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (response.ok) {
        setCartItems(prev => prev.filter(item => item.product_id !== productId));
        toast.success("Item removed from cart");
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleClear = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (response.ok) {
          setCartItems([]);
          toast.success("Cart cleared");
          window.dispatchEvent(new Event('cartUpdated'));
        }
      } catch (error) {
        toast.error("Failed to clear cart");
      }
    }
  };

  const calculateGrandTotal = () => {
    return cartItems.reduce((total, item) => total + (item.total_price || 0), 0);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    // Double check stock for all items
    for (const item of cartItems) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${item.product_id}`);
        const result = await response.json();
        if (result.success && result.data.available_units <= 0) {
          toast.error(`"${item.name}" is now out of stock. Please remove it to proceed.`);
          return;
        }
      } catch (err) {
        console.error("Stock check failed", err);
      }
    }

    navigate('/checkout');
  };

  if (loading) return <div className="p-20 text-center">Loading your cart...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center bg-white p-12 rounded-[2.5rem] shadow-xl border border-gray-100 max-w-md w-full">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-500 mb-8">Please sign in to view and manage your shopping cart.</p>
          <Link to="/auth" className="block w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all">Sign In Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans pt-24">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Shopping Cart</h1>
            <p className="text-gray-500 mt-2 font-medium">You have {cartItems.length} items in your rental list.</p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold transition-all px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Continue Browsing
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] shadow-xl p-16 text-center border border-gray-50 flex flex-col items-center">
            <div className="w-32 h-32 bg-indigo-50 rounded-full flex items-center justify-center text-6xl mb-8 animate-bounce">🛒</div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Your cart is feeling light</h2>
            <p className="text-gray-500 mb-10 max-w-md text-lg">Looks like you haven't discovered your next favorite rental yet. Explore our curated collections!</p>
            <Link 
              to="/" 
              className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <div key={item.product_id} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex flex-col sm:flex-row gap-8 items-center border border-gray-50 hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all group">
                  <div className="w-32 h-32 shrink-0 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative">
                    <img 
                       src={item.image} 
                       alt={item.name} 
                       onError={(e) => { e.target.onerror = null; e.target.src="https://via.placeholder.com/300"; }}
                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="flex-grow text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <Link to={`/product/${item.product_id}`} className="text-xl font-black text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1">
                        {item.name}
                      </Link>
                      <div className="text-right">
                        <span className="text-2xl font-black text-indigo-600">{formatCurrency(item.total_price)}</span>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.selected_duration} Month Plan</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleRemove(item.product_id)}
                      className="text-red-500 font-bold hover:text-red-700 transition-all flex items-center gap-2 text-sm mx-auto sm:mx-0 group/btn"
                    >
                      <span className="p-2 bg-red-50 rounded-xl group-hover/btn:bg-red-500 group-hover/btn:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </span>
                      Remove Item
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-gray-50 sticky top-24">
                <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Order Summary</h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-bold">{formatCurrency(calculateGrandTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Tax (GST)</span>
                    <span className="text-gray-900 font-bold">{formatCurrency(0)}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex justify-between">
                    <span className="text-lg font-black text-gray-900">Grand Total</span>
                    <span className="text-3xl font-black text-indigo-600">{formatCurrency(calculateGrandTotal())}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleCheckout} 
                    className="block w-full bg-indigo-600 text-white text-center py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
                  >
                    Proceed to Checkout
                  </button>
                  <button 
                    onClick={handleClear}
                    className="w-full text-gray-400 font-bold hover:text-red-500 py-2 transition-colors text-sm"
                  >
                    Clear All Items
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
