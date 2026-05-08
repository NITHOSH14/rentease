import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userState = JSON.parse(localStorage.getItem('user'));
        fetch(`${import.meta.env.VITE_API_URL}/users/admin/all`, {
            headers: {
                'Authorization': `Bearer ${userState?.token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setUsers(data.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-24 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">User Management</h1>
                        <p className="text-gray-500 font-medium mt-2">Manage customer accounts and view their order activity.</p>
                    </div>
                    <Link to="/admin" className="px-6 py-3 bg-white border border-gray-100 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                <div className="grid gap-8">
                    {users.map(user => (
                        <div key={user._id} className="bg-white shadow-sm hover:shadow-md transition-shadow rounded-[2.5rem] p-8 lg:p-10 border border-gray-100">
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner">
                                        {user.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900">{user.name}</h2>
                                        <p className="text-gray-500 font-medium">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
                                        {user.orders?.length || 0} Total Orders
                                    </span>
                                    <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {user.orders?.length === 0 ? (
                                    <div className="col-span-full py-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 font-bold italic">No active or past orders found for this user.</p>
                                    </div>
                                ) : (
                                    user.orders?.map(order => (
                                        <div key={order._id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 group hover:border-indigo-200 transition-all hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5">
                                            <p className="font-black text-gray-900 group-hover:text-indigo-700 transition-colors line-clamp-1">{order.name}</p>
                                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-sm font-black text-indigo-600">${order.total_price}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">#{order._id?.slice(-6)}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                        </div>
                    ))}
                    {users.length === 0 && (
                        <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                            <p className="text-gray-400 font-bold text-xl">No users found in the database.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;