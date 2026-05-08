import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';


const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [stats, setStats] = useState({ users: 0, revenue: 0, orders: 0, active: 0 });
  
  // Modal / Form States
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Furniture',
    price_per_month: '',
    deposit: '',
    image: '',
    available_units: ''
  });

  const userState = JSON.parse(localStorage.getItem('user'));

  if (!userState?.token) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="bg-white p-12 rounded-[2.5rem] shadow-xl text-center">
          <h2 className="text-2xl font-black mb-4">Unauthorized Access</h2>
          <p className="text-gray-500 mb-8">Please login as admin to view this page.</p>
          <a href="/auth" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold">Sign In</a>
        </div>
      </div>
    );
  }

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setProductLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products`);
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setProductLoading(false);
    }
  };

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setOrderLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${userState?.token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setOrderLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/analytics`, {
        headers: {
          'Authorization': `Bearer ${userState?.token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  useEffect(() => {
    if (!userState || userState.role !== 'admin') {
      toast.error('Access Denied');
      return; 
    }
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'orders') fetchOrders();
    fetchStats();
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Furniture',
      price_per_month: '',
      deposit: '',
      image: '',
      available_units: ''
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const handleEditClick = (product) => {
    setIsEditing(true);
    setEditId(product._id);
    setFormData({
      name: product.name,
      category: product.category,
      price_per_month: product.price_per_month,
      deposit: product.deposit,
      image: product.image,
      available_units: product.available_units
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${userState.token}`
          }
        });
        if (response.ok) {
          toast.success('Product deleted');
          setProducts(products.filter(p => p._id !== id));
        }
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price_per_month: Number(formData.price_per_month),
      deposit: Number(formData.deposit),
      available_units: Number(formData.available_units)
    };

    const url = isEditing 
      ? `${import.meta.env.VITE_API_URL}/products/${editId}` 
      : `${import.meta.env.VITE_API_URL}/products`;
      
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userState.token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        toast.success(isEditing ? 'Updated' : 'Created');
        fetchProducts();
        resetForm();
      }
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const updateStatus = async (orderId, newStatus, reason = "") => {
    if (!newStatus) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userState.token}`
        },
        body: JSON.stringify({ status: newStatus, reason })
      });
      const result = await response.json();
      if (result.success) {
        toast.success(newStatus === 'Rejected' ? `Rejected: ${reason}` : `Status: ${newStatus}`);
        fetchOrders();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8 font-sans pt-24">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="bg-white rounded-[2.5rem] shadow-sm p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Hub</h1>
              <p className="text-gray-500 font-medium mt-2">Manage your inventory and track customer rentals.</p>
            </div>
            {activeTab === 'products' && (
              <button 
                onClick={() => { resetForm(); setShowForm(!showForm); }}
                className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
              >
                {showForm ? 'Cancel' : '+ New Product'}
              </button>
            )}
          </div>

          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-50">
             <button 
              onClick={() => setActiveTab('products')}
              className={`px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
               Inventory
             </button>
             <button 
              onClick={() => setActiveTab('orders')}
              className={`px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
               Live Orders
             </button>
          </div>
        </div>

        {/* Stats Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Users', value: stats.users, icon: '👤', color: 'bg-blue-50 text-blue-600' },
            { label: 'Total Revenue', value: formatCurrency(stats.revenue), icon: '💰', color: 'bg-green-50 text-green-600' },

            { label: 'Total Orders', value: stats.orders, icon: '📦', color: 'bg-purple-50 text-purple-600' },
            { label: 'Active Rentals', value: stats.active, icon: '🏢', color: 'bg-indigo-50 text-indigo-600' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-7 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900 leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Content: Products */}
        {activeTab === 'products' && (
          <>
            {showForm && (
              <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 mb-10 border border-gray-100 animate-fade-in-up">
                <h2 className="text-3xl font-black text-gray-900 mb-8 pb-4 border-b border-gray-100">
                  {isEditing ? 'Update Product' : 'Add New Inventory'}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2.5">Product Title</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="block w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all" placeholder="E.g. Premium Leather Sofa" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2.5">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="block w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none">
                      <option value="Furniture">Furniture</option>
                      <option value="Appliances">Appliances</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2.5">Image URL</label>
                    <input type="url" name="image" required value={formData.image} onChange={handleInputChange} className="block w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" placeholder="https://images.unsplash.com/..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2.5">Monthly Rent (₹)</label>
                    <input type="number" name="price_per_month" required value={formData.price_per_month} onChange={handleInputChange} className="block w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2.5">Security Deposit (₹)</label>
                    <input type="number" name="deposit" required value={formData.deposit} onChange={handleInputChange} className="block w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2.5">Initial Stock Units</label>
                    <input type="number" name="available_units" required value={formData.available_units} onChange={handleInputChange} className="block w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none" placeholder="1" min="0" />
                  </div>
                  <div className="md:col-span-2 pt-4 flex gap-4">
                    <button type="submit" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all active:scale-95">
                      {isEditing ? 'Save Changes' : 'Publish Product'}
                    </button>
                    <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-600 px-10 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white shadow-xl rounded-[2.5rem] overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Product Details</th>
                      <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Category</th>
                      <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Financials</th>
                      <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Availability</th>
                      <th className="px-8 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {products.length === 0 && !productLoading && (
                      <tr>
                        <td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-bold">No products found in inventory</td>
                      </tr>
                    )}
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-5 whitespace-nowrap flex items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                             <img 
                               src={product.image} 
                               alt={product.name} 
                               onError={(e) => { e.target.src = "https://via.placeholder.com/300"; }}
                               className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                             />
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-lg leading-tight">{product.name}</p>
                            <p className="text-xs text-gray-400 font-mono mt-1">#{product._id.slice(-6)}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className="px-4 py-1.5 text-[10px] font-black rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-wider border border-indigo-100">{product.category}</span>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                           <p className="font-black text-gray-900 text-lg">{formatCurrency(product.price_per_month)}<span className="text-xs text-gray-400 font-medium lowercase">/mo</span></p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Dep: {formatCurrency(product.deposit)}</p>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                           <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-wider border ${product.available_units > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                             {product.available_units < 0 ? 0 : product.available_units} Units
                           </span>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-right">
                          <button onClick={() => handleEditClick(product)} className="text-indigo-600 font-black text-sm mr-6 hover:underline">Edit</button>
                          <button onClick={() => handleDelete(product._id, product.name)} className="text-red-500 font-black text-sm hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Tab Content: Orders */}
        {activeTab === 'orders' && (
          <div className="bg-white shadow-xl rounded-[2.5rem] overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Customer info</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Rental item</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Revenue</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Current Status</th>
                    <th className="px-8 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Status action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {orders.length === 0 && !orderLoading && (
                    <tr>
                      <td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-bold">No rental orders to display</td>
                    </tr>
                  )}
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="font-black text-gray-900">{order.user_id?.name || 'Guest User'}</div>
                        <div className="text-xs text-gray-400 font-medium">{order.user_id?.email || 'No email'}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                         <p className="font-bold text-gray-800">{order.name}</p>
                         <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Duration: {order.duration} Mo</p>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                         <p className="font-black text-indigo-700 text-lg">{formatCurrency(order.total_price)}</p>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${
                          order.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          order.status === 'Approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        {order.status !== 'Delivered' && order.status !== 'Rejected' && (
                          <div className="flex justify-end gap-2">
                             <select 
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'Rejected') {
                                  const reason = prompt("Enter rejection reason:");
                                  if (!reason) return;
                                  updateStatus(order._id, val, reason);
                                } else {
                                  updateStatus(order._id, val);
                                }
                              }}
                              value={order.status}
                              className="bg-gray-50 border border-gray-200 text-gray-900 text-[10px] font-black rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-100 transition-all uppercase tracking-widest cursor-pointer"
                             >
                               <option value={order.status} disabled>Update Status</option>
                               {order.status === 'Pending' && (
                                 <>
                                   <option value="Approved">Approve</option>
                                   <option value="Rejected">Reject</option>
                                 </>
                               )}
                               {order.status === 'Approved' && (
                                 <>
                                   <option value="Delivered">Deliver</option>
                                   <option value="Rejected">Reject</option>
                                 </>
                               )}
                             </select>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default AdminDashboard;
