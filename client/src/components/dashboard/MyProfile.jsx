import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../utils/api';
import './MyProfile.css';

const MyProfile = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    whatsappNumber: '',
    areasOfInterest: '',
    previousExperience: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        whatsappNumber: user.whatsappNumber || '',
        areasOfInterest: Array.isArray(user.areasOfInterest) 
          ? user.areasOfInterest.join(', ') 
          : user.areasOfInterest || '',
        previousExperience: user.previousExperience || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
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

  const validateProfile = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+?[1-9]\d{1,14}|\d{10})$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.whatsappNumber.trim() && !/^(\+?[1-9]\d{1,14}|\d{10})$/.test(formData.whatsappNumber.trim())) {
      newErrors.whatsappNumber = 'Please enter a valid WhatsApp number';
    }

    if (!formData.areasOfInterest.trim()) {
      newErrors.areasOfInterest = 'Please provide at least one area of interest';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateProfile()) return;

    setLoading(true);
    try {
      const response = await api.patch('/users/me', formData);
      if (response.data.success) {
        updateUser(response.data.data.user);
        setIsEditing(false);
        showSuccess('Profile updated successfully!');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) return;

    setPasswordLoading(true);
    try {
      const response = await api.patch('/users/me/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showSuccess('Password changed successfully!');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      showError(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    // Reset form data to original user data
    setFormData({
      fullName: user.fullName || '',
      phone: user.phone || '',
      whatsappNumber: user.whatsappNumber || '',
      areasOfInterest: Array.isArray(user.areasOfInterest) 
        ? user.areasOfInterest.join(', ') 
        : user.areasOfInterest || '',
      previousExperience: user.previousExperience || ''
    });
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setErrors({});
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="my-profile">
      <div className="profile-header">
        <h2>👤 My Profile</h2>
        <p>View and manage your account information</p>
      </div>

      <div className="profile-sections">
        {/* Profile Information Section */}
        <div className="profile-section">
          <div className="section-header">
            <h3>Profile Information</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-outline btn-sm"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.fullName ? 'form-error' : ''}`}
                  />
                  {errors.fullName && <div className="error-message">{errors.fullName}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="form-input"
                    disabled
                  />
                  <small className="form-help">Email cannot be changed</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`form-input ${errors.phone ? 'form-error' : ''}`}
                  />
                  {errors.phone && <div className="error-message">{errors.phone}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp Number</label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleInputChange}
                    className={`form-input ${errors.whatsappNumber ? 'form-error' : ''}`}
                  />
                  {errors.whatsappNumber && <div className="error-message">{errors.whatsappNumber}</div>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Areas of Interest *</label>
                <input
                  type="text"
                  name="areasOfInterest"
                  value={formData.areasOfInterest}
                  onChange={handleInputChange}
                  className={`form-input ${errors.areasOfInterest ? 'form-error' : ''}`}
                  placeholder="Separate multiple interests with commas"
                />
                {errors.areasOfInterest && <div className="error-message">{errors.areasOfInterest}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Previous Experience</label>
                <textarea
                  name="previousExperience"
                  value={formData.previousExperience}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="3"
                  placeholder="Tell us about your coding experience..."
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-display">
              <div className="profile-row">
                <div className="profile-field">
                  <label>Full Name:</label>
                  <span>{user?.fullName}</span>
                </div>
                <div className="profile-field">
                  <label>Email:</label>
                  <span>{user?.email}</span>
                </div>
              </div>

              <div className="profile-row">
                <div className="profile-field">
                  <label>Phone:</label>
                  <span>{user?.phone}</span>
                </div>
                <div className="profile-field">
                  <label>WhatsApp:</label>
                  <span>{user?.whatsappNumber || 'Not provided'}</span>
                </div>
              </div>

              <div className="profile-field">
                <label>Areas of Interest:</label>
                <span>
                  {Array.isArray(user?.areasOfInterest) 
                    ? user.areasOfInterest.join(', ') 
                    : user?.areasOfInterest || 'Not specified'}
                </span>
              </div>

              <div className="profile-field">
                <label>Previous Experience:</label>
                <span>{user?.previousExperience || 'Not provided'}</span>
              </div>

              <div className="profile-field">
                <label>Member Since:</label>
                <span>{formatDate(user?.createdAt)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Password Change Section */}
        <div className="profile-section">
          <div className="section-header">
            <h3>Change Password</h3>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="btn btn-outline btn-sm"
              >
                🔒 Change Password
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handleChangePassword} className="password-form">
              <div className="form-group">
                <label className="form-label">Current Password *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${errors.currentPassword ? 'form-error' : ''}`}
                />
                {errors.currentPassword && <div className="error-message">{errors.currentPassword}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">New Password *</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${errors.newPassword ? 'form-error' : ''}`}
                />
                {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${errors.confirmPassword ? 'form-error' : ''}`}
                />
                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn btn-primary"
                >
                  {passwordLoading ? (
                    <>
                      <span className="spinner"></span>
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelPasswordChange}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="password-display">
              <p>Click "Change Password" to update your account password.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
