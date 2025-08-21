import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';

const MaterialsList = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/materials');
      if (response.data.success) {
        setMaterials(response.data.data.materials);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      showError('Failed to load study materials');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="materials-loading">
        <div className="spinner"></div>
        <p>Loading study materials...</p>
      </div>
    );
  }

  return (
    <div className="materials-list">
      <div className="section-header">
        <h2><FontAwesomeIcon icon={faBook} /> Study Materials</h2>
        <p>Access curated learning resources and materials</p>
      </div>

      {materials.length === 0 ? (
        <div className="no-materials">
          <div className="no-content">
            <h3>No Study Materials Yet</h3>
            <p>Our team is working hard to provide you with the best study materials. Check back soon!</p>
          </div>
        </div>
      ) : (
        <div className="materials-grid">
          {materials.map((material) => (
            <div key={material._id} className="material-card">
              <div className="material-content">
                <h3 className="material-title">{material.title}</h3>
                <p className="material-description">{material.description}</p>
                <div className="material-meta">
                  <span className="material-date">
                    Added: {formatDate(material.createdAt)}
                  </span>
                </div>
              </div>
              <div className="material-actions">
                <a
                  href={material.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  📖 View Material
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialsList;
