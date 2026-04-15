import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ProductGridSkeleton } from '../components/common/Skeleton';
import useDebounce from '../hooks/useDebounce';

const CATEGORIES = ['watches', 'perfumes', 'apparel', 'accessories', 'jewelry', 'handbags', 'footwear'];

const EBAY_QUERIES = {
  watches: 'luxury watch',
  perfumes: 'luxury perfume',
  apparel: 'designer clothing luxury',
  accessories: 'luxury accessories',
  jewelry: 'fine jewelry diamond',
  handbags: 'designer handbag luxury',
  footwear: 'luxury shoes designer',
  '': 'luxury fashion watches perfume jewelry',
};

const SORT_OPTIONS = [
  { label: 'Default', value: 'default' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

// Map eBay item to display card shape
const mapEbayItem = (item, category) => {
  const imageUrl = item.image?.imageUrl || item.thumbnailImages?.[0]?.imageUrl || '';
  const price = Math.round(parseFloat(item.price?.value || 0) * 83);
  const originalPrice = item.marketingPrice?.originalPrice
    ? Math.round(parseFloat(item.marketingPrice.originalPrice.value) * 83)
    : null;
  const discountPercent = item.marketingPrice?.discountPercentage
    ? parseInt(item.marketingPrice.discountPercentage)
    : 0;

  return {
    itemId: item.itemId,
    title: item.title,
    imageUrl,
    price,
    originalPrice,
    discountPercent,
    condition: item.condition || 'New',
    ebayUrl: item.itemWebUrl,
    seller: item.seller?.username || 'eBay Seller',
    category: category || 'watches',
  };
};

const EbayProductCard = ({ product }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    transition={{ duration: 0.3 }}
    className="group card-luxury"
  >
    <a href={product.ebayUrl} target="_blank" rel="noopener noreferrer" className="block">
      <div className="relative overflow-hidden aspect-[3/4] bg-luxury-charcoal">
        <img
          src={product.imageUrl?.replace('s-l225', 's-l500')}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=No+Image'; }}
        />
        <span className="absolute top-3 left-3 bg-gold-500/90 text-luxury-black text-[9px] font-bold px-2 py-1 tracking-wider">
          eBay Live
        </span>
        {product.discountPercent > 0 && (
          <span className="absolute top-3 right-3 bg-red-500/90 text-white text-[9px] font-bold px-2 py-1">
            -{product.discountPercent}%
          </span>
        )}
        {/* Quick view overlay */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="w-full bg-gold-500 hover:bg-gold-400 text-luxury-black text-[10px] font-bold tracking-widest uppercase py-3 text-center transition-colors">
            View on eBay
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-[10px] text-luxury-subtext tracking-widest uppercase mb-1 capitalize">{product.category}</p>
        <h3 className="text-sm text-luxury-text font-medium line-clamp-2 leading-snug">{product.title}</h3>
        <p className="text-[10px] text-luxury-subtext mt-1">{product.condition}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-gold-400 font-medium">₹{product.price.toLocaleString('en-IN')}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-luxury-subtext text-xs line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
    </a>
  </motion.div>
);

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState('default');
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 500);

  const category = searchParams.get('category') || '';
  const urlSearch = searchParams.get('search') || '';

  // Sync URL search param into input on navigation from navbar
  useEffect(() => {
    if (urlSearch) setSearchInput(urlSearch);
  }, [urlSearch]);

  const fetchEbayProducts = useCallback(async (query) => {
    setLoading(true);
    setError(false);
    try {
      const res = await axios.get(`http://localhost:5000/api/ebay/products?q=${encodeURIComponent(query)}`);
      const mapped = (res.data || [])
        .map((item) => mapEbayItem(item, category || 'watches'))
        .filter((p) => p.price > 0);
      setProducts(mapped);
    } catch (err) {
      console.error('eBay fetch error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    // Priority: typed search > URL search param > category default
    const query = debouncedSearch || urlSearch || EBAY_QUERIES[category] || EBAY_QUERIES[''];
    fetchEbayProducts(query);
  }, [category, debouncedSearch, urlSearch, fetchEbayProducts]);

  const handleCategoryChange = (cat) => {
    setSearchParams(cat ? { category: cat } : {});
    setSearchInput('');
  };

  // Sort products client-side
  const sortedProducts = [...products].sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12">
          <p className="text-gold-400 text-xs tracking-[0.4em] uppercase mb-2">Explore</p>
          <h1 className="section-title">
            {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Collections'}
          </h1>
          <div className="gold-divider mx-0 mt-4" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="sticky top-28 space-y-8">

              {/* Search */}
              <div>
                <h3 className="text-xs text-luxury-text tracking-widest uppercase mb-3">Search</h3>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search eBay products..."
                  className="input-luxury text-sm"
                />
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-xs text-luxury-text tracking-widest uppercase mb-3">Category</h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => handleCategoryChange('')}
                      className={`text-sm w-full text-left py-1 transition-colors ${!category ? 'text-gold-400' : 'text-luxury-subtext hover:text-luxury-text'}`}
                    >
                      All
                    </button>
                  </li>
                  {CATEGORIES.map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => handleCategoryChange(cat)}
                        className={`text-sm w-full text-left py-1 capitalize transition-colors ${category === cat ? 'text-gold-400' : 'text-luxury-subtext hover:text-luxury-text'}`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-xs text-luxury-text tracking-widest uppercase mb-3">Sort By</h3>
                <ul className="space-y-1">
                  {SORT_OPTIONS.map((opt) => (
                    <li key={opt.value}>
                      <button
                        onClick={() => setSort(opt.value)}
                        className={`text-sm w-full text-left py-1 transition-colors ${sort === opt.value ? 'text-gold-400' : 'text-luxury-subtext hover:text-luxury-text'}`}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : error ? (
              <div className="text-center py-24">
                <p className="text-luxury-subtext mb-2">Could not load products from eBay.</p>
                <button onClick={() => fetchEbayProducts(debouncedSearch || urlSearch || EBAY_QUERIES[category] || EBAY_QUERIES[''])} className="btn-outline mt-4">
                  Retry
                </button>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-luxury-subtext">No products found.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-sm text-luxury-subtext">
                    {sortedProducts.length} products from eBay
                  </p>
                  <span className="text-xs text-gold-400 border border-gold-500/30 px-3 py-1">
                    Live Prices
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {sortedProducts.map((product) => (
                    <EbayProductCard key={product.itemId} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
