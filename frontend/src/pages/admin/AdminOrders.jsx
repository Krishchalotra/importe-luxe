import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  pending: 'text-yellow-400', confirmed: 'text-blue-400', processing: 'text-purple-400',
  shipped: 'text-cyan-400', delivered: 'text-green-400', cancelled: 'text-red-400',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders?sort=-createdAt&limit=50');
      setOrders(res.data.data.orders);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setUpdating(null); }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-luxury-text">Orders</h1>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded" />)}</div>
      ) : (
        <div className="card-luxury overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-luxury-border">
              <tr>
                {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-luxury-subtext tracking-widest uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-luxury-charcoal transition-colors">
                  <td className="px-4 py-3 text-luxury-text font-mono text-xs">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="text-luxury-text">{order.user?.name}</p>
                    <p className="text-xs text-luxury-subtext">{order.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-luxury-subtext">{order.items.length}</td>
                  <td className="px-4 py-3 text-gold-400">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs capitalize ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3 text-luxury-subtext text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <select
                      value=""
                      onChange={(e) => e.target.value && handleStatusUpdate(order._id, e.target.value)}
                      disabled={updating === order._id || ['delivered', 'cancelled'].includes(order.status)}
                      className="bg-luxury-charcoal border border-luxury-border text-luxury-subtext text-xs px-2 py-1 focus:outline-none focus:border-gold-500 disabled:opacity-40"
                    >
                      <option value="">Update</option>
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
