import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchProduct } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { selectWishlistIds } from '../redux/slices/wishlistSlice';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import api from '../services/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: product, loading } = useSelector((state) => state.products);
  const wishlistIds = useSelector(selectWishlistIds);
  const { isAuthenticated } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    dispatch(fetchProduct(id));
    setSelectedImage(0);
  }, [dispatch, id]);

  if (loading || !product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isWishlisted = wishlistIds.includes(product._id);
  const effectivePrice = product.discountPrice || product.price;

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity }));
    toast.success('Added to cart', { style: { background: '#1a1a1a', color: '#e8e8e8', border: '1px solid #2e2e2e' } });
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please sign in'); return; }
    await dispatch(toggleWishlist(product._id));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please sign in to leave a review'); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${product._id}/reviews`, reviewForm);
      toast.success('Review submitted');
      dispatch(fetchProduct(id));
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-luxury-subtext mb-8">
          <Link to="/" className="hover:text-gold-400 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gold-400 transition-colors">Collections</Link>
          <span>/</span>
          <span className="text-luxury-text capitalize">{product.category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Images */}
          <div className="space-y-4">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-luxury-charcoal overflow-hidden"
            >
              <img
                src={product.images[selectedImage]?.url}
                alt={product.images[selectedImage]?.alt || product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-gold-500' : 'border-luxury-border hover:border-luxury-subtext'
                    }`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-gold-400 text-xs tracking-widest uppercase mb-2">{product.brand}</p>
              <h1 className="font-serif text-3xl md:text-4xl text-luxury-text leading-tight">{product.name}</h1>
            </div>

            {/* Rating */}
            {product.ratingsCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className={`w-4 h-4 ${star <= Math.round(product.ratingsAverage) ? 'text-gold-400' : 'text-luxury-border'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-luxury-subtext">{product.ratingsAverage} ({product.ratingsCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl text-gold-400">₹{effectivePrice.toLocaleString('en-IN')}</span>
              {product.discountPrice && (
                <>
                  <span className="text-luxury-subtext line-through">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="text-xs bg-gold-500/20 text-gold-400 px-2 py-1">-{product.discountPercent}%</span>
                </>
              )}
            </div>

            <p className="text-luxury-subtext text-sm leading-relaxed">{product.shortDescription || product.description}</p>

            {/* Stock */}
            <p className={`text-xs tracking-widest uppercase ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </p>

            {/* Quantity + Actions */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-luxury-border">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 text-luxury-subtext hover:text-luxury-text transition-colors">−</button>
                    <span className="w-10 text-center text-luxury-text">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-10 text-luxury-subtext hover:text-luxury-text transition-colors">+</button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleAddToCart} className="btn-primary flex-1">
                    Add to Cart
                  </button>
                  <button
                    onClick={handleWishlist}
                    className={`w-12 h-12 border flex items-center justify-center transition-colors ${
                      isWishlisted ? 'border-gold-500 text-gold-400' : 'border-luxury-border text-luxury-subtext hover:border-gold-500 hover:text-gold-400'
                    }`}
                    aria-label="Toggle wishlist"
                  >
                    <svg className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Specifications */}
            {product.specifications?.length > 0 && (
              <div className="border-t border-luxury-border pt-6">
                <h3 className="text-xs text-luxury-text tracking-widest uppercase mb-4">Specifications</h3>
                <dl className="space-y-2">
                  {product.specifications.map((spec) => (
                    <div key={spec.key} className="flex gap-4 text-sm">
                      <dt className="text-luxury-subtext w-32 flex-shrink-0">{spec.key}</dt>
                      <dd className="text-luxury-text">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="border-t border-luxury-border pt-16">
          <h2 className="font-serif text-2xl text-luxury-text mb-8">Customer Reviews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Review list */}
            <div className="space-y-6">
              {product.reviews?.length === 0 ? (
                <p className="text-luxury-subtext text-sm">No reviews yet. Be the first to review.</p>
              ) : (
                product.reviews?.map((review) => (
                  <div key={review._id} className="border-b border-luxury-border pb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-luxury-charcoal rounded-full flex items-center justify-center text-xs text-gold-400 font-medium">
                        {review.name[0]}
                      </div>
                      <div>
                        <p className="text-sm text-luxury-text">{review.name}</p>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg key={s} className={`w-3 h-3 ${s <= review.rating ? 'text-gold-400' : 'text-luxury-border'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-luxury-subtext">{review.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write review */}
            {isAuthenticated && (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <h3 className="font-serif text-lg text-luxury-text">Write a Review</h3>
                <div>
                  <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                        className={`text-2xl transition-colors ${star <= reviewForm.rating ? 'text-gold-400' : 'text-luxury-border hover:text-gold-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-2">Comment</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    rows={4}
                    required
                    className="input-luxury resize-none"
                    placeholder="Share your experience..."
                  />
                </div>
                <button type="submit" disabled={submittingReview} className="btn-primary disabled:opacity-50">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
