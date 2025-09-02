import { useState } from 'react';
import StudentsTable from '../components/admin/StudentsTable';
import MembersManager from '../components/admin/MembersManager';
import AnnouncementsManager from '../components/admin/AnnouncementsManager';
import MaterialsManager from '../components/admin/MaterialsManager';
import GroupManager from '../components/admin/GroupManager';
import TaskManager from '../components/admin/TaskManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faTrophy, faBullhorn, faBook, faProjectDiagram, faTasks } from '@fortawesome/free-solid-svg-icons';

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('students');

  const sections = [
    { id: 'students', label: 'Students', icon: faUsers, component: StudentsTable },
    { id: 'groups', label: 'Groups', icon: faProjectDiagram, component: GroupManager },
    { id: 'tasks', label: 'Task Management', icon: faTasks, component: TaskManager },
    { id: 'members', label: 'Team Members', icon: faTrophy, component: MembersManager },
    { id: 'announcements', label: 'Announcements', icon: faBullhorn, component: AnnouncementsManager },
    { id: 'materials', label: 'Study Materials', icon: faBook, component: MaterialsManager }
  ];

  const ActiveComponent = sections.find(section => section.id === activeSection)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage Code Monk club content and members</p>
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
