import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    whatsappNumber: '',
    areasOfInterest: '',
    previousExperience: '',
    codingSkillsRating: '',
    favoriteProgrammingLanguage: '',
    favoriteLanguageReason: '',
    proudProject: '',
    debuggingProcess: ''
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

  const validateStep1 = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+?[1-9]\d{1,14}|\d{10})$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
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

  const validateStep2 = () => {
    const newErrors = {};

    // WhatsApp validation (optional)
    if (formData.whatsappNumber.trim() && !/^(\+?[1-9]\d{1,14}|\d{10})$/.test(formData.whatsappNumber.trim())) {
      newErrors.whatsappNumber = 'Please enter a valid WhatsApp number';
    }

    // Areas of Interest validation
    if (!formData.areasOfInterest.trim()) {
      newErrors.areasOfInterest = 'Please provide at least one area of interest';
    }

    // Coding Skills Rating validation
    if (!formData.codingSkillsRating) {
      newErrors.codingSkillsRating = 'Please rate your coding skills';
    } else {
      const rating = parseInt(formData.codingSkillsRating);
      if (isNaN(rating) || rating < 1 || rating > 10) {
        newErrors.codingSkillsRating = 'Rating must be between 1 and 10';
      }
    }

    // Favorite Programming Language validation
    if (!formData.favoriteProgrammingLanguage.trim()) {
      newErrors.favoriteProgrammingLanguage = 'Favorite programming language is required';
    }

    // Favorite Language Reason validation
    if (!formData.favoriteLanguageReason.trim()) {
      newErrors.favoriteLanguageReason = 'Please explain why this is your favorite language';
    } else if (formData.favoriteLanguageReason.trim().length < 10) {
      newErrors.favoriteLanguageReason = 'Please provide at least 10 characters';
    }

    // Proud Project validation
    if (!formData.proudProject.trim()) {
      newErrors.proudProject = 'Please describe a project you are proud of';
    } else if (formData.proudProject.trim().length < 20) {
      newErrors.proudProject = 'Please provide at least 20 characters';
    }

    // Debugging Process validation
    if (!formData.debuggingProcess.trim()) {
      newErrors.debuggingProcess = 'Please describe your debugging process';
    } else if (formData.debuggingProcess.trim().length < 20) {
      newErrors.debuggingProcess = 'Please provide at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      handleNext();
      return;
    }

    if (!validateStep2()) return;

    setLoading(true);
    try {
      const registrationData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        whatsappNumber: formData.whatsappNumber.trim() || undefined,
        areasOfInterest: formData.areasOfInterest.trim(),
        previousExperience: formData.previousExperience.trim() || undefined,
        codingSkillsRating: parseInt(formData.codingSkillsRating),
        favoriteProgrammingLanguage: formData.favoriteProgrammingLanguage.trim(),
        favoriteLanguageReason: formData.favoriteLanguageReason.trim(),
        proudProject: formData.proudProject.trim(),
        debuggingProcess: formData.debuggingProcess.trim(),
        role: 'student' // Default role for registration
      };

      const result = await register(registrationData);
      if (result.success) {
        showSuccess('Registration successful! Please log in to continue.');
        navigate('/login');
      } else {
        showError(result.message);
      }
    } catch (error) {
      showError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center py-16">
      <div className="max-w-6xl mx-auto px-4 w-full">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-2 text-white">Join Code Monk</h1>
            <p className="text-white/90 mb-0">Create your account and start your journey</p>
          </div>

          {/* Progress Bar */}
          <div className="bg-gray-200 h-2">
            <div 
              className="bg-blue-600 h-2 transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            ></div>
          </div>

          {/* Step Indicator */}
          <div className="flex justify-center items-center py-4 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Basic Information</h2>
                    <p className="text-gray-600 text-sm">Let's start with the basics</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fullName" className="block mb-2 font-medium text-gray-700">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`w-full px-3 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:ring-3 ${
                          errors.fullName 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                            : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'
                        }`}
                        placeholder="Enter your full name"
                        required
                      />
                      {errors.fullName && <div className="text-red-500 text-sm mt-1">{errors.fullName}</div>}
                    </div>

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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block mb-2 font-medium text-gray-700">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-3 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:ring-3 ${
                          errors.phone 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                            : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'
                        }`}
                        placeholder="Enter your phone number"
                        required
                      />
                      {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
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
                        placeholder="Create a strong password"
                        required
                      />
                      {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block mb-2 font-medium text-gray-700">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-3 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:ring-3 ${
                        errors.confirmPassword 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                          : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'
                      }`}
                      placeholder="Confirm your password"
                      required
                    />
                    {errors.confirmPassword && <div className="text-red-500 text-sm mt-1">{errors.confirmPassword}</div>}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center min-h-[52px]"
                  >
                    Next Step
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Tell Us About Yourself</h2>
                    <p className="text-gray-600 text-sm">Help us understand your coding journey</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="whatsappNumber" className="block mb-2 font-medium text-gray-700">
                        WhatsApp Number (Optional)
                      </label>
                      <input
                        type="tel"
                        id="whatsappNumber"
                        name="whatsappNumber"
                        value={formData.whatsappNumber}
                        onChange={handleChange}
                        className={`w-full px-3 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:ring-3 ${
                          errors.whatsappNumber 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                            : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'
                        }`}
                        placeholder="Enter your WhatsApp number"
                      />
                      {errors.whatsappNumber && <div className="text-red-500 text-sm mt-1">{errors.whatsappNumber}</div>}
                    </div>

                    <div>
                      <label htmlFor="codingSkillsRating" className="block mb-2 font-medium text-gray-700">
                        How would you rate your coding skills? *
                      </label>
                      <select
                        id="codingSkillsRating"
                        name="codingSkillsRating"
                        value={formData.codingSkillsRating}
                        onChange={handleChange}
                        className={`w-full px-3 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:ring-3 ${
                          errors.codingSkillsRating 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                            : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'
                        }`}
                        required
                      >
                        <option value="">Select your skill level</option>
                        <option value="1">1 - Complete Beginner</option>
                        <option value="2">2 - Novice</option>
                        <option value="3">3 - Basic</option>
                        <option value="4">4 - Below Average</option>
                        <option value="5">5 - Average</option>
                        <option value="6">6 - Above Average</option>
                        <option value="7">7 - Good</option>
                        <option value="8">8 - Very Good</option>
                        <option value="9">9 - Excellent</option>
                        <option value="10">10 - Expert</option>
                      </select>
                      {errors.codingSkillsRating && <div className="text-red-500 text-sm mt-1">{errors.codingSkillsRating}</div>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="areasOfInterest" className="block mb-2 font-medium text-gray-700">
                        Areas of Interest *
                      </label>
                      <input
                        type="text"
                        id="areasOfInterest"
                        name="areasOfInterest"
                        value={formData.areasOfInterest}
                        onChange={handleChange}
                        className={`w-full px-3 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:ring-3 ${
                          errors.areasOfInterest 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                            : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'
                        }`}
                        placeholder="e.g., Web Development, Machine Learning"
                        required
                      />
                      <small className="text-gray-500 text-xs mt-1 block">Separate multiple interests with commas</small>
                      {errors.areasOfInterest && <div className="text-red-500 text-sm mt-1">{errors.areasOfInterest}</div>}
                    </div>

                    <div>
                      <label htmlFor="favoriteProgrammingLanguage" className="block mb-2 font-medium text-gray-700">
                        What's your favorite programming language? *
                      </label>
                      <input
                        type="text"
                        id="favoriteProgrammingLanguage"
                        name="favoriteProgrammingLanguage"
                        value={formData.favoriteProgrammingLanguage}
                        onChange={handleChange}
                        className={`w-full px-3 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:ring-3 ${
                          errors.favoriteProgrammingLanguage 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                            : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'
                        }`}
                        placeholder="e.g., JavaScript, Python, Java"
                        required
                      />
                      {errors.favoriteProgrammingLanguage && <div className="text-red-500 text-sm mt-1">{errors.favoriteProgrammingLanguage}</div>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="previousExperience" className="block mb-2 font-medium text-gray-700">
                      Previous Experience (Optional)
                    </label>
                    <textarea
                      id="previousExperience"
                      name="previousExperience"
                      value={formData.previousExperience}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:ring-3 border-gray-300 focus:border-blue-600 focus:ring-blue-100"
                      placeholder="Tell us about your coding experience, projects, or skills..."
                      rows="3"
                    />
                  </div>

                  <div>
                    <label htmlFor="favoriteLanguageReason" className="block mb-2 font-medium text-gray-700">
                      Why is this your favorite language? *
                    </label>
                    <textarea
                      id="favoriteLanguageReason"
                      name="favoriteLanguageReason"
                      value={formData.favoriteLanguageReason}
                      onChange={handleChange}
                      className={`w-full px-3 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:ring-3 ${
                        errors.favoriteLanguageReason 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                          : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'
                      }`}
                      placeholder="Explain what you like about this language..."
                      rows="3"
                      required
                    />
                    {errors.favoriteLanguageReason && <div className="text-red-500 text-sm mt-1">{errors.favoriteLanguageReason}</div>}
                  </div>

                  <div>
                    <label htmlFor="proudProject" className="block mb-2 font-medium text-gray-700">
                      Describe a project you've worked on that makes you proud. What impact did it have? *
                    </label>
                    <textarea
                      id="proudProject"
                      name="proudProject"
                      value={formData.proudProject}
                      onChange={handleChange}
                      className={`w-full px-3 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:ring-3 ${
                        errors.proudProject 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                          : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'
                      }`}
                      placeholder="Tell us about a project you're proud of and its impact..."
                      rows="4"
                      required
                    />
                    {errors.proudProject && <div className="text-red-500 text-sm mt-1">{errors.proudProject}</div>}
                  </div>

                  <div>
                    <label htmlFor="debuggingProcess" className="block mb-2 font-medium text-gray-700">
                      When you encounter a bug, what's your approach to solving it? *
                    </label>
                    <textarea
                      id="debuggingProcess"
                      name="debuggingProcess"
                      value={formData.debuggingProcess}
                      onChange={handleChange}
                      className={`w-full px-3 py-3 border-2 rounded-lg text-base transition-colors focus:outline-none focus:ring-3 ${
                        errors.debuggingProcess 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100' 
                          : 'border-gray-300 focus:border-blue-600 focus:ring-blue-100'
                      }`}
                      placeholder="Describe your debugging process and methodology..."
                      rows="4"
                      required
                    />
                    {errors.debuggingProcess && <div className="text-red-500 text-sm mt-1">{errors.debuggingProcess}</div>}
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 bg-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-400 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-h-[52px]"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-transparent border-t-white rounded-full animate-spin mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </div>
              )}
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
