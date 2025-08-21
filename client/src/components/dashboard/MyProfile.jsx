import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEdit } from '@fortawesome/free-solid-svg-icons';

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
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <FontAwesomeIcon icon={faUser} className="text-blue-600" /> My Profile
        </h2>
        <p className="text-gray-600">View and manage your account information</p>
      </div>

      <div className="space-y-8">
        {/* Profile Information Section */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Profile Information</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                <FontAwesomeIcon icon={faEdit} /> Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
                      errors.fullName 
                        ? 'border-red-500 focus:ring-red-100' 
                        : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  {errors.fullName && <div className="text-red-500 text-xs mt-1">{errors.fullName}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100 text-gray-500"
                    disabled
                  />
                  <small className="text-xs text-gray-500 mt-1 block">Email cannot be changed</small>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
                      errors.phone 
                        ? 'border-red-500 focus:ring-red-100' 
                        : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
                      errors.whatsappNumber 
                        ? 'border-red-500 focus:ring-red-100' 
                        : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  {errors.whatsappNumber && <div className="text-red-500 text-xs mt-1">{errors.whatsappNumber}</div>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Areas of Interest *</label>
                <input
                  type="text"
                  name="areasOfInterest"
                  value={formData.areasOfInterest}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
                    errors.areasOfInterest 
                      ? 'border-red-500 focus:ring-red-100' 
                      : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                  placeholder="Separate multiple interests with commas"
                />
                {errors.areasOfInterest && <div className="text-red-500 text-xs mt-1">{errors.areasOfInterest}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Previous Experience</label>
                <textarea
                  name="previousExperience"
                  value={formData.previousExperience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  rows="3"
                  placeholder="Tell us about your coding experience..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Full Name:</label>
                  <span className="text-gray-900">{user?.fullName}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Email:</label>
                  <span className="text-gray-900">{user?.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone:</label>
                  <span className="text-gray-900">{user?.phone}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">WhatsApp:</label>
                  <span className="text-gray-900">{user?.whatsappNumber || 'Not provided'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Areas of Interest:</label>
                <span className="text-gray-900">
                  {Array.isArray(user?.areasOfInterest) 
                    ? user.areasOfInterest.join(', ') 
                    : user?.areasOfInterest || 'Not specified'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Previous Experience:</label>
                <span className="text-gray-900">{user?.previousExperience || 'Not provided'}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Member Since:</label>
                <span className="text-gray-900">{formatDate(user?.createdAt)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Password Change Section */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Change Password</h3>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                🔒 Change Password
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
                    errors.currentPassword 
                      ? 'border-red-500 focus:ring-red-100' 
                      : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                {errors.currentPassword && <div className="text-red-500 text-xs mt-1">{errors.currentPassword}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
                    errors.newPassword 
                      ? 'border-red-500 focus:ring-red-100' 
                      : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                {errors.newPassword && <div className="text-red-500 text-xs mt-1">{errors.newPassword}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:ring-red-100' 
                      : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                {errors.confirmPassword && <div className="text-red-500 text-xs mt-1">{errors.confirmPassword}</div>}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {passwordLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelPasswordChange}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="text-gray-600">
              <p>Click "Change Password" to update your account password.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
