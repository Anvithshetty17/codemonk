import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    usn: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: '',
    section: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { isAuthenticated, register } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/login';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // USN validation
    if (!formData.usn.trim()) {
      newErrors.usn = 'USN is required';
    } else if (formData.usn.trim().length < 10) {
      newErrors.usn = 'Please enter a valid USN';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // WhatsApp number validation (optional)
    if (formData.whatsappNumber.trim() && !/^[6-9]\d{9}$/.test(formData.whatsappNumber.trim())) {
      newErrors.whatsappNumber = 'Please enter a valid 10-digit WhatsApp number';
    }

    // Section validation
    if (!formData.section.trim()) {
      newErrors.section = 'Section is required';
    } else if (!['A', 'B', 'C'].includes(formData.section.toUpperCase())) {
      newErrors.section = 'Please select a valid section (A, B, or C)';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const registrationData = {
        fullName: formData.fullName.trim(),
        usn: formData.usn.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phoneNumber.trim(),
        whatsappNumber: formData.whatsappNumber.trim() || formData.phoneNumber.trim(),
        section: formData.section.toUpperCase(),
        password: formData.password
      };

      const result = await register(registrationData);
      
      if (result.success) {
        showSuccess('Registration successful! Please login to continue.');
        navigate('/login');
      } else {
        showError(result.message || 'Registration failed');
      }
    } catch (error) {
      showError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center py-16">
      <div className="max-w-6xl mx-auto px-4 w-full">
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-2 text-white">Join Code Monk</h1>
            <p className="text-white/90 mb-0">Create your account to get started</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
              </div>

              {/* USN */}
              <div>
                <label htmlFor="usn" className="block text-sm font-medium text-gray-700 mb-2">
                  USN *
                </label>
                <input
                  type="text"
                  id="usn"
                  name="usn"
                  value={formData.usn}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.usn ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your USN"
                />
                {errors.usn && <p className="mt-1 text-sm text-red-600">{errors.usn}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your phone number"
                />
                {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
              </div>

              {/* WhatsApp Number */}
              <div>
                <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="tel"
                  id="whatsappNumber"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.whatsappNumber ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your WhatsApp number (if different from phone)"
                />
                {errors.whatsappNumber && <p className="mt-1 text-sm text-red-600">{errors.whatsappNumber}</p>}
              </div>

              {/* Section */}
              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
                  Section *
                </label>
                <select
                  id="section"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.section ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select your section</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
                {errors.section && <p className="mt-1 text-sm text-red-600">{errors.section}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Create a password"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
