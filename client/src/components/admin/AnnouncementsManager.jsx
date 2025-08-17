import React, { useState, useEffect } from 'react';
import './AnnouncementsManager.css';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const AnnouncementsManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    priority: 'medium'
  });
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/announcements');
      if (response.data.success) {
        // The API returns { success: true, data: { announcements: [...] } }
        setAnnouncements(response.data.data.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      showError('Failed to load announcements');
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
      title: '',
      body: '',
      priority: 'medium'
    });
    setEditingAnnouncement(null);
  };

  const openModal = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title || '',
        body: announcement.body || '',
        priority: announcement.priority || 'medium'
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
      let response;
      if (editingAnnouncement) {
        response = await api.put(`/announcements/${editingAnnouncement._id}`, formData);
        showSuccess('Announcement updated successfully');
      } else {
        response = await api.post('/announcements', formData);
        showSuccess('Announcement created successfully');
      }

      if (response.data.success) {
        await fetchAnnouncements();
        closeModal();
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      showError(error.response?.data?.message || 'Failed to save announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (announcementId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/announcements/${announcementId}`);
      if (response.data.success) {
        showSuccess('Announcement deleted successfully');
        await fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      showError('Failed to delete announcement');
    }
  };

  const toggleExpanded = (announcementId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(announcementId)) {
        newSet.delete(announcementId);
      } else {
        newSet.add(announcementId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const isContentLong = (content) => {
    return content && content.length > 200;
  };

  if (loading) {
    return (
      <div className="announcements-manager">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="announcements-manager">
      <div className="announcements-header">
        <h2>Announcements ({announcements.length})</h2>
        <button 
          className="btn btn-primary"
          onClick={() => openModal()}
        >
          Create Announcement
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="empty-state">
          <h3>No announcements yet</h3>
          <p>Create your first announcement to keep students informed.</p>
          <button 
            className="btn btn-primary"
            onClick={() => openModal()}
          >
            Create First Announcement
          </button>
        </div>
      ) : (
        <div className="announcements-list">
          {announcements.map(announcement => {
            const isExpanded = expandedItems.has(announcement._id);
            const shouldTruncate = !isExpanded && isContentLong(announcement.body);
            
            return (
              <div key={announcement._id} className="announcement-item">
                <div className="announcement-header">
                  <div className="announcement-info">
                    <h3>{announcement.title}</h3>
                    <div className="announcement-meta">
                      <span className={`announcement-priority ${getPriorityClass(announcement.priority)}`}>
                        {announcement.priority}
                      </span>
                      <span>Created {formatDate(announcement.createdAt)}</span>
                      {announcement.updatedAt !== announcement.createdAt && (
                        <span>Updated {formatDate(announcement.updatedAt)}</span>
                      )}
                    </div>
                  </div>
                  <div className="announcement-actions">
                    <button 
                      className="btn-icon btn-edit"
                      onClick={() => openModal(announcement)}
                      title="Edit announcement"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(announcement._id, announcement.title)}
                      title="Delete announcement"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
                
                <div className={`announcement-content ${shouldTruncate ? 'collapsed' : ''}`}>
                  {announcement.body}
                </div>

                {isContentLong(announcement.body) && (
                  <button 
                    className="show-more-btn"
                    onClick={() => toggleExpanded(announcement._id)}
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="announcement-modal" onClick={closeModal}>
          <div className="announcement-modal-content" onClick={e => e.stopPropagation()}>
            <div className="announcement-modal-header">
              <h3>{editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <form className="announcement-form" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="title" className="form-label">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter announcement title..."
                />
              </div>

              <div>
                <label htmlFor="priority" className="form-label">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  className="form-select"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label htmlFor="body" className="form-label">Content *</label>
                <textarea
                  id="body"
                  name="body"
                  className="form-textarea"
                  value={formData.body}
                  onChange={handleInputChange}
                  rows="6"
                  required
                  placeholder="Enter announcement content..."
                />
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
                  {submitting ? 'Saving...' : (editingAnnouncement ? 'Update Announcement' : 'Create Announcement')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsManager;
