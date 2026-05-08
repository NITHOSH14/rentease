import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Armchair, Refrigerator, MonitorPlay, Dumbbell, Package } from 'lucide-react';
import { formatCurrency } from '../utils/format';


const CategorySection = ({ title, category, icon: Icon }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products?category=${category}&limit=4`, { cache: "no-store" });
        if (response.ok) {
          const result = await response.json();
          setProducts(result.data || []);
        }
      } catch (err) {
        console.error(`Failed to fetch ${category} products`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryProducts();
  }, [category]);

  const addToCart = async (e, product) => {
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
  };

  return (
    <section className="py-16 bg-white border-b border-gray-50/50 last:border-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Icon size={28} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{title}</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-[2rem] h-[400px]"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-gray-50 rounded-[2rem] py-16 text-center border border-gray-100">
              <p className="text-xl font-bold text-gray-500">No products available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <motion.div key={product._id} whileHover={{ y: -8 }}>
                  <Link 
                    to={`/product/${product._id}`}
                    className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(79,70,229,0.12)] transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col group h-full block"
                  >
                    <div className="relative pt-[80%] bg-gray-50 overflow-hidden m-2 rounded-[1.5rem]">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        loading="lazy"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop"; }}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-lg font-extrabold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="mt-auto pt-4 flex flex-col gap-4 border-t border-gray-50">
                        <div className="flex justify-between items-center">
                          <div className="text-left">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Deposit</span>
                            <span className="text-sm font-bold text-gray-700">{formatCurrency(product.deposit)}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Monthly</span>
                            <span className="text-2xl font-black text-indigo-600 leading-none">{formatCurrency(product.price_per_month)}</span>
                          </div>
                        </div>
                        <button 
                          disabled={product.available_units === 0}
                          onClick={(e) => addToCart(e, product)}
                          className={`w-full py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                            product.available_units === 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-600/20'
                          }`}
                        >
                          {product.available_units === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <button 
              onClick={() => navigate(`/browse?category=${category}`)}
              className="px-8 py-3.5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-600/20 transition-all flex items-center gap-2 group"
            >
              View All {category}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "Transform Your Space",
      subtitle: "Premium Furniture on Rent",
      priceHighlight: "Starting at ₹1,200/month",
      cta: "Explore Furniture",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop",
      bgGradient: "from-indigo-50 to-purple-50"
    },
    {
      title: "Upgrade Your Home",
      subtitle: "Smart Appliances for Modern Living",
      priceHighlight: "Starting at ₹900/month",
      cta: "View Appliances",
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      title: "Work From Anywhere",
      subtitle: "Ergonomic WFH Setup",
      priceHighlight: "Starting at ₹1,500/month",
      cta: "Shop WFH",
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=2069&auto=format&fit=crop",
      bgGradient: "from-emerald-50 to-teal-50"
    }
  ];

  const categories = [
    { name: 'Furniture', icon: Armchair },
    { name: 'Appliances', icon: Refrigerator },
    { name: 'Electronics', icon: MonitorPlay },
    { name: 'Fitness', icon: Dumbbell },
    { name: 'Packages', icon: Package }
  ];

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="font-sans bg-gray-50 overflow-hidden">
      {/* SECTION 1: HERO SLIDER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <section className="relative w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-lg">
          {heroSlides.map((slide, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className={`w-full h-full bg-gradient-to-br ${slide.bgGradient} flex items-center`}>
                <div className="max-w-7xl mx-auto px-8 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      <span className="inline-block px-4 py-2 bg-white/60 backdrop-blur-md rounded-full text-indigo-700 font-bold text-sm shadow-sm border border-white/50">
                        {slide.priceHighlight}
                      </span>
                      <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight">
                        {slide.title}
                      </h1>
                      <p className="text-xl md:text-2xl text-gray-600 font-medium">
                        {slide.subtitle}
                      </p>
                      <button onClick={() => navigate('/browse')} className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gray-900 rounded-2xl hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-600/30 transition-all duration-300 transform hover:-translate-y-1">
                        Rent Now
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                      </button>
                    </div>
                    <div className="hidden md:block relative h-[350px] md:h-[450px] rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-100 transform hover:scale-105 transition-transform duration-700">
                      <img src={slide.image} alt={slide.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Slider Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
            {heroSlides.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-indigo-600 w-8' : 'bg-gray-300 hover:bg-indigo-400'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-colors border border-white/50 shadow-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-colors border border-white/50 shadow-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>
        </section>
      </div>

      {/* SECTION 2: CATEGORY BAR WITH ICONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-4">
        <div className="flex overflow-x-auto space-x-6 pb-6 scrollbar-hide snap-x">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.button 
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/browse?category=${cat.name}`)}
                className="flex-shrink-0 snap-start bg-white shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 rounded-3xl px-8 py-6 flex flex-col items-center gap-3 hover:bg-indigo-600 hover:text-white transition-colors duration-300 group min-w-[140px]"
              >
                <div className="text-gray-700 group-hover:text-white transition-colors">
                  <Icon size={36} strokeWidth={2} />
                </div>
                <span className="font-extrabold text-gray-900 group-hover:text-white text-lg tracking-tight transition-colors">
                  {cat.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* DYNAMIC TOP PICKS SECTIONS */}
      <div className="bg-gray-50 flex flex-col gap-2">
        <CategorySection title="🛋️ Top Furniture Picks" category="Furniture" icon={Armchair} />
        <CategorySection title="📺 Top Electronics Picks" category="Electronics" icon={MonitorPlay} />
        <CategorySection title="🏋️ Fitness Essentials" category="Fitness" icon={Dumbbell} />
        <CategorySection title="🧊 Appliance Deals" category="Appliances" icon={Refrigerator} />
        <CategorySection title="📦 Value Packages" category="Packages" icon={Package} />
      </div>

      {/* ABOUT US */}
      <section className="py-24 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[500px]">
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" alt="About Us" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">About Our Platform</h2>
              <p className="text-xl text-gray-600 leading-relaxed font-medium mb-8">
                We believe in living light. Our platform provides high-quality furniture and appliances on rent, 
                so you can build your dream home without the heavy commitment of buying. Sustainable, affordable, 
                and hassle-free.
              </p>
              <button onClick={() => navigate('/browse')} className="inline-flex items-center px-8 py-4 bg-gray-100 text-gray-900 font-extrabold rounded-2xl hover:bg-gray-200 transition-colors">
                Start Renting
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-50 pt-20 pb-10 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg transform -rotate-12">
                  <span className="text-white font-black text-xl">R</span>
                </div>
                <span className="font-black text-2xl tracking-tighter text-gray-900">
                  RentEase<span className="text-indigo-600">.</span>
                </span>
              </div>
              <p className="text-gray-500 font-medium mb-6">
                Your premium destination for renting furniture and appliances. Live beautifully, spend smartly.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'facebook', 'instagram', 'linkedin'].map((social) => (
                  <button key={social} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:shadow-md transition-all border border-gray-100">
                    <span className="sr-only">{social}</span>
                    <div className="w-4 h-4 bg-current rounded-sm"></div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-gray-900 font-black mb-6 uppercase tracking-wider text-sm">Company</h4>
              <ul className="space-y-4">
                {['About Us', 'Careers', 'Press', 'Blog'].map(link => (
                  <li key={link}><a href="#" className="text-gray-500 hover:text-indigo-600 font-bold transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-gray-900 font-black mb-6 uppercase tracking-wider text-sm">Information</h4>
              <ul className="space-y-4">
                {['How it Works', 'Pricing', 'Refer a Friend', 'FAQs'].map(link => (
                  <li key={link}><a href="#" className="text-gray-500 hover:text-indigo-600 font-bold transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-gray-900 font-black mb-6 uppercase tracking-wider text-sm">Policies</h4>
              <ul className="space-y-4">
                {['Terms & Conditions', 'Privacy Policy', 'Cancellation Policy', 'Delivery Terms'].map(link => (
                  <li key={link}><a href="#" className="text-gray-500 hover:text-indigo-600 font-bold transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 font-bold text-sm">
              &copy; {new Date().getFullYear()} RentEase. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
              <span>hello@rentease.com</span>
              <span>&bull;</span>
              <span>+1 (800) 123-4567</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
