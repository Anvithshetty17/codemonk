import React, { useState, useEffect } from 'react';
import './MembersManager.css';
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
    description: '',
    email: '',
    image: '',
    linkedin: '',
    github: '',
    twitter: '',
    portfolio: ''
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      email: '',
      image: '',
      linkedin: '',
      github: '',
      twitter: '',
      portfolio: ''
    });
    setEditingMember(null);
  };

  const openModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name || '',
        description: member.description || '',
        email: member.email || '',
        image: member.image || '',
        linkedin: member.socialLinks?.linkedin || '',
        github: member.socialLinks?.github || '',
        twitter: member.socialLinks?.twitter || '',
        portfolio: member.socialLinks?.portfolio || ''
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
        name: formData.name,
        description: formData.description,
        email: formData.email,
        image: formData.image,
        socialLinks: {
          linkedin: formData.linkedin || undefined,
          github: formData.github || undefined,
          twitter: formData.twitter || undefined,
          portfolio: formData.portfolio || undefined
        }
      };

      // Remove undefined values from socialLinks
      memberData.socialLinks = Object.fromEntries(
        Object.entries(memberData.socialLinks).filter(([_, value]) => value !== undefined)
      );

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
      <div className="members-manager">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="members-manager">
      <div className="members-header">
        <h2>Team Members ({members.length})</h2>
        <button 
          className="btn btn-primary"
          onClick={() => openModal()}
        >
          Add New Member
        </button>
      </div>

      {members.length === 0 ? (
        <div className="empty-state">
          <h3>No team members yet</h3>
          <p>Add your first team member to get started.</p>
          <button 
            className="btn btn-primary"
            onClick={() => openModal()}
          >
            Add First Member
          </button>
        </div>
      ) : (
        <div className="members-grid">
          {members.map(member => (
            <div key={member._id} className="member-card">
              {member.image && (
                <div className="member-image">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="member-header">
                <div className="member-info">
                  <h3>{member.name}</h3>
                </div>
                <div className="member-actions">
                  <button 
                    className="btn-icon btn-edit"
                    onClick={() => openModal(member)}
                    title="Edit member"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button 
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(member._id, member.name)}
                    title="Delete member"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
              
              {member.description && (
                <p className="member-description">{member.description}</p>
              )}
              
              {member.socialLinks && Object.keys(member.socialLinks).length > 0 && (
                <div className="member-links">
                  {member.socialLinks.linkedin && (
                    <a 
                      href={member.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="member-link"
                    >
                      🔗 LinkedIn
                    </a>
                  )}
                  {member.socialLinks.github && (
                    <a 
                      href={member.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="member-link"
                    >
                      🔗 GitHub
                    </a>
                  )}
                  {member.socialLinks.twitter && (
                    <a 
                      href={member.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="member-link"
                    >
                      🔗 Twitter
                    </a>
                  )}
                  {member.socialLinks.portfolio && (
                    <a 
                      href={member.socialLinks.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="member-link"
                    >
                      🔗 Portfolio
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="member-modal" onClick={closeModal}>
          <div className="member-modal-content" onClick={e => e.stopPropagation()}>
            <div className="member-modal-header">
              <h3>{editingMember ? 'Edit Team Member' : 'Add New Team Member'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <form className="member-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div>
                  <label htmlFor="name" className="form-label">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="member@example.com"
                />
              </div>

              <div>
                <label htmlFor="image" className="form-label">Profile Image URL</label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  className="form-input"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/profile-image.jpg"
                />
              </div>

              <div>
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief description about the member..."
                />
              </div>

              <div className="social-links-section">
                <h4>Social Links</h4>
                
                <div className="social-link-input">
                  <label htmlFor="linkedin">LinkedIn:</label>
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    className="form-input"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="social-link-input">
                  <label htmlFor="github">GitHub:</label>
                  <input
                    type="url"
                    id="github"
                    name="github"
                    className="form-input"
                    value={formData.github}
                    onChange={handleInputChange}
                    placeholder="https://github.com/username"
                  />
                </div>

                <div className="social-link-input">
                  <label htmlFor="twitter">Twitter:</label>
                  <input
                    type="url"
                    id="twitter"
                    name="twitter"
                    className="form-input"
                    value={formData.twitter}
                    onChange={handleInputChange}
                    placeholder="https://twitter.com/username"
                  />
                </div>

                <div className="social-link-input">
                  <label htmlFor="portfolio">Portfolio:</label>
                  <input
                    type="url"
                    id="portfolio"
                    name="portfolio"
                    className="form-input"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    placeholder="https://portfolio.com"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
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
