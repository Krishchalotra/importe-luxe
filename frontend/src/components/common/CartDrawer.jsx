import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { setCartOpen } from '../../redux/slices/uiSlice';
import { removeFromCart, updateQuantity, selectCartItems, selectCartTotal } from '../../redux/slices/cartSlice';

const CartDrawer = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.cartOpen);
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(setCartOpen(false))}
            className="fixed inset-0 bg-black/70 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-luxury-dark border-l border-luxury-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-luxury-border">
              <h2 className="font-serif text-xl text-luxury-text tracking-wide">Your Cart</h2>
              <button
                onClick={() => dispatch(setCartOpen(false))}
                className="text-luxury-subtext hover:text-luxury-text transition-colors"
                aria-label="Close cart"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg className="w-16 h-16 text-luxury-border mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-luxury-subtext text-sm">Your cart is empty</p>
                  <button
                    onClick={() => dispatch(setCartOpen(false))}
                    className="mt-4 btn-outline text-xs"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.product._id} className="flex gap-4 py-4 border-b border-luxury-border">
                    <img
                      src={item.product.images[0]?.url}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-luxury-text font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-luxury-subtext mt-1">{item.product.brand}</p>
                      <p className="text-gold-400 text-sm mt-1">
                        ₹{(item.product.discountPrice || item.product.price).toLocaleString('en-IN')}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => dispatch(updateQuantity({ productId: item.product._id, quantity: item.quantity - 1 }))}
                          className="w-6 h-6 border border-luxury-border text-luxury-subtext hover:border-gold-500 hover:text-gold-400 flex items-center justify-center text-sm transition-colors"
                        >
                          −
                        </button>
                        <span className="text-sm text-luxury-text w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => dispatch(updateQuantity({ productId: item.product._id, quantity: item.quantity + 1 }))}
                          className="w-6 h-6 border border-luxury-border text-luxury-subtext hover:border-gold-500 hover:text-gold-400 flex items-center justify-center text-sm transition-colors"
                        >
                          +
                        </button>
                        <button
                          onClick={() => dispatch(removeFromCart(item.product._id))}
                          className="ml-auto text-luxury-subtext hover:text-red-400 transition-colors"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-luxury-border space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-luxury-subtext">Subtotal</span>
                  <span className="text-luxury-text font-medium">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-luxury-subtext">Shipping and taxes calculated at checkout</p>
                <Link
                  to="/checkout"
                  onClick={() => dispatch(setCartOpen(false))}
                  className="btn-primary w-full text-center block"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
