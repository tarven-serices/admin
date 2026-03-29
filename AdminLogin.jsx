import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeSlash, ShieldCheck } from '@phosphor-icons/react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/admin/login`, { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('tarven_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Use the regular login to set state
      await login(email, password);
      
      toast.success('Welcome, Admin!');
      navigate('/admin');
    } catch (err) {
      const message = err.response?.data?.detail || 'Login failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4" data-testid="admin-login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-zinc-800 flex items-center justify-center">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="heading-lg mb-2">Admin Login</h1>
          <p className="body-text">Sign in to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="card-surface p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm" data-testid="admin-login-error">
              {error}
            </div>
          )}

          <div>
            <label className="label-text block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full input-field"
              placeholder="admin@tarven.com"
              required
              data-testid="admin-email-input"
            />
          </div>

          <div>
            <label className="label-text block mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full input-field pr-12"
                placeholder="Enter password"
                required
                data-testid="admin-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
            data-testid="admin-login-submit"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Default credentials: admin@tarven.com / admin123
        </p>
      </div>
    </div>
  );
};
