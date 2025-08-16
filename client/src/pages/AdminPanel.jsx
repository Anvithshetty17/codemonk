import { useState } from 'react';
import StudentsTable from '../components/admin/StudentsTable';
import MembersManager from '../components/admin/MembersManager';
import AnnouncementsManager from '../components/admin/AnnouncementsManager';
import MaterialsManager from '../components/admin/MaterialsManager';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState('students');

  const sections = [
    { id: 'students', label: '👥 Students', component: StudentsTable },
    { id: 'members', label: '🏆 Team Members', component: MembersManager },
    { id: 'announcements', label: '📢 Announcements', component: AnnouncementsManager },
    { id: 'materials', label: '📚 Study Materials', component: MaterialsManager }
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
              {section.label}
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
