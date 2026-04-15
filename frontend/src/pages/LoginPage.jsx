import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading, error, clearError } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form);
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Welcome back');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-luxury-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <span className="font-display text-3xl text-gold-400 tracking-[0.2em] uppercase block">Importe</span>
            <span className="font-sans text-[10px] text-luxury-subtext tracking-[0.5em] uppercase">Luxe</span>
          </Link>
          <h1 className="font-serif text-2xl text-luxury-text mt-6 mb-2">Welcome Back</h1>
          <p className="text-sm text-luxury-subtext">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-2">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="input-luxury"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-2">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="input-luxury"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-6 disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-luxury-subtext mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-gold-400 hover:text-gold-300 transition-colors">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
