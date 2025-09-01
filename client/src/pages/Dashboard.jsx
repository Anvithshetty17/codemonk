import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import StudentGroupDashboard from '../components/dashboard/StudentGroupDashboard';
import MentorDashboard from '../components/dashboard/MentorDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import AnnouncementsList from '../components/dashboard/AnnouncementsList';
import MaterialsList from '../components/dashboard/MaterialsList';
import MyProfile from '../components/dashboard/MyProfile';
import StudentTasks from '../components/dashboard/StudentTasks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBullhorn, 
  faBook, 
  faUser, 
  faUsers, 
  faTasks,
  faUserShield,
  faUserGraduate,
  faProjectDiagram
} from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('main');
  const { user } = useAuth();

  // Define sections based on user role
  const getSections = () => {
    const commonSections = [
      { id: 'announcements', label: 'Announcements', icon: faBullhorn },
      { id: 'materials', label: 'Study Materials', icon: faBook },
      { id: 'profile', label: 'My Profile', icon: faUser }
    ];

    if (user?.role === 'admin') {
      return [
        { id: 'main', label: 'Admin Panel', icon: faUserShield },
        ...commonSections
      ];
    } else if (user?.role === 'mentor') {
      return [
        { id: 'main', label: 'Mentor Hub', icon: faUsers },
        ...commonSections
      ];
    } else {
      return [
        { id: 'main', label: 'My Dashboard', icon: faUserGraduate },
        { id: 'tasks', label: 'My Tasks', icon: faTasks },
        { id: 'groups', label: 'My Groups', icon: faProjectDiagram },
        ...commonSections
      ];
    }
  };

  const sections = getSections();

  const getRoleDisplayName = () => {
    switch (user?.role) {
      case 'admin': return 'Administrator';
      case 'mentor': return 'Mentor';
      default: return 'Student';
    }
  };

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'admin': 
        return 'Manage the platform and oversee all activities';
      case 'mentor': 
        return 'Guide students and review their submissions';
      default: 
        return 'Complete tasks and enhance your skills';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.fullName}!
          </h1>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              user?.role === 'admin' ? 'bg-red-100 text-red-800' :
              user?.role === 'mentor' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              <FontAwesomeIcon 
                icon={
                  user?.role === 'admin' ? faUserShield :
                  user?.role === 'mentor' ? faUsers :
                  faUserGraduate
                } 
                className="mr-1" 
              />
              {getRoleDisplayName()}
            </span>
          </div>
          <p className="text-gray-600">{getWelcomeMessage()}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {sections.map(section => (
            <button
              key={section.id}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <FontAwesomeIcon icon={section.icon} /> {section.label}
            </button>
          ))}
        </div>

        <div className={activeSection === 'main' ? '' : 'bg-white rounded-lg shadow-sm'}>
          {activeSection === 'main' && (
            <>
              {user?.role === 'admin' && <AdminDashboard />}
              {user?.role === 'mentor' && <MentorDashboard />}
              {user?.role === 'student' && <StudentDashboard />}
            </>
          )}
          {activeSection === 'groups' && <StudentGroupDashboard />}
          {activeSection === 'tasks' && <StudentTasks />}
          {activeSection === 'announcements' && <AnnouncementsList />}
          {activeSection === 'materials' && <MaterialsList />}
          {activeSection === 'profile' && <MyProfile />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
