import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const { showError } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await login(formData);
    if (!result.success) {
      showError(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:ring-3 ${
            errors.email 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
              : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'
          }`}
          placeholder="Enter your email"
          required
        />
        {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
      </div>

      <div>
        <label htmlFor="password" className="block mb-2 font-medium text-gray-700">
          Password *
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full px-3 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:ring-3 ${
            errors.password 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
              : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'
          }`}
          placeholder="Enter your password"
          required
        />
        {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-h-[52px]"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-transparent border-t-white rounded-full animate-spin mr-2"></div>
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </button>
    </form>
  );
};

export default LoginForm;
