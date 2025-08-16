import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const RegisterForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
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
  const { register } = useAuth();
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

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+?[1-9]\d{1,14}|\d{10})$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

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
        debuggingProcess: formData.debuggingProcess.trim()
      };

      const result = await register(registrationData);
      if (result.success) {
        onSuccess();
      } else {
        showError(result.message);
      }
    } catch (error) {
      showError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="fullName" className="form-label">
          Full Name *
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={`form-input ${errors.fullName ? 'form-error' : ''}`}
          placeholder="Enter your full name"
          required
        />
        {errors.fullName && <div className="error-message">{errors.fullName}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`form-input ${errors.email ? 'form-error' : ''}`}
          placeholder="Enter your email"
          required
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password *
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`form-input ${errors.password ? 'form-error' : ''}`}
          placeholder="Create a strong password"
          required
        />
        {errors.password && <div className="error-message">{errors.password}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label">
          Confirm Password *
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`form-input ${errors.confirmPassword ? 'form-error' : ''}`}
          placeholder="Confirm your password"
          required
        />
        {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="phone" className="form-label">
          Phone Number *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`form-input ${errors.phone ? 'form-error' : ''}`}
          placeholder="Enter your phone number"
          required
        />
        {errors.phone && <div className="error-message">{errors.phone}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="whatsappNumber" className="form-label">
          WhatsApp Number (Optional but Recommended)
        </label>
        <input
          type="tel"
          id="whatsappNumber"
          name="whatsappNumber"
          value={formData.whatsappNumber}
          onChange={handleChange}
          className={`form-input ${errors.whatsappNumber ? 'form-error' : ''}`}
          placeholder="Enter your WhatsApp number"
        />
        {errors.whatsappNumber && <div className="error-message">{errors.whatsappNumber}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="areasOfInterest" className="form-label">
          Areas of Interest *
        </label>
        <input
          type="text"
          id="areasOfInterest"
          name="areasOfInterest"
          value={formData.areasOfInterest}
          onChange={handleChange}
          className={`form-input ${errors.areasOfInterest ? 'form-error' : ''}`}
          placeholder="e.g., Web Development, Machine Learning, Mobile Apps"
          required
        />
        <small className="form-help">Separate multiple interests with commas</small>
        {errors.areasOfInterest && <div className="error-message">{errors.areasOfInterest}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="previousExperience" className="form-label">
          Previous Experience (Optional)
        </label>
        <textarea
          id="previousExperience"
          name="previousExperience"
          value={formData.previousExperience}
          onChange={handleChange}
          className="form-textarea"
          placeholder="Tell us about your coding experience, projects, or skills..."
          rows="3"
        />
      </div>

      <div className="form-section-title">
        <h3>Tell Us More About You</h3>
        <p>Help us understand your coding journey and approach</p>
      </div>

      <div className="form-group">
        <label htmlFor="codingSkillsRating" className="form-label">
          How would you rate your coding skills? *
        </label>
        <select
          id="codingSkillsRating"
          name="codingSkillsRating"
          value={formData.codingSkillsRating}
          onChange={handleChange}
          className={`form-input ${errors.codingSkillsRating ? 'form-error' : ''}`}
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
        {errors.codingSkillsRating && <div className="error-message">{errors.codingSkillsRating}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="favoriteProgrammingLanguage" className="form-label">
          What's your favorite programming language? *
        </label>
        <input
          type="text"
          id="favoriteProgrammingLanguage"
          name="favoriteProgrammingLanguage"
          value={formData.favoriteProgrammingLanguage}
          onChange={handleChange}
          className={`form-input ${errors.favoriteProgrammingLanguage ? 'form-error' : ''}`}
          placeholder="e.g., JavaScript, Python, Java, C++"
          required
        />
        {errors.favoriteProgrammingLanguage && <div className="error-message">{errors.favoriteProgrammingLanguage}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="favoriteLanguageReason" className="form-label">
          Why is this your favorite language? *
        </label>
        <textarea
          id="favoriteLanguageReason"
          name="favoriteLanguageReason"
          value={formData.favoriteLanguageReason}
          onChange={handleChange}
          className={`form-textarea ${errors.favoriteLanguageReason ? 'form-error' : ''}`}
          placeholder="Explain what you like about this language..."
          rows="3"
          required
        />
        {errors.favoriteLanguageReason && <div className="error-message">{errors.favoriteLanguageReason}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="proudProject" className="form-label">
          Describe a project you've worked on that makes you proud. What impact did it have? *
        </label>
        <textarea
          id="proudProject"
          name="proudProject"
          value={formData.proudProject}
          onChange={handleChange}
          className={`form-textarea ${errors.proudProject ? 'form-error' : ''}`}
          placeholder="Tell us about a project you're proud of and its impact..."
          rows="4"
          required
        />
        {errors.proudProject && <div className="error-message">{errors.proudProject}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="debuggingProcess" className="form-label">
          When you encounter a bug, what's your approach to solving it? *
        </label>
        <textarea
          id="debuggingProcess"
          name="debuggingProcess"
          value={formData.debuggingProcess}
          onChange={handleChange}
          className={`form-textarea ${errors.debuggingProcess ? 'form-error' : ''}`}
          placeholder="Describe your debugging process and methodology..."
          rows="4"
          required
        />
        {errors.debuggingProcess && <div className="error-message">{errors.debuggingProcess}</div>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-lg"
        style={{ width: '100%' }}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Creating Account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

     
    </form>
  );
};

export default RegisterForm;
