import { useState, useEffect } from 'react';
import { MagnifyingGlass, Eye } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await axios.get(`${API}/admin/orders${params}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/admin/orders/${orderId}/status?status=${newStatus}`);
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-emerald-500/20 text-emerald-400';
      case 'shipped': return 'bg-blue-500/20 text-blue-400';
      case 'processing': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
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
    <div data-testid="admin-orders">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="heading-lg">Orders</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-transparent border-zinc-800" data-testid="status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-[#0F0F11] border-zinc-800">
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {orders.length === 0 ? (
        <div className="card-surface p-8 text-center">
          <p className="body-text">No orders found</p>
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-800/30">
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Order ID</th>
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Customer</th>
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Total</th>
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Payment</th>
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20" data-testid={`order-row-${order.id}`}>
                    <td className="px-4 py-3 text-sm font-mono text-white">{order.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-white">{order.user?.name || 'N/A'}</p>
                      <p className="text-xs text-zinc-500">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">₹{order.total?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-zinc-400 capitalize">{order.payment_method}</p>
                      <p className={`text-xs ${order.payment_status === 'paid' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                        {order.payment_status}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={order.order_status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className={`w-[130px] h-8 text-xs border-0 ${getStatusColor(order.order_status)}`} data-testid={`status-select-${order.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0F0F11] border-zinc-800">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-zinc-400 hover:text-white transition-colors"
                            data-testid={`view-order-${order.id}`}
                          >
                            <Eye size={18} />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0F0F11] border-zinc-800 max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="heading-sm">Order Details</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-6 mt-4">
                              {/* Order Info */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="label-text">Order ID</p>
                                  <p className="text-sm font-mono text-white mt-1">{selectedOrder.id}</p>
                                </div>
                                <div>
                                  <p className="label-text">Date</p>
                                  <p className="text-sm text-white mt-1">
                                    {new Date(selectedOrder.created_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              {/* Customer */}
                              <div>
                                <p className="label-text mb-2">Customer</p>
                                <div className="bg-zinc-800/50 p-3">
                                  <p className="text-sm text-white">{selectedOrder.user?.name}</p>
                                  <p className="text-xs text-zinc-400">{selectedOrder.user?.email}</p>
                                </div>
                              </div>

                              {/* Address */}
                              <div>
                                <p className="label-text mb-2">Delivery Address</p>
                                <div className="bg-zinc-800/50 p-3">
                                  <p className="text-sm text-white">{selectedOrder.address?.name}</p>
                                  <p className="text-xs text-zinc-400">{selectedOrder.address?.phone}</p>
                                  <p className="text-xs text-zinc-400 mt-1">
                                    {selectedOrder.address?.address_line1}
                                    {selectedOrder.address?.address_line2 && `, ${selectedOrder.address?.address_line2}`}
                                  </p>
                                  <p className="text-xs text-zinc-400">
                                    {selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}
                                  </p>
                                </div>
                              </div>

                              {/* Items */}
                              <div>
                                <p className="label-text mb-2">Items</p>
                                <div className="space-y-2">
                                  {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 bg-zinc-800/50 p-3">
                                      <div className="w-12 h-14 bg-zinc-700 flex-shrink-0">
                                        <img
                                          src={item.product_image || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100'}
                                          alt=""
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm text-white">{item.product_name}</p>
                                        <p className="text-xs text-zinc-500">
                                          {item.color && `${item.color}`}{item.color && item.size && ' / '}{item.size && `${item.size}`}
                                          {' • '}Qty: {item.quantity}
                                        </p>
                                      </div>
                                      <p className="text-sm text-white">₹{item.item_total?.toLocaleString()}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Total */}
                              <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                                <span className="text-sm text-zinc-400">Total</span>
                                <span className="text-lg font-medium text-white">₹{selectedOrder.total?.toLocaleString()}</span>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-sm text-zinc-500 mt-4">
        Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
};
