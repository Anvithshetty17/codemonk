import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import TaskManager from '../admin/TaskManager';
import api from '../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faTasks, 
  faPlus,
  faEye,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faCalendarAlt,
  faClock,
  faExclamationTriangle,
  faStar,
  faUserGraduate
} from '@fortawesome/free-solid-svg-icons';

const MentorDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createTaskModal, setCreateTaskModal] = useState({ show: false, team: null });
  const [reviewModal, setReviewModal] = useState({ show: false, submission: null });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    requirements: ['']
  });
  const [review, setReview] = useState({
    status: 'approved',
    comment: '',
    rating: ''
  });

  useEffect(() => {
    fetchMentorData();
  }, []);

  const fetchMentorData = async () => {
    try {
      setLoading(true);
      // Fetch teams where user is creator or mentor
      const teamsResponse = await api.get('/teams/user/me');
      const tasksResponse = await api.get('/tasks/mentor/me');
      
      if (teamsResponse.data.success && tasksResponse.data.success) {
        const mentorTeams = [
          ...(teamsResponse.data.data.createdTeams || []),
          ...(teamsResponse.data.data.mentorTeams || [])
        ];
        setTeams(mentorTeams);
        setTasks(tasksResponse.data.data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching mentor data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...newTask,
        team: createTaskModal.team._id,
        requirements: newTask.requirements.filter(req => req.trim() !== '')
      };
      
      const response = await api.post('/tasks', taskData);
      if (response.data.success) {
        showSuccess('Task created successfully!');
        setCreateTaskModal({ show: false, team: null });
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: '',
          requirements: ['']
        });
        fetchMentorData();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleReviewSubmission = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/tasks/${reviewModal.submission.task}/review/${reviewModal.submission._id}`, review);
      if (response.data.success) {
        showSuccess('Review submitted successfully!');
        setReviewModal({ show: false, submission: null });
        setReview({
          status: 'approved',
          comment: '',
          rating: ''
        });
        fetchMentorData();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const addRequirement = () => {
    setNewTask(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
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

  const getPendingSubmissions = () => {
    return tasks.reduce((acc, task) => {
      const pendingSubmissions = task.submissions?.filter(sub => sub.status === 'submitted') || [];
      return [...acc, ...pendingSubmissions.map(sub => ({ ...sub, task: task._id, taskTitle: task.title }))];
    }, []);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading mentor dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Teams</p>
              <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
            </div>
            <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'active').length}</p>
            </div>
            <FontAwesomeIcon icon={faTasks} className="text-green-600 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{getPendingSubmissions().length}</p>
            </div>
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-600 text-2xl" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {teams.reduce((total, team) => total + (team.members?.length || 0), 0)}
              </p>
            </div>
            <FontAwesomeIcon icon={faUserGraduate} className="text-purple-600 text-2xl" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('teams')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'teams'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              My Teams
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={faTasks} className="mr-2" />
              Tasks & Reviews
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'teams' && (
            <div className="space-y-6">
              {teams.length === 0 ? (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faUsers} className="text-gray-300 text-6xl mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Teams Yet</h3>
                  <p className="text-gray-500 mb-6">Create your first team to start mentoring students.</p>
                  <a
                    href="/teams"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    Create Team
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {teams.map(team => (
                    <div key={team._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{team.name}</h3>
                          <p className="text-sm text-gray-600">{team.category}</p>
                        </div>
                        <button
                          onClick={() => setCreateTaskModal({ show: true, team })}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200 flex items-center gap-1"
                        >
                          <FontAwesomeIcon icon={faPlus} />
                          Add Task
                        </button>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{team.description}</p>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <span>{team.members?.length || 0}/{team.maxMembers} members</span>
                        <span>Skills: {team.skills?.slice(0, 2).join(', ')}{team.skills?.length > 2 && '...'}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Created {new Date(team.createdAt).toLocaleDateString()}
                        </div>
                        <a
                          href={`/teams`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <TaskManager />
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {createTaskModal.show && createTaskModal.team && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setCreateTaskModal({ show: false, team: null })}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Create Task for {createTaskModal.team.name}</h3>
              <button className="text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setCreateTaskModal({ show: false, team: null })}>×</button>
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
                />
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
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    id="priority"
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    id="dueDate"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                {newTask.requirements.map((req, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Requirement ${index + 1}`}
                    />
                    {newTask.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRequirement}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Add Requirement
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200"
                  onClick={() => setCreateTaskModal({ show: false, team: null })}
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

      {/* Review Submission Modal */}
      {reviewModal.show && reviewModal.submission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setReviewModal({ show: false, submission: null })}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Review Submission</h3>
              <button className="text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setReviewModal({ show: false, submission: null })}>×</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Student Submission</h4>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Student:</strong> {reviewModal.submission.student.fullName}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Task:</strong> {reviewModal.submission.taskTitle}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Submitted:</strong> {new Date(reviewModal.submission.submittedAt).toLocaleDateString()}
                </p>
                <div className="mt-3">
                  <strong className="text-gray-800">Content:</strong>
                  <p className="text-gray-700 mt-1 whitespace-pre-wrap">{reviewModal.submission.content}</p>
                </div>
              </div>

              <form onSubmit={handleReviewSubmission} className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Review Status *</label>
                  <select
                    id="status"
                    value={review.status}
                    onChange={(e) => setReview(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="resubmit">Needs Resubmission</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Feedback Comment *</label>
                  <textarea
                    id="comment"
                    value={review.comment}
                    onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    required
                    placeholder="Provide constructive feedback on the submission..."
                  />
                </div>

                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Rating (1-10)</label>
                  <input
                    type="number"
                    id="rating"
                    min="1"
                    max="10"
                    value={review.rating}
                    onChange={(e) => setReview(prev => ({ ...prev, rating: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional rating out of 10"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200"
                    onClick={() => setReviewModal({ show: false, submission: null })}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
