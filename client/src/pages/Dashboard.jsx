import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AnnouncementsList from '../components/dashboard/AnnouncementsList';
import MaterialsList from '../components/dashboard/MaterialsList';
import MyProfile from '../components/dashboard/MyProfile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullhorn, faBook, faUser } from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('announcements');
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.fullName}!</h1>
          <p>Stay updated with the latest announcements and study materials</p>
        </div>

        <div className="dashboard-nav">
          <button
            className={`nav-btn ${activeSection === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveSection('announcements')}
          >
            <FontAwesomeIcon icon={faBullhorn} /> Announcements
          </button>
          <button
            className={`nav-btn ${activeSection === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveSection('materials')}
          >
            <FontAwesomeIcon icon={faBook} /> Study Materials
          </button>
          <button
            className={`nav-btn ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <FontAwesomeIcon icon={faUser} /> My Profile
          </button>
        </div>

        <div className="dashboard-content">
          {activeSection === 'announcements' && <AnnouncementsList />}
          {activeSection === 'materials' && <MaterialsList />}
          {activeSection === 'profile' && <MyProfile />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
