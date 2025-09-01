import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faPlus, 
  faEdit, 
  faTrash, 
  faEye, 
  faCalendarAlt,
  faUser,
  faChalkboardTeacher,
  faProjectDiagram
} from '@fortawesome/free-solid-svg-icons';

const GroupManager = () => {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    students: [],
    mentors: [],
    project: {
      title: '',
      description: '',
      requirements: [''],
      technologies: [''],
      difficulty: 'Intermediate',
      submissionDate: '',
      submissionFormat: 'GitHub Repository',
      resources: []
    }
  });
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups');
      if (response.data.success) {
        setGroups(response.data.data.groups);
      }
    } catch (error) {
      showError('Failed to load groups');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users?limit=1000');
      if (response.data.success) {
        const users = response.data.data.users;
        setStudents(users.filter(user => user.role === 'student'));
        setMentors(users.filter(user => user.role === 'mentor' || user.role === 'admin'));
      }
    } catch (error) {
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode, group = null) => {
    setModalMode(mode);
    setSelectedGroup(group);
    
    if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        students: [],
        mentors: [],
        project: {
          title: '',
          description: '',
          requirements: [''],
          technologies: [''],
          difficulty: 'Intermediate',
          submissionDate: '',
          submissionFormat: 'GitHub Repository',
          resources: []
        }
      });
    } else if (mode === 'edit' && group) {
      setFormData({
        name: group.name,
        description: group.description || '',
        students: group.students.map(s => s._id),
        mentors: group.mentors.map(m => m._id),
        project: {
          title: group.project?.title || '',
          description: group.project?.description || '',
          requirements: group.project?.requirements || [''],
          technologies: group.project?.technologies || [''],
          difficulty: group.project?.difficulty || 'Intermediate',
          submissionDate: group.project?.submissionDate ? 
            new Date(group.project.submissionDate).toISOString().split('T')[0] : '',
          submissionFormat: group.project?.submissionFormat || 'GitHub Repository',
          resources: group.project?.resources || []
        }
      });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedGroup(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        project: {
          ...formData.project,
          requirements: formData.project.requirements.filter(req => req.trim()),
          technologies: formData.project.technologies.filter(tech => tech.trim()),
          submissionDate: formData.project.submissionDate || undefined
        }
      };

      if (modalMode === 'create') {
        const response = await api.post('/groups', submitData);
        if (response.data.success) {
          showSuccess('Group created successfully');
          fetchGroups();
          closeModal();
        }
      } else if (modalMode === 'edit') {
        const response = await api.put(`/groups/${selectedGroup._id}`, submitData);
        if (response.data.success) {
          showSuccess('Group updated successfully');
          fetchGroups();
          closeModal();
        }
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save group');
    }
  };

  const deleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/groups/${groupId}`);
      if (response.data.success) {
        showSuccess('Group deleted successfully');
        fetchGroups();
      }
    } catch (error) {
      showError('Failed to delete group');
    }
  };

  const updateFormData = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addArrayItem = (field, defaultValue = '') => {
    const [parent, child] = field.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: [...prev[parent][child], defaultValue]
      }
    }));
  };

  const removeArrayItem = (field, index) => {
    const [parent, child] = field.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: prev[parent][child].filter((_, i) => i !== index)
      }
    }));
  };

  const updateArrayItem = (field, index, value) => {
    const [parent, child] = field.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: prev[parent][child].map((item, i) => i === index ? value : item)
      }
    }));
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
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading groups...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
          Group Management
        </h2>
        <button
          onClick={() => openModal('create')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          Create Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Groups Found</h3>
          <p className="text-gray-500 mb-6">Create your first group to get started.</p>
          <button
            onClick={() => openModal('create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{group.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    group.status === 'Active' ? 'bg-green-100 text-green-800' :
                    group.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    group.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {group.status}
                  </span>
                </div>
                
                {group.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FontAwesomeIcon icon={faUser} />
                    <span>{group.studentCount} Students</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FontAwesomeIcon icon={faChalkboardTeacher} />
                    <span>{group.mentorCount} Mentors</span>
                  </div>
                  {group.project?.title && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FontAwesomeIcon icon={faProjectDiagram} />
                      <span className="truncate">{group.project.title}</span>
                    </div>
                  )}
                  {group.project?.submissionDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>Due: {formatDate(group.project.submissionDate)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openModal('view', group)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm transition-colors duration-200"
                    title="View Details"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    onClick={() => openModal('edit', group)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm transition-colors duration-200"
                    title="Edit Group"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => deleteGroup(group._id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm transition-colors duration-200"
                    title="Delete Group"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit/View Group */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {modalMode === 'create' ? 'Create New Group' : 
                 modalMode === 'edit' ? 'Edit Group' : 'Group Details'}
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {modalMode === 'view' && selectedGroup ? (
                // View Mode - Display group details
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Group Name:</label>
                        <span className="text-gray-900">{selectedGroup.name}</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status:</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedGroup.status === 'Active' ? 'bg-green-100 text-green-800' :
                          selectedGroup.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          selectedGroup.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedGroup.status}
                        </span>
                      </div>
                    </div>
                    {selectedGroup.description && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Description:</label>
                        <p className="text-gray-900 mt-1">{selectedGroup.description}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Students ({selectedGroup.students.length})</h4>
                    {selectedGroup.students.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedGroup.students.map(student => (
                          <div key={student._id} className="bg-gray-50 p-3 rounded border">
                            <div className="font-medium">{student.fullName}</div>
                            <div className="text-sm text-gray-600">{student.email}</div>
                            {student.usn && <div className="text-sm text-gray-600">USN: {student.usn}</div>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No students assigned</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Mentors ({selectedGroup.mentors.length})</h4>
                    {selectedGroup.mentors.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedGroup.mentors.map(mentor => (
                          <div key={mentor._id} className="bg-gray-50 p-3 rounded border">
                            <div className="font-medium">{mentor.fullName}</div>
                            <div className="text-sm text-gray-600">{mentor.email}</div>
                            <div className="text-sm text-gray-600 capitalize">Role: {mentor.role}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No mentors assigned</p>
                    )}
                  </div>

                  {selectedGroup.project?.title && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Project Details</h4>
                      <div className="bg-gray-50 p-4 rounded border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Title:</label>
                            <span className="text-gray-900">{selectedGroup.project.title}</span>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Difficulty:</label>
                            <span className="text-gray-900">{selectedGroup.project.difficulty}</span>
                          </div>
                          {selectedGroup.project.submissionDate && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Submission Date:</label>
                              <span className="text-gray-900">{formatDate(selectedGroup.project.submissionDate)}</span>
                            </div>
                          )}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Submission Format:</label>
                            <span className="text-gray-900">{selectedGroup.project.submissionFormat}</span>
                          </div>
                        </div>
                        {selectedGroup.project.description && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Description:</label>
                            <p className="text-gray-900 mt-1">{selectedGroup.project.description}</p>
                          </div>
                        )}
                        {selectedGroup.project.technologies && selectedGroup.project.technologies.length > 0 && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Technologies:</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedGroup.project.technologies.map((tech, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Create/Edit Mode - Form
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => updateFormData('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={formData.status || 'Active'}
                          onChange={(e) => updateFormData('status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Active">Active</option>
                          <option value="Completed">Completed</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Students Selection */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Select Students</h4>
                    <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-4">
                      {students.map(student => (
                        <label key={student._id} className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.students.includes(student._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateFormData('students', [...formData.students, student._id]);
                              } else {
                                updateFormData('students', formData.students.filter(id => id !== student._id));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{student.fullName}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                            {student.usn && <div className="text-xs text-gray-400">USN: {student.usn}</div>}
                          </div>
                        </label>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Selected: {formData.students.length} students</p>
                  </div>

                  {/* Mentors Selection */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Select Mentors</h4>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-4">
                      {mentors.map(mentor => (
                        <label key={mentor._id} className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.mentors.includes(mentor._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateFormData('mentors', [...formData.mentors, mentor._id]);
                              } else {
                                updateFormData('mentors', formData.mentors.filter(id => id !== mentor._id));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{mentor.fullName}</div>
                            <div className="text-sm text-gray-500">{mentor.email}</div>
                            <div className="text-xs text-gray-400 capitalize">Role: {mentor.role}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Selected: {formData.mentors.length} mentors</p>
                  </div>

                  {/* Project Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Project Information (Optional)</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                          <input
                            type="text"
                            value={formData.project.title}
                            onChange={(e) => updateFormData('project.title', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                          <select
                            value={formData.project.difficulty}
                            onChange={(e) => updateFormData('project.difficulty', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
                        <textarea
                          value={formData.project.description}
                          onChange={(e) => updateFormData('project.description', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Submission Date</label>
                          <input
                            type="date"
                            value={formData.project.submissionDate}
                            onChange={(e) => updateFormData('project.submissionDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Submission Format</label>
                          <select
                            value={formData.project.submissionFormat}
                            onChange={(e) => updateFormData('project.submissionFormat', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="GitHub Repository">GitHub Repository</option>
                            <option value="ZIP File">ZIP File</option>
                            <option value="Live Demo">Live Demo</option>
                            <option value="Document">Document</option>
                          </select>
                        </div>
                      </div>

                      {/* Requirements */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                        {formData.project.requirements.map((req, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={req}
                              onChange={(e) => updateArrayItem('project.requirements', index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter requirement"
                            />
                            <button
                              type="button"
                              onClick={() => removeArrayItem('project.requirements', index)}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addArrayItem('project.requirements', '')}
                          className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                        >
                          Add Requirement
                        </button>
                      </div>

                      {/* Technologies */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                        {formData.project.technologies.map((tech, index) => (
                          <div key={index} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={tech}
                              onChange={(e) => updateArrayItem('project.technologies', index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter technology"
                            />
                            <button
                              type="button"
                              onClick={() => removeArrayItem('project.technologies', index)}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addArrayItem('project.technologies', '')}
                          className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                        >
                          Add Technology
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                    >
                      {modalMode === 'create' ? 'Create Group' : 'Update Group'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManager;
