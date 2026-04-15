import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../../services/api';
import toast from 'react-hot-toast';
const StatCard = ({ title, value, sub, color = 'text-gold-400' }) => (
  <div className="card-luxury p-6">
    <p className="text-xs text-luxury-subtext tracking-widest uppercase mb-2">{title}</p>
    <p className={`font-serif text-3xl ${color}`}>{value}</p>
    {sub && <p className="text-xs text-luxury-subtext mt-1">{sub}</p>}
  </div>
);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const handleEbaySync = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/ebay/sync?limit=8');
      const results = res.data.data;
      const total = Object.values(results).reduce((sum, r) => sum + (r.created || 0), 0);
      toast.success(`eBay sync complete — ${total} products updated`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'eBay sync failed. Check your API credentials.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { overview, revenueByMonth, topProducts, recentOrders, ordersByStatus } = stats;

  const chartData = revenueByMonth.map((d) => ({
    month: MONTH_NAMES[d._id.month - 1],
    revenue: d.revenue,
    orders: d.orders,
  }));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-serif text-3xl text-luxury-text">Dashboard</h1>
          <p className="text-luxury-subtext text-sm mt-1">Overview of your store performance</p>
        </div>
        <button
          onClick={handleEbaySync}
          disabled={syncing}
          className="flex items-center gap-2 bg-gold-500/10 border border-gold-500/40 hover:border-gold-500 text-gold-400 text-xs tracking-widest uppercase px-4 py-2.5 transition-all duration-200 disabled:opacity-50"
        >
          {syncing ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Syncing...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync eBay Products
            </>
          )}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`₹${overview.totalRevenue.toLocaleString('en-IN')}`} sub={`₹${overview.monthRevenue.toLocaleString('en-IN')} this month`} />
        <StatCard title="Total Orders" value={overview.totalOrders.toLocaleString()} sub={`${overview.monthOrders} this month`} color="text-blue-400" />
        <StatCard title="Total Users" value={overview.totalUsers.toLocaleString()} sub={`${overview.monthUsers} new this month`} color="text-purple-400" />
        <StatCard title="Products" value={overview.totalProducts.toLocaleString()} sub={`${overview.lowStockProducts} low stock`} color="text-green-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-luxury p-6">
          <h2 className="font-serif text-lg text-luxury-text mb-6">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
              <XAxis dataKey="month" tick={{ fill: '#9a9a9a', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9a9a9a', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', color: '#e8e8e8' }}
                formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#c9960f" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card-luxury p-6">
          <h2 className="font-serif text-lg text-luxury-text mb-6">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ordersByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
              <XAxis dataKey="_id" tick={{ fill: '#9a9a9a', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9a9a9a', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', color: '#e8e8e8' }} />
              <Bar dataKey="count" fill="#c9960f" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-luxury p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-lg text-luxury-text">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-gold-400 hover:text-gold-300 tracking-widest uppercase">View All</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex justify-between items-center py-2 border-b border-luxury-border last:border-0">
                <div>
                  <p className="text-xs text-luxury-text">{order.orderNumber}</p>
                  <p className="text-xs text-luxury-subtext">{order.user?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gold-400">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-luxury-subtext capitalize">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-luxury p-6">
          <h2 className="font-serif text-lg text-luxury-text mb-4">Top Products</h2>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={product._id} className="flex items-center gap-3 py-2 border-b border-luxury-border last:border-0">
                <span className="text-xs text-luxury-subtext w-4">{i + 1}</span>
                <img src={product.images[0]?.url} alt={product.name} className="w-10 h-10 object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-luxury-text truncate">{product.name}</p>
                  <p className="text-xs text-luxury-subtext">{product.soldCount} sold</p>
                </div>
                <p className="text-xs text-gold-400">₹{product.price.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
