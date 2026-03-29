import { useState, useEffect } from 'react';
import { Users, Package, ShoppingCart, CurrencyDollar, TrendUp, ArrowRight } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Products', value: stats?.total_products || 0, icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Total Orders', value: stats?.total_orders || 0, icon: ShoppingCart, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Revenue', value: `₹${(stats?.total_revenue || 0).toLocaleString()}`, icon: CurrencyDollar, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-emerald-400';
      case 'shipped': return 'text-blue-400';
      case 'processing': return 'text-yellow-400';
      default: return 'text-zinc-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 spinner" />
      </div>
    );
  }

  return (
    <div data-testid="admin-dashboard">
      <h1 className="heading-lg mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="card-surface p-6" data-testid={`stat-${stat.label.toLowerCase().replace(' ', '-')}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="label-text mb-2">{stat.label}</p>
                <p className="text-2xl font-light text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={24} className={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Order Status */}
        <div className="card-surface p-6">
          <h2 className="heading-sm mb-6">Order Status</h2>
          <div className="space-y-4">
            {[
              { label: 'Pending', count: stats?.order_stats?.pending || 0, color: 'bg-zinc-500' },
              { label: 'Processing', count: stats?.order_stats?.processing || 0, color: 'bg-yellow-500' },
              { label: 'Shipped', count: stats?.order_stats?.shipped || 0, color: 'bg-blue-500' },
              { label: 'Delivered', count: stats?.order_stats?.delivered || 0, color: 'bg-emerald-500' },
            ].map((status) => (
              <div key={status.label} className="flex items-center gap-4">
                <div className={`w-3 h-3 ${status.color}`} />
                <span className="flex-1 text-sm text-zinc-400">{status.label}</span>
                <span className="text-sm font-medium text-white">{status.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-surface p-6">
          <h2 className="heading-sm mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/products/add"
              className="flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
              data-testid="quick-add-product"
            >
              <div className="flex items-center gap-3">
                <Package size={20} className="text-emerald-400" />
                <span className="text-sm">Add New Product</span>
              </div>
              <ArrowRight size={16} className="text-zinc-500" />
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
              data-testid="quick-view-orders"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} className="text-purple-400" />
                <span className="text-sm">Manage Orders</span>
              </div>
              <ArrowRight size={16} className="text-zinc-500" />
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
              data-testid="quick-view-users"
            >
              <div className="flex items-center gap-3">
                <Users size={20} className="text-blue-400" />
                <span className="text-sm">View Users</span>
              </div>
              <ArrowRight size={16} className="text-zinc-500" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card-surface p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="heading-sm">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-zinc-400 hover:text-white flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {stats?.recent_orders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider py-3">Order ID</th>
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider py-3">Date</th>
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider py-3">Items</th>
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider py-3">Total</th>
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders.map((order) => (
                  <tr key={order.id} className="border-b border-zinc-800/50">
                    <td className="py-3 text-sm font-mono text-white">{order.id.slice(0, 8)}...</td>
                    <td className="py-3 text-sm text-zinc-400">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3 text-sm text-zinc-400">{order.items?.length || 0} items</td>
                    <td className="py-3 text-sm text-white">₹{order.total?.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`text-xs uppercase ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-zinc-500 py-8">No recent orders</p>
        )}
      </div>
    </div>
  );
};
