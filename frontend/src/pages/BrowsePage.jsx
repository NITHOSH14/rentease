import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/format';


const BrowsePage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter States
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    setCategory(searchParams.get("category") || "All");
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params — skip empty values so backend gets clean filter
      const params = new URLSearchParams();
      if (search)                          params.set('search', search);
      if (category && category !== 'All') params.set('category', category);
      if (minPrice)                        params.set('min', minPrice);
      if (maxPrice)                        params.set('max', maxPrice);

      const url = `${import.meta.env.VITE_API_URL}/products${params.toString() ? `?${params}` : ''}`;
      const response = await fetch(url, { cache: "no-store" });

      if (!response.ok) throw new Error('Failed to fetch products');

      const result = await response.json();

      if (result.success) {
        setProducts(result.data);
      } else {
        throw new Error(result.message || 'Error fetching data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [search, category, minPrice, maxPrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans bg-gray-50 min-h-screen pt-24">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-[2.5rem] shadow-sm p-8 mb-12 border border-gray-100 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Search Bar */}
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all group-hover:bg-white"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          {/* Category Dropdown */}
          <div className="relative group">
             <select 
               value={category}
               onChange={(e) => setCategory(e.target.value)}
               className="w-full pl-5 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-100 transition-all"
             >
               <option value="All">All Categories</option>
               <option value="Furniture">Furniture</option>
               <option value="Appliances">Appliances</option>
               <option value="Electronics">Electronics</option>
               <option value="Fitness">Fitness</option>
               <option value="Packages">Packages</option>
             </select>
             <svg className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
          </div>

          {/* Min Price */}
          <div className="relative">
            <input 
              type="number" 
              placeholder="Min Price (₹)" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>

          {/* Max Price */}
          <div className="relative">
            <input 
              type="number" 
              placeholder="Max Price (₹)" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Results Title */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          {search ? `Results for "${search}"` : "Discover Rentals"}
          <span className="ml-3 text-sm font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">{products.length} Items</span>
        </h2>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col p-2 animate-pulse h-[400px]">
              <div className="pt-[80%] bg-gray-200 rounded-[1.5rem] w-full"></div>
              <div className="p-6 flex flex-grow flex-col gap-4">
                <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-10 bg-gray-200 rounded-xl w-full mt-auto"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 text-red-700 p-6 rounded-[2rem] text-center max-w-2xl mx-auto border border-red-100 shadow-xl shadow-red-100/50">
          <p className="font-black text-lg">Failed to retrieve inventory</p>
          <p className="text-sm mt-2 opacity-80">{error}</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link 
              key={product._id} 
              to={`/product/${product._id}`}
              className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(79,70,229,0.12)] transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col group transform hover:-translate-y-2"
            >
              <div className="relative pt-[80%] bg-gray-50 overflow-hidden m-2 rounded-[1.5rem]">
                <img 
                  src={product.image} 
                  alt={product.name}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/300"; }}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest text-gray-900 shadow-sm border border-white/40 uppercase">
                  {product.category}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-extrabold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {product.name}
                </h3>
                
                <div className="mt-auto pt-4 flex flex-col gap-4 border-t border-gray-50/50">
                  <div className="flex justify-between items-center">
                    {product.available_units > 0 ? (
                      <span className="text-[10px] font-black uppercase px-2 py-1 bg-green-50 text-green-600 rounded-md tracking-widest border border-green-100">In Stock</span>
                    ) : (
                      <span className="text-[10px] font-black uppercase px-2 py-1 bg-red-50 text-red-500 rounded-md tracking-widest border border-red-100">Sold Out</span>
                    )}
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1.5 block leading-none">Monthly</span>
                      <span className="text-2xl font-black text-indigo-600 leading-none">{formatCurrency(product.price_per_month)}</span>
                    </div>
                  </div>
                  
                  <button 
                    disabled={product.available_units === 0}
                    onClick={async (e) => {
                      e.preventDefault();
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
                              duration: 1,
                              quantity: 1,
                              image: product.image
                            }
                          })
                        });
                        if (response.ok) {
                          toast.success("Added to cart!");
                          window.dispatchEvent(new Event('cartUpdated'));
                        } else {
                          const resData = await response.json();
                          toast.error(resData.message || "Out of stock");
                        }
                      } catch (err) {
                        toast.error("Error adding to cart");
                      }
                    }}
                    className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                      product.available_units === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'
                    }`}
                  >
                    {product.available_units === 0 ? 'Unavailable' : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                        Rent Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Link>
          ))}
          
          {/* Empty State */}
          {products.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500 flex flex-col items-center bg-white rounded-[3rem] border border-dashed border-gray-200">
              <span className="text-6xl mb-6">🔍</span>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No matching items found</h3>
              <p className="text-gray-500 font-medium max-w-sm">We couldn't find anything matching your filters. Try adjusting your search or clearing the filters.</p>
              <button 
                onClick={() => { setSearch(""); setCategory("All"); setMinPrice(""); setMaxPrice(""); }}
                className="mt-8 text-indigo-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrowsePage;
