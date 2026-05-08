import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';



const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product details.');
        }
        const result = await response.json();
        
        if (result.success) {
          setProduct(result.data);
        } else {
          throw new Error(result.message || 'Error fetching data.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      toast.error("Please login to add items to cart");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ 
          product: {
            product_id: product._id,
            name: product.name,
            price_per_month: product.price_per_month,
            deposit: product.deposit,
            duration: duration,
            quantity: 1,
            image: product.image
          } 
        })
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Added to cart successfully!");
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row animate-pulse">
           <div className="md:w-1/2 min-h-[400px] bg-gray-200"></div>
           <div className="md:w-1/2 p-8 lg:p-12 flex flex-col">
             <div className="h-10 bg-gray-200 rounded w-3/4 mb-8"></div>
             <div className="h-16 bg-gray-200 rounded w-1/2 mb-8"></div>
             <div className="h-12 bg-gray-200 rounded w-full mb-10"></div>
             <div className="mt-auto h-32 bg-gray-200 rounded-[1.5rem] w-full"></div>
           </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-red-50 text-red-700 p-6 rounded-xl text-center max-w-md w-full border border-red-100 shadow-sm">
          <svg className="w-12 h-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold text-lg mb-2">Oops! Something went wrong.</p>
          <p className="text-sm">{error}</p>
          <Link to="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
            &larr; Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2 transition-colors">
            <span>&larr;</span> Back to All Products
          </Link>
        </div>
        
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
          
          {/* Image Section */}
          <div className="md:w-1/2 bg-gray-100 relative">
            <img 
              src={product.image} 
              alt={product.name} 
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300";
              }}
              className="w-full h-full object-cover min-h-[400px] md:min-h-full"
            />
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-gray-800 shadow-md">
              {product.category}
            </div>
          </div>

          {/* Details Section */}
          <div className="md:w-1/2 p-8 lg:p-12 flex flex-col">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
              {product.name}
            </h1>
            
            <div className="mb-8 pb-8 border-b border-gray-100">
               <div className="flex items-end gap-2 mt-4">
                 <span className="text-4xl font-black text-indigo-700">{formatCurrency(product.price_per_month)}</span>
                 <span className="text-lg text-gray-500 font-medium pb-1">/ month</span>
               </div>
               <p className="text-sm text-gray-500 mt-2 font-medium flex items-center gap-2">
                 <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 Security Deposit: <span className="text-gray-900 font-bold">{formatCurrency(product.deposit)}</span> (Refundable)
               </p>
            </div>

            <div className="flex-grow">
              <label htmlFor="duration" className="block text-sm font-bold text-gray-700 mb-3">
                Select Rental Duration
              </label>
              <div className="relative">
                <select 
                  id="duration"
                  value={duration} 
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="block w-full pl-4 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm rounded-xl appearance-none bg-gray-50 border transition-all cursor-pointer"
                >
                  <option value={1}>1 Month</option>
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Total Price & Checkout */}
            <div className="mt-10 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-lg font-bold text-gray-800">Availability</span>
                 {product.available_units > 0 ? (
                   <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase border border-green-200">{product.available_units} Units In Stock</span>
                 ) : (
                   <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black uppercase border border-red-200">Out of Stock</span>
                 )}
              </div>
              <div className="flex justify-between items-center mb-6">
                 <span className="text-lg font-bold text-gray-800">Total Price</span>
                 <span className="text-3xl font-black text-indigo-700">
                   {formatCurrency(product.price_per_month * duration)}
                 </span>
              </div>
              
              <button 
                disabled={product.available_units === 0}
                onClick={handleAddToCart}
                className={`w-full border border-transparent rounded-xl shadow-lg py-4 px-4 text-lg font-extrabold text-white transition-all active:scale-[0.98] ${
                  product.available_units === 0 
                    ? 'bg-gray-400 cursor-not-allowed opacity-60' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                }`}
              >
                {product.available_units === 0 ? 'Currently Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
