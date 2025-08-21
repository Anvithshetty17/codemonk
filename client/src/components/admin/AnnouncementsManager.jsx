import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
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

  const isContentLong = (content) => {
    return content && content.length > 200;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Announcements ({announcements.length})</h2>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          onClick={() => openModal()}
        >
          Create Announcement
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No announcements yet</h3>
          <p className="text-gray-500 mb-6">Create your first announcement to keep students informed.</p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            onClick={() => openModal()}
          >
            Create First Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(announcement => {
            const isExpanded = expandedItems.has(announcement._id);
            const shouldTruncate = !isExpanded && isContentLong(announcement.body);
            
            return (
              <div key={announcement._id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{announcement.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          announcement.priority === 'high' ? 'bg-red-100 text-red-800' :
                          announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {announcement.priority}
                        </span>
                        <span>Created {formatDate(announcement.createdAt)}</span>
                        {announcement.updatedAt !== announcement.createdAt && (
                          <span>Updated {formatDate(announcement.updatedAt)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                        onClick={() => openModal(announcement)}
                        title="Edit announcement"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                        onClick={() => handleDelete(announcement._id, announcement.title)}
                        title="Delete announcement"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                  
                  <div className={`text-gray-600 ${shouldTruncate ? 'line-clamp-3' : ''}`}>
                    {announcement.body}
                  </div>

                  {isContentLong(announcement.body) && (
                    <button 
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      onClick={() => toggleExpanded(announcement._id)}
                    >
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">{editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}</h3>
              <button className="text-gray-500 hover:text-gray-700 text-2xl" onClick={closeModal}>×</button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter announcement title..."
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  id="body"
                  name="body"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.body}
                  onChange={handleInputChange}
                  rows="6"
                  required
                  placeholder="Enter announcement content..."
                />
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
