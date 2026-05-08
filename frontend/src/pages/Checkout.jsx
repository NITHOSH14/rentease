import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';


const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderComplete, setOrderComplete] = useState(false);
  const userState = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    deliveryDate: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
          headers: {
            'Authorization': `Bearer ${userState.token}`
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
    fetchCart();
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.total_price || 0), 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!formData.address.trim()) errors.address = 'Delivery Address is required';
    if (!formData.deliveryDate) errors.deliveryDate = 'Delivery Date is required';
    
    if (formData.deliveryDate) {
      const selected = new Date(formData.deliveryDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selected <= today) {
        errors.deliveryDate = 'Delivery Date must be in the future';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        if (!userState?.token) throw new Error('Authentication is required');

        if (cartItems.length === 0) {
          toast.error("Your cart is empty");
          return;
        }

        const payload = {
          user_id: userState._id,
          name: formData.fullName,
          address: formData.address,
          deliveryDate: formData.deliveryDate,
          items: cartItems.map(item => ({
            product_id: item.product_id,
            name: item.name,
            price_per_month: item.price_per_month,
            selected_duration: item.selected_duration || 1,
            total_price: item.total_price,
            quantity: item.quantity || 1
          }))
        };

        const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userState.token}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.message || 'Failed to place order');
        }
        
        // Clear Cart in Backend after success
        await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${userState.token}`
          }
        });

        setCartItems([]);
        window.dispatchEvent(new Event('cartUpdated'));

        // Simulate payment delay
        setTimeout(() => {
          setLoading(false);
          toast.success("✅ Payment Successful & Order Placed!");
          navigate('/my-orders');
        }, 2000);

      } catch (error) {
        setLoading(false);
        toast.error(error.message);
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 border-opacity-50 mb-4"></div>
      <h2 className="text-xl font-bold text-gray-700 animate-pulse">Processing Payment securely...</h2>
    </div>
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <div className="bg-white rounded-3xl shadow-sm p-12 text-center border border-gray-100 max-w-lg w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is empty</h2>
          <p className="text-gray-500 mb-8">You need items in your cart to checkout.</p>
          <Link to="/" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-full font-bold">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Secure Checkout</h1>
          <Link to="/cart" className="text-indigo-600 font-bold">Back to Cart</Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-5/12">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 sticky top-24">
              <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
                <h2 className="text-xl font-bold">Order Summary</h2>
                <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold">{cartItems.length} Items</span>
              </div>
              <div className="p-6 max-h-[460px] overflow-y-auto">
                <ul className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <li key={item.product_id} className="py-4 flex gap-4">
                      <img src={item.image} alt="" className="w-16 h-16 rounded-xl object-cover border" />
                      <div>
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{formatCurrency(item.total_price)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 bg-indigo-50/50 border-t">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-3xl font-black text-indigo-700">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-7/12">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold mb-8">Delivery Details</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none" />
                  {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                  <textarea name="address" rows="3" value={formData.address} onChange={handleInputChange} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none" />
                  {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Date</label>
                  <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleInputChange} className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none" />
                  {formErrors.deliveryDate && <p className="text-red-500 text-xs mt-1">{formErrors.deliveryDate}</p>}
                </div>
                <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-xl shadow-lg hover:bg-green-700 transition-all">Pay & Place Order</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
