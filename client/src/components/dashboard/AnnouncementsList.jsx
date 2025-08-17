import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn } from '@fortawesome/free-solid-svg-icons';
import './AnnouncementsList.css';

const AnnouncementsList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      if (response.data.success) {
        setAnnouncements(response.data.data.announcements);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      showError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="announcements-loading">
        <div className="spinner"></div>
        <p>Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="announcements-list">
      <div className="section-header">
        <h2><FontAwesomeIcon icon={faBullhorn} /> Latest Announcements</h2>
        <p>Stay updated with important news and updates</p>
      </div>

      {announcements.length === 0 ? (
        <div className="no-announcements">
          <div className="no-content">
            <h3>No Announcements Yet</h3>
            <p>Check back later for important updates and news from Code Monk!</p>
          </div>
        </div>
      ) : (
        <div className="announcements-grid">
          {announcements.map((announcement) => (
            <div key={announcement._id} className="announcement-card">
              <div className="announcement-header">
                <h3 className="announcement-title">{announcement.title}</h3>
                <span className="announcement-date">
                  {formatDate(announcement.createdAt)}
                </span>
              </div>
              <div className="announcement-body">
                <p>{announcement.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsList;
