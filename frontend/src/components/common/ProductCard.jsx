import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { selectWishlistIds } from '../../redux/slices/wishlistSlice';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const wishlistIds = useSelector(selectWishlistIds);
  const isWishlisted = wishlistIds.includes(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success('Added to cart', { style: { background: '#1a1a1a', color: '#e8e8e8', border: '1px solid #2e2e2e' } });
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to save items');
      return;
    }
    await dispatch(toggleWishlist(product._id));
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', {
      style: { background: '#1a1a1a', color: '#e8e8e8', border: '1px solid #2e2e2e' },
    });
  };

  const effectivePrice = product.discountPrice || product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group card-luxury"
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/4] bg-luxury-charcoal">
          <img
            src={product.images[0]?.url}
            alt={product.images[0]?.alt || product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Discount badge */}
          {product.discountPercent > 0 && (
            <span className="absolute top-3 left-3 bg-gold-500 text-luxury-black text-[10px] font-bold px-2 py-1 tracking-wider">
              -{product.discountPercent}%
            </span>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-luxury-black/60 flex items-center justify-center">
              <span className="text-luxury-subtext text-xs tracking-widest uppercase">Out of Stock</span>
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-8 h-8 bg-luxury-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-luxury-black"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg
              className={`w-4 h-4 transition-colors ${isWishlisted ? 'text-gold-400 fill-gold-400' : 'text-luxury-text'}`}
              fill={isWishlisted ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Quick add */}
          {product.stock > 0 && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                className="w-full bg-gold-500 hover:bg-gold-400 text-luxury-black text-[10px] font-bold tracking-widest uppercase py-3 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[10px] text-luxury-subtext tracking-widest uppercase mb-1">{product.brand}</p>
          <h3 className="text-sm text-luxury-text font-medium line-clamp-2 leading-snug">{product.name}</h3>

          {/* Rating */}
          {product.ratingsCount > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-3 h-3 ${star <= Math.round(product.ratingsAverage) ? 'text-gold-400' : 'text-luxury-border'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[10px] text-luxury-subtext">({product.ratingsCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-gold-400 font-medium">₹{effectivePrice.toLocaleString('en-IN')}</span>
            {product.discountPrice && (
              <span className="text-luxury-subtext text-xs line-through">₹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
