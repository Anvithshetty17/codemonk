import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const MembersManager = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    description: '',
    email: '',
    image: '',
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      portfolio: '',
      email: ''
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      console.log('Fetching members...');
      const response = await api.get('/members');
      console.log('Members API response:', response.data);
      
      if (response.data.success) {
        // The API returns { success: true, data: { members: [...] } }
        setMembers(response.data.data.members || []);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      console.error('Error response:', error.response?.data);
      showError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      description: '',
      email: '',
      image: '',
      socialLinks: {
        linkedin: '',
        github: '',
        twitter: '',
        portfolio: '',
        email: ''
      }
    });
    setEditingMember(null);
  };

  const openModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name || '',
        role: member.role || '',
        description: member.description || '',
        email: member.email || '',
        image: member.image || '',
        socialLinks: {
          linkedin: member.socialLinks?.linkedin || '',
          github: member.socialLinks?.github || '',
          twitter: member.socialLinks?.twitter || '',
          portfolio: member.socialLinks?.portfolio || '',
          email: member.socialLinks?.email || ''
        }
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(resetForm, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const memberData = {
        name: formData.name.trim()
      };

      // Only add optional fields if they have values
      if (formData.role && formData.role.trim()) {
        memberData.role = formData.role.trim();
      }

      if (formData.description && formData.description.trim()) {
        memberData.description = formData.description.trim();
      }

      if (formData.email && formData.email.trim()) {
        memberData.email = formData.email.trim();
      }

      if (formData.image && formData.image.trim()) {
        memberData.image = formData.image.trim();
      }

      // Handle social links - only include if they have values
      const socialLinks = {};
      if (formData.socialLinks.linkedin && formData.socialLinks.linkedin.trim()) {
        socialLinks.linkedin = formData.socialLinks.linkedin.trim();
      }
      if (formData.socialLinks.github && formData.socialLinks.github.trim()) {
        socialLinks.github = formData.socialLinks.github.trim();
      }
      if (formData.socialLinks.twitter && formData.socialLinks.twitter.trim()) {
        socialLinks.twitter = formData.socialLinks.twitter.trim();
      }
      if (formData.socialLinks.portfolio && formData.socialLinks.portfolio.trim()) {
        socialLinks.portfolio = formData.socialLinks.portfolio.trim();
      }
      if (formData.socialLinks.email && formData.socialLinks.email.trim()) {
        socialLinks.email = formData.socialLinks.email.trim();
      }

      // Only add socialLinks if there are any
      if (Object.keys(socialLinks).length > 0) {
        memberData.socialLinks = socialLinks;
      }

      let response;
      if (editingMember) {
        response = await api.put(`/members/${editingMember._id}`, memberData);
        showSuccess('Team member updated successfully');
      } else {
        response = await api.post('/members', memberData);
        showSuccess('Team member added successfully');
      }

      if (response.data.success) {
        await fetchMembers();
        closeModal();
      }
    } catch (error) {
      console.error('Error saving member:', error);
      showError(error.response?.data?.message || 'Failed to save team member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to delete ${memberName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/members/${memberId}`);
      if (response.data.success) {
        showSuccess('Team member deleted successfully');
        await fetchMembers();
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      showError('Failed to delete team member');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Team Members ({members.length})</h2>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          onClick={() => openModal()}
        >
          Add New Member
        </button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No team members yet</h3>
          <p className="text-gray-500 mb-6">Add your first team member to get started.</p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            onClick={() => openModal()}
          >
            Add First Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map(member => (
            <div key={member._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {member.image && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                    {member.role && (
                      <p className="text-sm text-blue-600 font-medium mt-1">{member.role}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                      onClick={() => openModal(member)}
                      title="Edit member"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                      onClick={() => handleDelete(member._id, member.name)}
                      title="Delete member"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
                
                {member.description && (
                  <p className="text-gray-600 mb-4">{member.description}</p>
                )}
                
                {member.socialLinks && Object.keys(member.socialLinks).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {member.socialLinks.linkedin && (
                      <a 
                        href={member.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        🔗 LinkedIn
                      </a>
                    )}
                    {member.socialLinks.github && (
                      <a 
                        href={member.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        🔗 GitHub
                      </a>
                    )}
                    {member.socialLinks.twitter && (
                      <a 
                        href={member.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        🔗 Twitter
                      </a>
                    )}
                    {member.socialLinks.portfolio && (
                      <a 
                        href={member.socialLinks.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        🔗 Portfolio
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">{editingMember ? 'Edit Team Member' : 'Add New Team Member'}</h3>
              <button className="text-gray-500 hover:text-gray-700 text-2xl" onClick={closeModal}>×</button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role/Position (Recommended)</label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="e.g. President, Vice President, Technical Lead"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="member@example.com"
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL (Recommended)</label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/profile-image.jpg"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief description about the member..."
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Social Links</h4>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="socialLinks.linkedin" className="block text-sm font-medium text-gray-700 mb-1">LinkedIn:</label>
                    <input
                      type="url"
                      id="socialLinks.linkedin"
                      name="socialLinks.linkedin"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.socialLinks.linkedin}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div>
                    <label htmlFor="socialLinks.github" className="block text-sm font-medium text-gray-700 mb-1">GitHub:</label>
                    <input
                      type="url"
                      id="socialLinks.github"
                      name="socialLinks.github"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.socialLinks.github}
                      onChange={handleInputChange}
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div>
                    <label htmlFor="socialLinks.twitter" className="block text-sm font-medium text-gray-700 mb-1">Twitter:</label>
                    <input
                      type="url"
                      id="socialLinks.twitter"
                      name="socialLinks.twitter"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.socialLinks.twitter}
                      onChange={handleInputChange}
                      placeholder="https://twitter.com/username"
                    />
                  </div>

                  <div>
                    <label htmlFor="socialLinks.portfolio" className="block text-sm font-medium text-gray-700 mb-1">Portfolio/Website:</label>
                    <input
                      type="url"
                      id="socialLinks.portfolio"
                      name="socialLinks.portfolio"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.socialLinks.portfolio}
                      onChange={handleInputChange}
                      placeholder="https://portfolio.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="socialLinks.email" className="block text-sm font-medium text-gray-700 mb-1">Social Contact Email:</label>
                    <input
                      type="email"
                      id="socialLinks.email"
                      name="socialLinks.email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.socialLinks.email}
                      onChange={handleInputChange}
                      placeholder="public@example.com (separate from main email)"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingMember ? 'Update Member' : 'Add Member')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersManager;
