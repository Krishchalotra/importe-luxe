import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../redux/slices/orderSlice';

const STATUS_COLORS = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  confirmed: 'text-blue-400 bg-blue-400/10',
  processing: 'text-purple-400 bg-purple-400/10',
  shipped: 'text-cyan-400 bg-cyan-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
  refunded: 'text-orange-400 bg-orange-400/10',
};

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { items: orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl text-luxury-text mb-10">My Orders</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-luxury-subtext mb-4">No orders yet</p>
            <Link to="/products" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="card-luxury p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gold-600 transition-colors block"
              >
                <div>
                  <p className="text-xs text-luxury-subtext mb-1">{order.orderNumber}</p>
                  <p className="text-sm text-luxury-text">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                  <p className="text-xs text-luxury-subtext mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                  <span className="text-gold-400 font-medium">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
