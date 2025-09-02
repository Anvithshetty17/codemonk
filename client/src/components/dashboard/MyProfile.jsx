import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone,
  faEdit,
  faSave,
  faTimes,
  faLock,
  faEye,
  faEyeSlash,
  faIdCard,
  faKey
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const MyProfile = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    usn: '',
    phone: '',
    whatsappNumber: '',
    section: ''
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
        email: user.email || '',
        usn: user.usn || '',
        phone: user.phone || '',
        whatsappNumber: user.whatsappNumber || '',
        section: user.section || ''
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (!formData.usn.trim()) {
      newErrors.usn = 'USN is required';
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (formData.whatsappNumber && !/^\d{10}$/.test(formData.whatsappNumber.replace(/\D/g, ''))) {
      newErrors.whatsappNumber = 'WhatsApp number must be 10 digits';
    }

    if (!formData.section.trim()) {
      newErrors.section = 'Section is required';
    } else if (!['A', 'B', 'C'].includes(formData.section.toUpperCase())) {
      newErrors.section = 'Please select a valid section (A, B, or C)';
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
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/users/me', formData);

      if (response.data.success) {
        showSuccess('Profile updated successfully');
        updateUser(response.data.data.user);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch('/users/me/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        showSuccess('Password changed successfully');
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setErrors({});
    
    // Reset form data
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        usn: user.usn || '',
        phone: user.phone || '',
        whatsappNumber: user.whatsappNumber || '',
        section: user.section || ''
      });
    }
    
    // Reset password data
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FontAwesomeIcon icon={faUser} />
            My Profile
          </h1>
          <p className="text-blue-100 mt-2">Manage your personal information and account settings</p>
        </div>

        <div className="p-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <FontAwesomeIcon icon={faUser} className="text-4xl text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mt-4">{user?.fullName}</h2>
            <p className="text-gray-600 capitalize">{user?.role}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {user?.usn}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            {!isEditing && !isChangingPassword && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faEdit} />
                  Edit Profile
                </button>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faKey} />
                  Change Password
                </button>
              </>
            )}

            {(isEditing || isChangingPassword) && (
              <div className="flex gap-4">
                <button
                  onClick={isEditing ? handleSaveProfile : handleChangePassword}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faSave} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Profile Information */}
          {!isChangingPassword && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    {formData.fullName || 'Not provided'}
                  </div>
                )}
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    {formData.email || 'Not provided'}
                  </div>
                )}
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faIdCard} className="mr-2" />
                  USN
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="usn"
                    value={formData.usn}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.usn ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your USN"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    {formData.usn || 'Not provided'}
                  </div>
                )}
                {errors.usn && <p className="text-red-500 text-sm mt-1">{errors.usn}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faPhone} className="mr-2" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    {formData.phone || 'Not provided'}
                  </div>
                )}
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faWhatsapp} className="mr-2" />
                  WhatsApp Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.whatsappNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your WhatsApp number"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    {formData.whatsappNumber || 'Not provided'}
                  </div>
                )}
                {errors.whatsappNumber && <p className="text-red-500 text-sm mt-1">{errors.whatsappNumber}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faIdCard} className="mr-2" />
                  Section
                </label>
                {isEditing ? (
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.section ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select your section</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    {formData.section ? `Section ${formData.section}` : 'Not provided'}
                  </div>
                )}
                {errors.section && <p className="text-red-500 text-sm mt-1">{errors.section}</p>}
              </div>
            </div>
          )}

          {/* Change Password Section */}
          {isChangingPassword && (
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Change Password</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faLock} className="mr-2" />
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                        errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faLock} className="mr-2" />
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                        errors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faLock} className="mr-2" />
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
