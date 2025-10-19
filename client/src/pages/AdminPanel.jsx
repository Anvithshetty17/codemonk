import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// import StudentsTable from '../components/admin/StudentsTable';
import MembersManager from '../components/admin/MembersManager';
// import AnnouncementsManager from '../components/admin/AnnouncementsManager';
// import MaterialsManager from '../components/admin/MaterialsManager';
// import GroupManager from '../components/admin/GroupManager';
// import TaskManager from '../components/admin/TaskManager';
import CampusDriveAdmin from '../components/admin/CampusDriveAdmin';
import ExamManager from '../components/admin/ExamManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { /* faUsers, */ faTrophy, /* faBullhorn, faBook, faProjectDiagram, faTasks, */ faBuilding, faClipboardCheck, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('members');
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const sections = [
    // { id: 'students', label: 'Students', icon: faUsers, component: StudentsTable },
    // { id: 'groups', label: 'Groups', icon: faProjectDiagram, component: GroupManager },
    // { id: 'tasks', label: 'Task Management', icon: faTasks, component: TaskManager },
    { id: 'members', label: 'Team Members', icon: faTrophy, component: MembersManager },
    // { id: 'announcements', label: 'Announcements', icon: faBullhorn, component: AnnouncementsManager },
    // { id: 'materials', label: 'Study Materials', icon: faBook, component: MaterialsManager },
    { id: 'campus-drives', label: 'Campus Drives', icon: faBuilding, component: CampusDriveAdmin },
    { id: 'exams', label: 'Exam Management', icon: faClipboardCheck, component: ExamManager }
  ];

  const ActiveComponent = sections.find(section => section.id === activeSection)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Logout Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
            <p className="text-gray-600">Manage Code Monk club content and members</p>
          </div>
          
          {/* User Info and Logout */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-gray-700">
                <span className="text-sm opacity-75">Welcome, </span>
                <span className="font-medium">{user.name}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 shadow-sm"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {sections.map((section) => (
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

        <div className="bg-white rounded-lg shadow-sm">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
