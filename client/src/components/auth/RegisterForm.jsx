import React, { useState } from 'react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!/^[a-zA-Z]+$/.test(formData.firstName)) {
        throw new Error('First name can only contain letters');
      }
      if (!/^[a-zA-Z]+$/.test(formData.lastName)) {
        throw new Error('Last name can only contain letters');
      }
      if (formData.firstName.length > 50 || formData.lastName.length > 50) {
        throw new Error('Names cannot exceed 50 characters');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }
      if (formData.email.length > 100) {
        throw new Error('Email cannot exceed 100 characters');
      }
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords don't match");
      }
      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      setIsLoading(true);
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
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7efe5] via-[#f5e9d4] to-[#f8f5e4] font-serif px-4">
      <div className="bg-[#fff8f0] rounded-3xl shadow-xl max-w-md w-full p-10 border border-[#e5ccb5]">
        <h2 className="text-3xl font-bold text-[#a9895a] mb-8 text-center tracking-wide">
          Create Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-[#7c5e3c] mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="John"
                className="w-full px-4 py-3 rounded-xl border border-[#e5ccb5] bg-[#f5e9d4] text-[#7c5e3c] placeholder-[#b8a57a] focus:outline-none focus:ring-2 focus:ring-[#a9895a] transition"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-[#7c5e3c] mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Doe"
                className="w-full px-4 py-3 rounded-xl border border-[#e5ccb5] bg-[#f5e9d4] text-[#7c5e3c] placeholder-[#b8a57a] focus:outline-none focus:ring-2 focus:ring-[#a9895a] transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#7c5e3c] mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border border-[#e5ccb5] bg-[#f5e9d4] text-[#7c5e3c] placeholder-[#b8a57a] focus:outline-none focus:ring-2 focus:ring-[#a9895a] transition"
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-semibold text-[#7c5e3c] mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-[#e5ccb5] bg-[#f5e9d4] text-[#7c5e3c] placeholder-[#b8a57a] focus:outline-none focus:ring-2 focus:ring-[#a9895a] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-11 text-[#a9895a] hover:text-[#7c5e3c] focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#7c5e3c] mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-[#e5ccb5] bg-[#f5e9d4] text-[#7c5e3c] placeholder-[#b8a57a] focus:outline-none focus:ring-2 focus:ring-[#a9895a] transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-11 text-[#a9895a] hover:text-[#7c5e3c] focus:outline-none"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition ${
              isLoading ? 'bg-[#b59a5a] cursor-not-allowed' : 'bg-[#a9895a] hover:bg-[#7c5e3c]'
            }`}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-[#7c5e3c] text-sm">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#a9895a] hover:underline font-semibold focus:outline-none"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;