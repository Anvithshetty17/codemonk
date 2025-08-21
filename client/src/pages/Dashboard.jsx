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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.fullName}!</h1>
          <p className="text-gray-600">Stay updated with the latest announcements and study materials</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeSection === 'announcements'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
            onClick={() => setActiveSection('announcements')}
          >
            <FontAwesomeIcon icon={faBullhorn} /> Announcements
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeSection === 'materials'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
            onClick={() => setActiveSection('materials')}
          >
            <FontAwesomeIcon icon={faBook} /> Study Materials
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeSection === 'profile'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
            onClick={() => setActiveSection('profile')}
          >
            <FontAwesomeIcon icon={faUser} /> My Profile
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {activeSection === 'announcements' && <AnnouncementsList />}
          {activeSection === 'materials' && <MaterialsList />}
          {activeSection === 'profile' && <MyProfile />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
