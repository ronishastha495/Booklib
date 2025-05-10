import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react'; // 👈 Import icons
import authService from '../../services/authService';

const LoginForm = () => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 State for toggle
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await authService.login(formData.email, formData.password, formData.role);
      toast.success('Logged in successfully');
      console.log('User role:', response.role);

      if (response.role.toLowerCase() === 'admin') {
        navigate('/admindash');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.title || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Log In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-900"
              placeholder="your@email.com"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'} // 👈 Toggle type
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-900"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition duration-200 ${
              isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-indigo-600 hover:underline focus:outline-none"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
