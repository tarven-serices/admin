import { useState, useEffect } from 'react';
import { MagnifyingGlass, Eye, Trash } from '@phosphor-icons/react';
import axios from 'axios';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../../components/ui/dialog';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(`${API}/admin/users/${userId}`);
      setUserDetails(response.data);
    } catch (error) {
      toast.error('Failed to load user details');
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      toast.success('User deleted');
      setDeleteDialog({ open: false, user: null });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 spinner" />
      </div>
    );
  }

  return (
    <div data-testid="admin-users">
      <h1 className="heading-lg mb-8">Users</h1>

      {/* Search */}
      <div className="card-surface p-4 mb-6">
        <div className="relative">
          <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full input-field pl-12"
            data-testid="user-search"
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="card-surface p-8 text-center">
          <p className="body-text">No users found</p>
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-800/30">
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">User</th>
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Email</th>
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Phone</th>
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Role</th>
                  <th className="text-left text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Joined</th>
                  <th className="text-right text-xs text-zinc-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20" data-testid={`user-row-${user.id}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-800 flex items-center justify-center text-lg text-zinc-500 flex-shrink-0">
                          {user.profile_image ? (
                            <img
                              src={`${process.env.REACT_APP_BACKEND_URL}${user.profile_image}`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="text-sm font-medium text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-zinc-400">{user.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs tracking-wider uppercase px-2 py-1 ${
                        user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      {new Date(user.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* View User */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                fetchUserDetails(user.id);
                              }}
                              className="p-2 text-zinc-400 hover:text-white transition-colors"
                              data-testid={`view-user-${user.id}`}
                            >
                              <Eye size={18} />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#0F0F11] border-zinc-800 max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="heading-sm">User Details</DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-6 mt-4">
                                {/* User Info */}
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 bg-zinc-800 flex items-center justify-center text-2xl text-zinc-500">
                                    {selectedUser.profile_image ? (
                                      <img
                                        src={`${process.env.REACT_APP_BACKEND_URL}${selectedUser.profile_image}`}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      selectedUser.name?.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-lg font-medium text-white">{selectedUser.name}</p>
                                    <p className="text-sm text-zinc-400">{selectedUser.email}</p>
                                    {selectedUser.phone && (
                                      <p className="text-sm text-zinc-400">{selectedUser.phone}</p>
                                    )}
                                  </div>
                                </div>

                                {/* Addresses */}
                                {userDetails?.addresses?.length > 0 && (
                                  <div>
                                    <p className="label-text mb-2">Addresses ({userDetails.addresses.length})</p>
                                    <div className="space-y-2">
                                      {userDetails.addresses.map((addr) => (
                                        <div key={addr.id} className="bg-zinc-800/50 p-3 text-sm">
                                          <p className="text-white">{addr.name} - {addr.phone}</p>
                                          <p className="text-zinc-400">
                                            {addr.address_line1}, {addr.city}, {addr.state} - {addr.pincode}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Orders */}
                                {userDetails?.orders?.length > 0 && (
                                  <div>
                                    <p className="label-text mb-2">Orders ({userDetails.orders.length})</p>
                                    <div className="space-y-2">
                                      {userDetails.orders.slice(0, 5).map((order) => (
                                        <div key={order.id} className="bg-zinc-800/50 p-3 flex justify-between items-center">
                                          <div>
                                            <p className="text-sm font-mono text-white">{order.id.slice(0, 8)}...</p>
                                            <p className="text-xs text-zinc-500">
                                              {new Date(order.created_at).toLocaleDateString()} - {order.items?.length} items
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-sm text-white">₹{order.total?.toLocaleString()}</p>
                                            <p className={`text-xs capitalize ${
                                              order.order_status === 'delivered' ? 'text-emerald-400' : 'text-zinc-400'
                                            }`}>
                                              {order.order_status}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Delete User (not for admins) */}
                        {user.role !== 'admin' && (
                          <Dialog open={deleteDialog.open && deleteDialog.user?.id === user.id} onOpenChange={(open) => setDeleteDialog({ open, user: open ? user : null })}>
                            <DialogTrigger asChild>
                              <button
                                className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                                data-testid={`delete-user-${user.id}`}
                              >
                                <Trash size={18} />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#0F0F11] border-zinc-800 max-w-sm">
                              <DialogHeader>
                                <DialogTitle className="heading-sm">Delete User</DialogTitle>
                              </DialogHeader>
                              <p className="body-text my-4">
                                Are you sure you want to delete "{user.name}"? This will also delete all their addresses, cart, and wishlist.
                              </p>
                              <div className="flex gap-3">
                                <DialogClose asChild>
                                  <button className="flex-1 btn-secondary">Cancel</button>
                                </DialogClose>
                                <button
                                  onClick={() => handleDelete(user.id)}
                                  className="flex-1 bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600 transition-colors"
                                  data-testid="confirm-delete-user"
                                >
                                  Delete
                                </button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-sm text-zinc-500 mt-4">
        Showing {filteredUsers.length} of {users.length} users
      </p>
    </div>
  );
};
