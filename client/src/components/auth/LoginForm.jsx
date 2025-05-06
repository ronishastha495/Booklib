import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import authService from '../../services/authService';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (formData.password.length < 1) {
      toast.error('Password is required');
      return;
    }
    setIsLoading(true);
    try {
      await authService.login(formData.email, formData.password);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed" 
      style={{ 
        backgroundImage: `url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`
      }}
    >
      <div className="bg-amber-900/80 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-3xl font-serif text-amber-100 text-center mb-6">Sign In to Booklib</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-amber-200 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-amber-800/50 text-amber-100 border border-amber-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-amber-400/50"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-amber-200 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-amber-800/50 text-amber-100 border border-amber-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-amber-400/50"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-amber-100 font-medium ${
              isLoading ? 'bg-amber-600' : 'bg-amber-700 hover:bg-amber-600'
            } transition duration-200`}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-amber-200">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-amber-100 hover:underline focus:outline-none"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;