import React, { useEffect, useState } from 'react';
import heroBg from '../assets/background.png';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchFeatured } from '../redux/slices/productSlice';
import ProductCard from '../components/common/ProductCard';
import { ProductGridSkeleton } from '../components/common/Skeleton';
import axios from 'axios';

// Map eBay item → shape ProductCard expects
const mapEbayItem = (item) => {
  const imageUrl =
    item.image?.imageUrl ||
    item.thumbnailImages?.[0]?.imageUrl ||
    '';
  return {
    _id: item.itemId,
    name: item.title,
    brand: item.seller?.username || 'eBay Seller',
    category: 'watches',
    price: Math.round(parseFloat(item.price?.value || 0) * 83),
    discountPrice: item.marketingPrice?.originalPrice
      ? Math.round(parseFloat(item.marketingPrice.originalPrice.value) * 83)
      : null,
    discountPercent: item.marketingPrice?.discountPercentage
      ? parseInt(item.marketingPrice.discountPercentage)
      : 0,
    stock: 10,
    ratingsAverage: 0,
    ratingsCount: 0,
    slug: item.itemId,
    images: [{ url: imageUrl, alt: item.title }],
    ebayUrl: item.itemWebUrl,
    condition: item.condition,
  };
};

const CATEGORIES = [
  { name: 'Watches', slug: 'watches', description: 'Precision timepieces' },
  { name: 'Perfumes', slug: 'perfumes', description: 'Rare fragrances' },
  { name: 'Jewelry', slug: 'jewelry', description: 'Fine adornments' },
  { name: 'Apparel', slug: 'apparel', description: 'Designer fashion' },
];

const HomePage = () => {
  const dispatch = useDispatch();
  const { featured, loading } = useSelector((state) => state.products);

  // eBay products state
  const [ebayProducts, setEbayProducts] = useState([]);
  const [ebayLoading, setEbayLoading] = useState(true);
  const [ebayError, setEbayError] = useState(false);
  const [activeTab, setActiveTab] = useState('ebay'); // 'ebay' | 'local'

  useEffect(() => {
    dispatch(fetchFeatured());
  }, [dispatch]);

  useEffect(() => {
    const fetchEbay = async () => {
      try {
        setEbayLoading(true);
        setEbayError(false);
        const res = await axios.get('http://localhost:5000/api/ebay/products?q=luxury+watch');
        const mapped = (res.data || []).map(mapEbayItem).filter((i) => i.price > 0);
        setEbayProducts(mapped);
      } catch (err) {
        console.error('eBay fetch error:', err);
        setEbayError(true);
      } finally {
        setEbayLoading(false);
      }
    };
    fetchEbay();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background image with blur */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url(${heroBg})`,
            filter: 'blur(2px)',
          }}
        />
        {/* Dark fade overlay */}
        <div className="absolute inset-0 bg-luxury-black/60 z-10" />
        {/* Bottom fade to black */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-luxury-black/30 to-luxury-black z-10" />
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gold-400 text-xs tracking-[0.5em] uppercase mb-6"
          >
            The Art of Luxury
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl text-white leading-none mb-8"
          >
            Importe Luxe
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-luxury-subtext text-sm md:text-base tracking-widest uppercase mb-12"
          >
            Curated luxury for the discerning few
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/products" className="btn-primary">
              Explore Collections
            </Link>
            <Link to="/products?category=watches" className="btn-outline">
              View Watches
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <p className="text-gold-400 text-xs tracking-[0.4em] uppercase mb-3">Discover</p>
          <h2 className="section-title">Our Collections</h2>
          <div className="gold-divider" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/products?category=${cat.slug}`}
                className="group block card-luxury p-8 text-center hover:border-gold-500 transition-all duration-300"
              >
                <h3 className="font-serif text-xl text-luxury-text group-hover:text-gold-400 transition-colors mb-2">
                  {cat.name}
                </h3>
                <p className="text-xs text-luxury-subtext tracking-widest uppercase">{cat.description}</p>
                <div className="w-8 h-px bg-gold-500 mx-auto mt-4 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <p className="text-gold-400 text-xs tracking-[0.4em] uppercase mb-3">Handpicked</p>
          <h2 className="section-title">Featured Pieces</h2>
          <div className="gold-divider" />
        </div>

        {/* Source Tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {[
            { key: 'ebay', label: 'Live from eBay' },
            { key: 'local', label: 'Our Collection' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-xs tracking-widest uppercase px-5 py-2.5 border transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-gold-500 text-luxury-black border-gold-500'
                  : 'border-luxury-border text-luxury-subtext hover:border-gold-500 hover:text-gold-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* eBay Products */}
        {activeTab === 'ebay' && (
          <>
            {ebayLoading ? (
              <ProductGridSkeleton count={8} />
            ) : ebayError ? (
              <div className="text-center py-16">
                <p className="text-luxury-subtext text-sm mb-2">Could not load eBay products.</p>
                <p className="text-luxury-subtext text-xs">Make sure the backend is running on port 5000.</p>
              </div>
            ) : ebayProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-luxury-subtext text-sm">No eBay products found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ebayProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="group card-luxury"
                  >
                    <a href={product.ebayUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="relative overflow-hidden aspect-[3/4] bg-luxury-charcoal">
                        <img
                          src={product.images[0]?.url?.replace('s-l225', 's-l500')}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=No+Image'; }}
                        />
                        <div className="absolute top-3 left-3 bg-gold-500/90 text-luxury-black text-[9px] font-bold px-2 py-1 tracking-wider">
                          eBay Live
                        </div>
                        {product.discountPercent > 0 && (
                          <div className="absolute top-3 right-3 bg-red-500/90 text-white text-[9px] font-bold px-2 py-1">
                            -{product.discountPercent}%
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] text-luxury-subtext tracking-widest uppercase mb-1">{product.condition || 'New'}</p>
                        <h3 className="text-sm text-luxury-text font-medium line-clamp-2 leading-snug">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-gold-400 font-medium">₹{product.price.toLocaleString('en-IN')}</p>
                          {product.discountPrice && (
                            <p className="text-luxury-subtext text-xs line-through">₹{product.discountPrice.toLocaleString('en-IN')}</p>
                          )}
                        </div>
                      </div>
                    </a>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Our Collection — also shows eBay products */}
        {activeTab === 'local' && (
          <>
            {ebayLoading ? (
              <ProductGridSkeleton count={8} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* eBay products */}
                {ebayProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="group card-luxury"
                  >
                    <a href={product.ebayUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="relative overflow-hidden aspect-[3/4] bg-luxury-charcoal">
                        <img
                          src={product.images[0]?.url?.replace('s-l225', 's-l500')}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=No+Image'; }}
                        />
                        <div className="absolute top-3 left-3 bg-gold-500/90 text-luxury-black text-[9px] font-bold px-2 py-1 tracking-wider">
                          eBay Live
                        </div>
                        {product.discountPercent > 0 && (
                          <div className="absolute top-3 right-3 bg-red-500/90 text-white text-[9px] font-bold px-2 py-1">
                            -{product.discountPercent}%
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] text-luxury-subtext tracking-widest uppercase mb-1">{product.condition || 'New'}</p>
                        <h3 className="text-sm text-luxury-text font-medium line-clamp-2 leading-snug">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-gold-400 font-medium">₹{product.price.toLocaleString('en-IN')}</p>
                          {product.discountPrice && (
                            <p className="text-luxury-subtext text-xs line-through">₹{product.discountPrice.toLocaleString('en-IN')}</p>
                          )}
                        </div>
                      </div>
                    </a>
                  </motion.div>
                ))}
                {/* Local MongoDB products */}
                {!loading && featured.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </>
        )}

        <div className="text-center mt-12">
          <Link to="/products" className="btn-outline">
            View All Collections
          </Link>
        </div>
      </section>

      {/* Brand Promise */}
      <section className="bg-luxury-dark border-y border-luxury-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { title: 'Authenticity Guaranteed', desc: 'Every piece verified by our expert team' },
              { title: 'White Glove Delivery', desc: 'Complimentary on orders over $500' },
              { title: 'Concierge Service', desc: 'Personal shopping assistance 24/7' },
            ].map((item) => (
              <div key={item.title}>
                <div className="w-px h-8 bg-gold-500 mx-auto mb-6" />
                <h3 className="font-serif text-lg text-luxury-text mb-2">{item.title}</h3>
                <p className="text-sm text-luxury-subtext">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
