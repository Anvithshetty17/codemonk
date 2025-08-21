import React, { useState, useEffect } from 'react';
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
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading study materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Study Materials ({filteredMaterials.length})</h2>
        <div className="flex items-center gap-4">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            onClick={() => openModal()}
          >
            Add Material
          </button>
        </div>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {filterCategory 
              ? `No materials found in "${filterCategory}"` 
              : 'No study materials yet'
            }
          </h3>
          <p className="text-gray-500 mb-6">
            {filterCategory
              ? 'Try selecting a different category or add new materials.'
              : 'Add your first study material to help students learn.'
            }
          </p>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            onClick={() => openModal()}
          >
            Add First Material
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map(material => {
            const isExpanded = expandedItems.has(material._id);
            const shouldTruncate = !isExpanded && isDescriptionLong(material.description);
            
            return (
              <div key={material._id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{material.title}</h3>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">{material.category}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                      onClick={() => openModal(material)}
                      title="Edit material"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                      onClick={() => handleDelete(material._id, material.title)}
                      title="Delete material"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
                
                {material.description && (
                  <>
                    <div className={`text-gray-600 mb-4 ${shouldTruncate ? 'line-clamp-3' : ''}`}>
                      {material.description}
                    </div>
                    
                    {isDescriptionLong(material.description) && (
                      <button 
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4"
                        onClick={() => toggleExpanded(material._id)}
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </>
                )}

                <div className="text-sm text-gray-500 mb-4">
                  <span>Added {formatDate(material.createdAt)}</span>
                  {material.updatedAt !== material.createdAt && (
                    <span className="ml-2">Updated {formatDate(material.updatedAt)}</span>
                  )}
                </div>

                {material.link && (
                  <a
                    href={material.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">{editingMaterial ? 'Edit Study Material' : 'Add New Study Material'}</h3>
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
                  placeholder="Enter material title..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    id="category"
                    name="category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">Link *</label>
                  <input
                    type="url"
                    id="link"
                    name="link"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.link}
                    onChange={handleInputChange}
                    required
                    placeholder="https://example.com/material"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Brief description of the study material..."
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
