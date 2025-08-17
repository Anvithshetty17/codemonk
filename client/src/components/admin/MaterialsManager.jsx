import React, { useState, useEffect } from 'react';
import './MaterialsManager.css';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const MaterialsManager = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    link: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  const categories = [
    'Web Development',
    'Data Structures',
    'Algorithms',
    'Database',
    'Programming Languages',
    'System Design',
    'DevOps',
    'Mobile Development',
    'Machine Learning',
    'Cybersecurity',
    'UI/UX Design',
    'Other'
  ];

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await api.get('/materials');
      if (response.data.success) {
        // The API returns { success: true, data: { materials: [...] } }
        setMaterials(response.data.data.materials || []);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      showError('Failed to load study materials');
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
      description: '',
      category: '',
      link: ''
    });
    setEditingMaterial(null);
  };

  const openModal = (material = null) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        title: material.title || '',
        description: material.description || '',
        category: material.category || '',
        link: material.link || ''
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
      if (editingMaterial) {
        response = await api.put(`/materials/${editingMaterial._id}`, formData);
        showSuccess('Study material updated successfully');
      } else {
        response = await api.post('/materials', formData);
        showSuccess('Study material added successfully');
      }

      if (response.data.success) {
        await fetchMaterials();
        closeModal();
      }
    } catch (error) {
      console.error('Error saving material:', error);
      showError(error.response?.data?.message || 'Failed to save study material');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (materialId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.delete(`/materials/${materialId}`);
      if (response.data.success) {
        showSuccess('Study material deleted successfully');
        await fetchMaterials();
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      showError('Failed to delete study material');
    }
  };

  const toggleExpanded = (materialId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(materialId)) {
        newSet.delete(materialId);
      } else {
        newSet.add(materialId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isDescriptionLong = (description) => {
    return description && description.length > 150;
  };

  const filteredMaterials = materials.filter(material => {
    if (!filterCategory) return true;
    return material.category === filterCategory;
  });

  // Get unique categories from materials
  const usedCategories = [...new Set(materials.map(m => m.category))].sort();

  if (loading) {
    return (
      <div className="materials-manager">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading study materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="materials-manager">
      <div className="materials-header">
        <h2>Study Materials ({filteredMaterials.length})</h2>
        <div className="materials-filters">
          <select
            className="form-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {usedCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button 
            className="btn btn-primary"
            onClick={() => openModal()}
          >
            Add Material
          </button>
        </div>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="empty-state">
          <h3>
            {filterCategory 
              ? `No materials found in "${filterCategory}"` 
              : 'No study materials yet'
            }
          </h3>
          <p>
            {filterCategory
              ? 'Try selecting a different category or add new materials.'
              : 'Add your first study material to help students learn.'
            }
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => openModal()}
          >
            Add First Material
          </button>
        </div>
      ) : (
        <div className="materials-grid">
          {filteredMaterials.map(material => {
            const isExpanded = expandedItems.has(material._id);
            const shouldTruncate = !isExpanded && isDescriptionLong(material.description);
            
            return (
              <div key={material._id} className="material-card">
                <div className="material-header">
                  <div className="material-info">
                    <h3>{material.title}</h3>
                    <span className="material-category">{material.category}</span>
                  </div>
                  <div className="material-actions">
                    <button 
                      className="btn-icon btn-edit"
                      onClick={() => openModal(material)}
                      title="Edit material"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(material._id, material.title)}
                      title="Delete material"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
                
                {material.description && (
                  <>
                    <div className={`material-description ${shouldTruncate ? 'collapsed' : ''}`}>
                      {material.description}
                    </div>
                    
                    {isDescriptionLong(material.description) && (
                      <button 
                        className="show-more-btn"
                        onClick={() => toggleExpanded(material._id)}
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </>
                )}

                <div className="material-meta">
                  <span>Added {formatDate(material.createdAt)}</span>
                  {material.updatedAt !== material.createdAt && (
                    <span>Updated {formatDate(material.updatedAt)}</span>
                  )}
                </div>

                {material.link && (
                  <a
                    href={material.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="material-link"
                  >
                    <FontAwesomeIcon icon={faBook} /> View Material
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="material-modal" onClick={closeModal}>
          <div className="material-modal-content" onClick={e => e.stopPropagation()}>
            <div className="material-modal-header">
              <h3>{editingMaterial ? 'Edit Study Material' : 'Add New Study Material'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <form className="material-form" onSubmit={handleSubmit}>
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
                  placeholder="Enter material title..."
                />
              </div>

              <div className="form-row">
                <div>
                  <label htmlFor="category" className="form-label">Category *</label>
                  <select
                    id="category"
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="link" className="form-label">Link *</label>
                  <input
                    type="url"
                    id="link"
                    name="link"
                    className="form-input"
                    value={formData.link}
                    onChange={handleInputChange}
                    required
                    placeholder="https://example.com/material"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Brief description of the study material..."
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
                  {submitting ? 'Saving...' : (editingMaterial ? 'Update Material' : 'Add Material')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsManager;
