import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTasks, 
  faPlus, 
  faCalendarAlt,
  faClock,
  faExclamationTriangle,
  faCheckCircle,
  faSpinner,
  faFileAlt,
  faUsers,
  faFilter
} from '@fortawesome/free-solid-svg-icons';

const Tasks = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [tasks, setTasks] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    teamId: 'all'
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    teamId: '',
    dueDate: '',
    priority: 'medium',
    category: 'Programming',
    requirements: [],
    resources: []
  });

  const [submission, setSubmission] = useState({
    content: '',
    attachments: []
  });

  const priorities = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ];

  const statuses = [
    { value: 'draft', label: 'Draft', color: 'gray' },
    { value: 'active', label: 'Active', color: 'blue' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ];

  const categories = [
    'Programming',
    'Research',
    'Design',
    'Testing',
    'Documentation',
    'Presentation',
    'Project',
    'Other'
  ];

  useEffect(() => {
    fetchTasks();
    fetchUserTeams();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.priority !== 'all' && { priority: filters.priority }),
        ...(filters.teamId !== 'all' && { teamId: filters.teamId })
      });

      const response = await api.get(`/tasks?${params}`);
      if (response.data.success) {
        setTasks(response.data.data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTeams = async () => {
    try {
      const response = await api.get('/teams/user/me');
      if (response.data.success) {
        const allTeams = [
          ...response.data.data.createdTeams,
          ...response.data.data.mentoredTeams,
          ...response.data.data.joinedTeams
        ];
        // Remove duplicates
        const uniqueTeams = allTeams.filter((team, index, self) => 
          index === self.findIndex(t => t._id === team._id)
        );
        setUserTeams(uniqueTeams);
      }
    } catch (error) {
      console.error('Error fetching user teams:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...newTask,
        requirements: newTask.requirements.filter(req => req.trim()),
        resources: newTask.resources.filter(res => res.title && res.url)
      };

      const response = await api.post('/tasks', taskData);
      if (response.data.success) {
        showSuccess('Task created successfully!');
        setShowCreateModal(false);
        resetNewTask();
        fetchTasks();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/tasks/${selectedTask._id}/submit`, submission);
      if (response.data.success) {
        showSuccess('Task submitted successfully!');
        setShowSubmissionModal(false);
        setSelectedTask(null);
        setSubmission({ content: '', attachments: [] });
        fetchTasks();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to submit task');
    }
  };

  const resetNewTask = () => {
    setNewTask({
      title: '',
      description: '',
      teamId: '',
      dueDate: '',
      priority: 'medium',
      category: 'Programming',
      requirements: [],
      resources: []
    });
  };

  const addRequirement = () => {
    setNewTask(prev => ({ ...prev, requirements: [...prev.requirements, ''] }));
  };

  const updateRequirement = (index, value) => {
    setNewTask(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const removeRequirement = (index) => {
    setNewTask(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addResource = () => {
    setNewTask(prev => ({ 
      ...prev, 
      resources: [...prev.resources, { title: '', url: '', type: 'link' }] 
    }));
  };

  const updateResource = (index, field, value) => {
    setNewTask(prev => ({
      ...prev,
      resources: prev.resources.map((res, i) => 
        i === index ? { ...res, [field]: value } : res
      )
    }));
  };

  const removeResource = (index) => {
    setNewTask(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.draft;
  };

  const isTaskOverdue = (dueDate, status) => {
    return new Date() > new Date(dueDate) && status !== 'completed';
  };

  const hasUserSubmitted = (task) => {
    return task.submissions.some(sub => sub.student._id === user?.id);
  };

  const canCreateTask = user && ['mentor', 'admin'].includes(user.role);
  const canSubmitTask = user && user.role === 'student';

  const mentorOrCreatedTeams = userTeams.filter(team => 
    team.creator._id === user?.id || team.mentors.some(mentor => mentor._id === user?.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading tasks...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FontAwesomeIcon icon={faTasks} className="text-blue-600" />
              Tasks
            </h1>
            <p className="text-gray-600 mt-2">Manage and complete your team tasks</p>
          </div>
          {canCreateTask && mentorOrCreatedTeams.length > 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              Create Task
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
              <select
                value={filters.teamId}
                onChange={(e) => setFilters(prev => ({ ...prev, teamId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Teams</option>
                {userTeams.map(team => (
                  <option key={team._id} value={team._id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faTasks} className="text-gray-300 text-6xl mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks found</h3>
            <p className="text-gray-500 mb-6">
              {filters.status !== 'all' || filters.priority !== 'all' || filters.teamId !== 'all'
                ? 'Try adjusting your filters to find tasks.'
                : canCreateTask 
                  ? 'Create your first task to get started!'
                  : 'Join a team to see and complete tasks.'
              }
            </p>
            {canCreateTask && mentorOrCreatedTeams.length > 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Create First Task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      {isTaskOverdue(task.dueDate, task.status) && (
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" title="Overdue" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <FontAwesomeIcon icon={faUsers} />
                        {task.team.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      Created by {task.creator.fullName}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>

                {task.requirements && task.requirements.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {task.requirements.slice(0, 3).map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                      {task.requirements.length > 3 && (
                        <li className="text-gray-500">+{task.requirements.length - 3} more...</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faFileAlt} />
                      {task.submissionCount} submissions
                    </span>
                    {task.status === 'active' && (
                      <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faClock} />
                        {task.pendingSubmissions} pending review
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {canSubmitTask && task.status === 'active' && !hasUserSubmitted(task) && (
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowSubmissionModal(true);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                      >
                        Submit Task
                      </button>
                    )}
                    {hasUserSubmitted(task) && (
                      <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Submitted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">Create New Task</h3>
                <button className="text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setShowCreateModal(false)}>×</button>
              </div>
              
              <form className="p-6 space-y-4" onSubmit={handleCreateTask}>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                  <input
                    type="text"
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    placeholder="Enter task title..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-1">Team *</label>
                    <select
                      id="teamId"
                      value={newTask.teamId}
                      onChange={(e) => setNewTask(prev => ({ ...prev, teamId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Team</option>
                      {mentorOrCreatedTeams.map(team => (
                        <option key={team._id} value={team._id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      id="priority"
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>{priority.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                    <input
                      type="datetime-local"
                      id="dueDate"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    required
                    placeholder="Describe the task in detail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                  {newTask.requirements.map((req, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter requirement..."
                      />
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Requirement
                  </button>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Submit Task Modal */}
        {showSubmissionModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowSubmissionModal(false)}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">Submit Task: {selectedTask.title}</h3>
                <button className="text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setShowSubmissionModal(false)}>×</button>
              </div>
              
              <form className="p-6 space-y-4" onSubmit={handleSubmitTask}>
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Submission Content *</label>
                  <textarea
                    id="content"
                    value={submission.content}
                    onChange={(e) => setSubmission(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="8"
                    required
                    placeholder="Describe your solution, approach, and any relevant details..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200"
                    onClick={() => setShowSubmissionModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
                  >
                    Submit Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
