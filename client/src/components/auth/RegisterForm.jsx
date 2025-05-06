import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import authService from '../../services/authService';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[a-zA-Z]+$/.test(formData.firstName)) {
      toast.error('First name can only contain letters');
      return;
    }
    if (!/^[a-zA-Z]+$/.test(formData.lastName)) {
      toast.error('Last name can only contain letters');
      return;
    }
    if (formData.firstName.length > 50 || formData.lastName.length > 50) {
      toast.error('Names cannot exceed 50 characters');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (formData.email.length > 100) {
      toast.error('Email cannot exceed 100 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setIsLoading(true);
    try {
      await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      toast.success('Account created successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error || 'Registration failed');
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
        <h2 className="text-3xl font-serif text-amber-100 text-center mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-amber-200 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-amber-800/50 text-amber-100 border border-amber-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-amber-400/50"
                placeholder="John"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-amber-200 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-amber-800/50 text-amber-100 border border-amber-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-amber-400/50"
                placeholder="Doe"
              />
            </div>
          </div>
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
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-amber-200 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
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
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-amber-200">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-amber-100 hover:underline focus:outline-none"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;