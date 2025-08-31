import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faPhone, 
  faIdCard, 
  faEye, 
  faEyeSlash, 
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

const RegisterWithOTP = ({ onSuccess, onSwitchToLogin }) => {
  const [step, setStep] = useState(1); // 1: Email verification, 2: Registration form
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [countdown, setCountdown] = useState(0);
  const { showSuccess, showError } = useToast();

  // Step 1: Email and OTP verification
  const [emailData, setEmailData] = useState({
    email: '',
    otp: ''
  });

  // Step 2: Registration form data
  const [formData, setFormData] = useState({
    fullName: '',
    usn: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    whatsappNumber: ''
  });

  const [errors, setErrors] = useState({});

  // Helper function to get user-friendly error messages
  const getUserFriendlyError = (error) => {
    if (!error?.response?.data) {
      return 'Something went wrong. Please try again.';
    }

    const { message, errors: validationErrors } = error.response.data;

    // Handle validation errors
    if (validationErrors && Array.isArray(validationErrors)) {
      const errorMessages = validationErrors.map(err => {
        switch (err.param || err.field) {
          case 'email':
            return 'Please enter a valid email address';
          case 'fullName':
            return 'Full name must be between 2 and 100 characters';
          case 'usn':
            return 'Please enter a valid USN (e.g., NU25MCA123)';
          case 'password':
            return 'Password must be at least 6 characters long';
          case 'phone':
            return 'Please enter a valid 10-digit phone number';
          case 'whatsappNumber':
            return 'Please enter a valid WhatsApp number';
          case 'otp':
            return 'Please enter a valid 6-digit OTP';
          default:
            return err.msg || 'Invalid input provided';
        }
      });
      return errorMessages[0]; // Show the first error
    }

    // Handle specific error messages
    switch (message) {
      case 'User already exists with this email':
        return 'This email is already registered. Try logging in instead.';
      case 'User already exists with this USN':
        return 'This USN is already registered. Please check your USN.';
      case 'Email is already registered':
        return 'This email is already registered. Try logging in instead.';
      case 'OTP not found or has expired. Please request a new one.':
        return 'Your verification code has expired. Please request a new one.';
      case 'Invalid OTP':
        return 'The verification code you entered is incorrect. Please try again.';
      case 'Too many failed attempts. Please request a new OTP.':
        return 'Too many incorrect attempts. We\'ve sent you a new verification code.';
      case 'Email not verified. Please verify your email first.':
        return 'Please verify your email address before completing registration.';
      case 'Please wait at least 1 minute before requesting another OTP':
        return 'Please wait a moment before requesting another verification code.';
      case 'Validation failed':
        return 'Please check your information and try again.';
      case 'Failed to send OTP. Please try again.':
        return 'Unable to send verification code. Please check your email address and try again.';
      default:
        return message || 'Something went wrong. Please try again.';
    }
  };

  // Start countdown timer for resend OTP
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const sendOTP = async () => {
    if (!emailData.email) {
      setErrors({ email: 'Please enter your email address' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/otp/send-otp', {
        email: emailData.email,
        name: formData.fullName || 'User'
      });

      if (response.data.success) {
        setOtpSent(true);
        startCountdown();
        showSuccess('📧 Verification code sent to your email!');
      }
    } catch (error) {
      const friendlyError = getUserFriendlyError(error);
      showError(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!emailData.otp) {
      setErrors({ otp: 'Please enter the verification code' });
      return;
    }

    if (emailData.otp.length !== 6) {
      setErrors({ otp: 'Verification code must be 6 digits' });
      return;
    }

    if (!/^\d+$/.test(emailData.otp)) {
      setErrors({ otp: 'Verification code should contain only numbers' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/otp/verify-otp', {
        email: emailData.email,
        otp: emailData.otp
      });

      if (response.data.success) {
        setOtpVerified(true);
        setVerificationToken(response.data.data.verificationToken);
        setFormData(prev => ({ ...prev, email: emailData.email }));
        setStep(2);
        showSuccess('✅ Email verified successfully! Complete your registration below.');
      }
    } catch (error) {
      const friendlyError = getUserFriendlyError(error);
      showError(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/otp/resend-otp', {
        email: emailData.email,
        name: formData.fullName || 'User'
      });

      if (response.data.success) {
        startCountdown();
        showSuccess('📧 New verification code sent to your email!');
      }
    } catch (error) {
      const friendlyError = getUserFriendlyError(error);
      showError(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Enhanced form validation with user-friendly messages
    const newErrors = {};
    
    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Please enter your full name';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters long';
    }
    
    if (!formData.usn?.trim()) {
      newErrors.usn = 'Please enter your USN';
    } else {
      const usnRegex = /^(NU25MCA|NU24MCA|NNM24MC|NNM25MC)(\d{1,3})$/i;
      if (!usnRegex.test(formData.usn.trim())) {
        newErrors.usn = 'Please enter a valid USN (e.g., NU25MCA123)';
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Please create a password';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Please enter your phone number';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (formData.whatsappNumber?.trim() && !/^[6-9]\d{9}$/.test(formData.whatsappNumber.trim())) {
      newErrors.whatsappNumber = 'Please enter a valid WhatsApp number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showError('Please fix the highlighted fields above');
      return;
    }

    setIsLoading(true);
    try {
      const registrationData = {
        ...formData,
        fullName: formData.fullName.trim(),
        usn: formData.usn.trim().toUpperCase(),
        phone: formData.phone.trim(),
        whatsappNumber: formData.whatsappNumber?.trim() || undefined,
        verificationToken
      };

      const response = await api.post('/auth/register', registrationData);
      
      if (response.data.success) {
        showSuccess('🎉 Registration successful! Please login to continue.');
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      const friendlyError = getUserFriendlyError(error);
      showError(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="email-verification"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faEnvelope} className="text-white text-2xl" />
                </motion.div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Verify Your Email
                </h2>
                <p className="text-gray-600 mt-2">
                  Enter your email to receive verification code
                </p>
              </div>

              {!otpSent ? (
                <div className="space-y-4">
                  <div>
                    <div className="relative">
                      <FontAwesomeIcon 
                        icon={faEnvelope} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter your email address"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={emailData.email}
                        onChange={handleEmailChange}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={sendOTP}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    ) : null}
                    {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl mb-2" />
                    <p className="text-sm text-gray-600">
                      OTP sent to <strong>{emailData.email}</strong>
                    </p>
                  </div>

                  <div>
                    <div className="relative">
                      <FontAwesomeIcon 
                        icon={faLock} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                      />
                      <input
                        type="text"
                        name="otp"
                        placeholder="Enter 6-digit OTP"
                        maxLength="6"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest ${
                          errors.otp ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={emailData.otp}
                        onChange={handleEmailChange}
                      />
                    </div>
                    {errors.otp && (
                      <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={verifyOTP}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    ) : null}
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </motion.button>

                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-gray-500 text-sm">
                        <FontAwesomeIcon icon={faClock} className="mr-1" />
                        Resend OTP in {countdown}s
                      </p>
                    ) : (
                      <button
                        onClick={resendOTP}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="text-center mt-6">
                <p className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={onSwitchToLogin}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </motion.div>
          ) : (
            // Step 2: Registration Form
            <motion.div
              key="registration-form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faUser} className="text-white text-2xl" />
                </motion.div>
                <div className="flex items-center justify-center mb-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-sm mr-2" />
                  <span className="text-sm text-green-600 font-medium">Email Verified</span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Complete Registration
                </h2>
                <p className="text-gray-600 mt-2">
                  Fill in your details to join Code Monk
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name */}
                <div>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faUser} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.fullName}
                      onChange={handleFormChange}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* USN */}
                <div>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faIdCard} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    />
                    <input
                      type="text"
                      name="usn"
                      placeholder="USN (e.g., NU25MCA123)"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.usn ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.usn}
                      onChange={handleFormChange}
                    />
                  </div>
                  {errors.usn && (
                    <p className="text-red-500 text-sm mt-1">{errors.usn}</p>
                  )}
                </div>

                {/* Email (read-only, already verified) */}
                <div>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faEnvelope} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" 
                    />
                    <input
                      type="email"
                      name="email"
                      className="w-full pl-10 pr-4 py-3 border border-green-300 bg-green-50 rounded-lg cursor-not-allowed"
                      value={formData.email}
                      readOnly
                    />
                    <FontAwesomeIcon 
                      icon={faCheckCircle} 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" 
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faLock} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Password"
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.password}
                      onChange={handleFormChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faLock} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faPhone} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      value={formData.phone}
                      onChange={handleFormChange}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* WhatsApp Number (Optional) */}
                <div>
                  <div className="relative">
                    <FontAwesomeIcon 
                      icon={faPhone} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    />
                    <input
                      type="tel"
                      name="whatsappNumber"
                      placeholder="WhatsApp Number (Optional)"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.whatsappNumber}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  ) : null}
                  {isLoading ? 'Creating Account...' : 'Complete Registration'}
                </motion.button>
              </form>

              <div className="text-center mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  ← Back to email verification
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RegisterWithOTP;
