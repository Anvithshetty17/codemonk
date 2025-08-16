import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AnnouncementsList from '../components/dashboard/AnnouncementsList';
import MaterialsList from '../components/dashboard/MaterialsList';
import MyProfile from '../components/dashboard/MyProfile';
import './Dashboard.css';

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
            📢 Announcements
          </button>
          <button
            className={`nav-btn ${activeSection === 'materials' ? 'active' : ''}`}
            onClick={() => setActiveSection('materials')}
          >
            📚 Study Materials
          </button>
          <button
            className={`nav-btn ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            👤 My Profile
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
