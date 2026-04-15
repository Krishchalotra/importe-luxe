import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import api from '../services/api';
import { fetchMe } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [editingName, setEditingName] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const [newAddress, setNewAddress] = useState({
    label: '', street: '', city: '', state: '', country: 'India', zipCode: '', isDefault: false,
  });

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'IL';

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.patch('/auth/update-me', { name, phone });
      await dispatch(fetchMe());
      setEditingName(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const addresses = [...(user?.addresses || []), newAddress];
      await api.patch('/auth/update-me', { addresses });
      await dispatch(fetchMe());
      setEditingAddress(false);
      setNewAddress({ label: '', street: '', city: '', state: '', country: 'India', zipCode: '', isDefault: false });
      toast.success('Address saved');
    } catch (err) {
      toast.error('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAddress = async (index) => {
    const addresses = user.addresses.filter((_, i) => i !== index);
    try {
      await api.patch('/auth/update-me', { addresses });
      await dispatch(fetchMe());
      toast.success('Address removed');
    } catch {
      toast.error('Failed to remove address');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <div>
          <p className="text-gold-400 text-xs tracking-[0.4em] uppercase mb-2">Account</p>
          <h1 className="font-serif text-3xl text-luxury-text">My Profile</h1>
          <div className="w-16 h-px bg-gold-500 mt-4" />
        </div>

        {/* Avatar + Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-600 to-gold-400 flex items-center justify-center">
                <span className="font-serif text-2xl text-luxury-black font-bold">{initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-luxury-dark" />
            </div>

            {/* Name & Email */}
            <div className="flex-1">
              {editingName ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-1">Full Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-luxury text-sm"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs text-luxury-subtext tracking-widest uppercase block mb-1">Phone</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-luxury text-sm"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleSaveProfile} disabled={saving} className="btn-primary text-xs py-2 px-4 disabled:opacity-50">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setEditingName(false)} className="btn-outline text-xs py-2 px-4">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-serif text-xl text-luxury-text">{user?.name}</h2>
                    <span className={`text-[10px] px-2 py-0.5 tracking-widest uppercase ${user?.role === 'admin' ? 'bg-gold-500/20 text-gold-400' : 'bg-luxury-charcoal text-luxury-subtext'}`}>
                      {user?.role}
                    </span>
                  </div>
                  <p className="text-luxury-subtext text-sm mt-1">{user?.email}</p>
                  {user?.phone && <p className="text-luxury-subtext text-sm mt-0.5">{user.phone}</p>}
                  <button onClick={() => setEditingName(true)} className="text-xs text-gold-400 hover:text-gold-300 mt-3 transition-colors">
                    Edit Profile →
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Account Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-luxury p-6"
        >
          <h3 className="font-serif text-lg text-luxury-text mb-4">Account Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: user?.name },
              { label: 'Email Address', value: user?.email },
              { label: 'Phone', value: user?.phone || '—' },
              { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
              { label: 'Account Status', value: user?.isActive ? 'Active' : 'Inactive' },
              { label: 'Role', value: user?.role === 'admin' ? 'Administrator' : 'Customer' },
            ].map(({ label, value }) => (
              <div key={label} className="border-b border-luxury-border pb-3">
                <p className="text-[10px] text-luxury-subtext tracking-widest uppercase mb-1">{label}</p>
                <p className="text-sm text-luxury-text">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Saved Addresses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-luxury p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-lg text-luxury-text">Saved Addresses</h3>
            <button
              onClick={() => setEditingAddress(!editingAddress)}
              className="text-xs text-gold-400 hover:text-gold-300 transition-colors tracking-widest uppercase"
            >
              {editingAddress ? 'Cancel' : '+ Add New'}
            </button>
          </div>

          {/* Add address form */}
          {editingAddress && (
            <form onSubmit={handleAddAddress} className="mb-6 p-4 border border-gold-500/30 bg-gold-500/5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Label (Home/Work)', key: 'label', colSpan: 2 },
                  { label: 'Street Address', key: 'street', colSpan: 2 },
                  { label: 'City', key: 'city' },
                  { label: 'State', key: 'state' },
                  { label: 'Pincode', key: 'zipCode' },
                  { label: 'Country', key: 'country' },
                ].map(({ label, key, colSpan }) => (
                  <div key={key} className={colSpan === 2 ? 'sm:col-span-2' : ''}>
                    <label className="text-[10px] text-luxury-subtext tracking-widest uppercase block mb-1">{label}</label>
                    <input
                      value={newAddress[key]}
                      onChange={(e) => setNewAddress({ ...newAddress, [key]: e.target.value })}
                      required
                      className="input-luxury text-sm"
                    />
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="accent-gold-500"
                />
                <span className="text-xs text-luxury-subtext">Set as default address</span>
              </label>
              <button type="submit" disabled={saving} className="btn-primary text-xs py-2 px-5 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Address'}
              </button>
            </form>
          )}

          {/* Address list */}
          {!user?.addresses?.length ? (
            <p className="text-luxury-subtext text-sm">No saved addresses yet.</p>
          ) : (
            <div className="space-y-3">
              {user.addresses.map((addr, i) => (
                <div key={i} className={`p-4 border transition-colors ${addr.isDefault ? 'border-gold-500/50 bg-gold-500/5' : 'border-luxury-border'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm text-luxury-text font-medium capitalize">{addr.label || 'Address'}</p>
                        {addr.isDefault && (
                          <span className="text-[9px] bg-gold-500/20 text-gold-400 px-2 py-0.5 tracking-widest uppercase">Default</span>
                        )}
                      </div>
                      <p className="text-xs text-luxury-subtext">{addr.street}</p>
                      <p className="text-xs text-luxury-subtext">{addr.city}, {addr.state} — {addr.zipCode}</p>
                      <p className="text-xs text-luxury-subtext">{addr.country}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveAddress(i)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Saved Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-luxury p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-lg text-luxury-text">Saved Cards</h3>
          </div>
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-14 h-10 border-2 border-luxury-border rounded mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-luxury-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p className="text-luxury-subtext text-sm">No saved cards</p>
            <p className="text-luxury-subtext text-xs mt-1">Cards are saved securely via Stripe at checkout</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default ProfilePage;
