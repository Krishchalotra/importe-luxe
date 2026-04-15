import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form);
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Account created. Welcome to Importe Luxe.');
    } else {
      toast.error(result.payload || 'Registration failed');
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
          <h1 className="font-serif text-2xl text-luxury-text mt-6 mb-2">Create Account</h1>
          <p className="text-sm text-luxury-subtext">Join the world of luxury</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your name' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'your@email.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-2">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
                className="input-luxury"
                placeholder={placeholder}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-6 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-luxury-subtext mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-gold-400 hover:text-gold-300 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
