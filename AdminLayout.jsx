import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { House, Package, ShoppingCart, Users, SignOut, List, ChartLine } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    } else if (!isAdmin) {
      toast.error('Admin access required');
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
    toast.success('Logged out');
  };

  const navItems = [
    { path: '/admin', icon: ChartLine, label: 'Dashboard', exact: true },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/users', icon: Users, label: 'Users' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050505] flex" data-testid="admin-layout">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-[#0F0F11] border-r border-zinc-800 transition-all duration-300 z-50 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
          {sidebarOpen && (
            <Link to="/admin" className="text-xl tracking-[0.2em] font-light" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              TARVEN
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-zinc-400 hover:text-white"
            data-testid="sidebar-toggle"
          >
            <List size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                isActive(item.path, item.exact)
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.icon size={20} />
              {sidebarOpen && item.label}
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
          {sidebarOpen && (
            <div className="mb-3 px-4">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800/50 transition-colors w-full ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
            data-testid="admin-logout"
          >
            <SignOut size={20} />
            {sidebarOpen && 'Logout'}
          </button>
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
            data-testid="back-to-store"
          >
            <House size={20} />
            {sidebarOpen && 'Back to Store'}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-6 lg:p-8">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};
