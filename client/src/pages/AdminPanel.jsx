import { useState } from 'react';
import StudentsTable from '../components/admin/StudentsTable';
import MembersManager from '../components/admin/MembersManager';
import AnnouncementsManager from '../components/admin/AnnouncementsManager';
import MaterialsManager from '../components/admin/MaterialsManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faTrophy, faBullhorn, faBook } from '@fortawesome/free-solid-svg-icons';

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('students');

  const sections = [
    { id: 'students', label: 'Students', icon: faUsers, component: StudentsTable },
    { id: 'members', label: 'Team Members', icon: faTrophy, component: MembersManager },
    { id: 'announcements', label: 'Announcements', icon: faBullhorn, component: AnnouncementsManager },
    { id: 'materials', label: 'Study Materials', icon: faBook, component: MaterialsManager }
  ];

  const ActiveComponent = sections.find(section => section.id === activeSection)?.component;

  return (
    <div className="admin-panel">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Panel</h1>
          <p>Manage Code Monk club content and members</p>
        </div>

        <div className="admin-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`admin-nav-btn ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <FontAwesomeIcon icon={section.icon} /> {section.label}
            </button>
          ))}
        </div>

        <div className="admin-content">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
