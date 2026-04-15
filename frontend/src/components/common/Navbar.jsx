import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleCart, toggleMobileMenu } from '../../redux/slices/uiSlice';
import { logout } from '../../redux/slices/authSlice';
import { selectCartCount } from '../../redux/slices/cartSlice';
import useAuth from '../../hooks/useAuth';

const NAV_LINKS = [
  { label: 'Collections', path: '/products' },
  { label: 'Watches', path: '/products?category=watches' },
  { label: 'Perfumes', path: '/products?category=perfumes' },
  { label: 'Apparel', path: '/products?category=apparel' },
  { label: 'Jewelry', path: '/products?category=jewelry' },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector((state) => state.wishlist.items.length);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-luxury-black/95 backdrop-blur-md border-b border-luxury-border' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-start">
            <span className="font-display text-2xl text-gold-400 tracking-[0.2em] uppercase">
              Importe
            </span>
            <span className="font-sans text-[10px] text-luxury-subtext tracking-[0.5em] uppercase -mt-1">
              Luxe
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="text-luxury-subtext hover:text-gold-400 text-xs tracking-widest uppercase transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-5">
            {/* Search */}
            <Link to="/search" className="text-luxury-subtext hover:text-gold-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link to="/wishlist" className="relative text-luxury-subtext hover:text-gold-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold-500 text-luxury-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative text-luxury-subtext hover:text-gold-400 transition-colors"
              aria-label="Open cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold-500 text-luxury-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="text-luxury-subtext hover:text-gold-400 transition-colors"
                  aria-label="User menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-luxury-dark border border-luxury-border shadow-xl"
                    >
                      <div className="px-4 py-3 border-b border-luxury-border">
                        <p className="text-xs text-luxury-subtext">Signed in as</p>
                        <p className="text-sm text-luxury-text truncate">{user?.name}</p>
                      </div>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-luxury-subtext hover:text-gold-400 hover:bg-luxury-charcoal transition-colors">
                        My Profile
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-luxury-subtext hover:text-gold-400 hover:bg-luxury-charcoal transition-colors">
                        My Orders
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-gold-400 hover:bg-luxury-charcoal transition-colors">
                          Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-luxury-subtext hover:text-red-400 hover:bg-luxury-charcoal transition-colors border-t border-luxury-border">
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-outline text-[10px] py-2 px-4">
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="lg:hidden text-luxury-subtext hover:text-gold-400"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
