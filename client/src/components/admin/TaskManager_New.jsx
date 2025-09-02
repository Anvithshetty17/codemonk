import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTasks, 
  faPlus, 
  faEye, 
  faEdit, 
  faTrash, 
  faClock,
  faCheckCircle,
  faExclamationTriangle,
  faStar,
  faDownload,
  faUser,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalType, setModalType] = useState('create'); // 'create', 'view', 'edit', 'submissions'
  const { showError, showSuccess } = useToast();

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    instructions: '',
    type: 'assignment',
    difficulty: 'medium',
    points: 10,
    deadline: '',
    assignedToSections: ['A']
  });

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks/my-tasks');
      
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

  const createTask = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/tasks', newTask);

      if (response.data.success) {
        showSuccess('Task created successfully');
        setShowModal(false);
        resetForm();
        fetchMyTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
      showError(error.response?.data?.message || 'Failed to create task');
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      if (response.data.success) {
        showSuccess('Task deleted successfully');
        fetchMyTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      showError(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const reviewSubmission = async (taskId, submissionId, reviewData) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/submissions/${submissionId}/review`, reviewData);
      if (response.data.success) {
        showSuccess('Submission reviewed successfully');
        fetchMyTasks();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error reviewing submission:', error);
      showError(error.response?.data?.message || 'Failed to review submission');
    }
  };

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      instructions: '',
      type: 'assignment',
      difficulty: 'medium',
      points: 10,
      deadline: '',
      assignedToSections: ['A']
    });
  };

  const openModal = (type, task = null) => {
    setModalType(type);
    setSelectedTask(task);
    if (type === 'edit' && task) {
      setNewTask({
        title: task.title,
        description: task.description,
        instructions: task.instructions,
        type: task.type,
        difficulty: task.difficulty,
        points: task.points,
        deadline: new Date(task.deadline).toISOString().slice(0, 16),
        assignedToSections: task.assignedToSections
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
    resetForm();
  };

  const handleSectionChange = (section) => {
    setNewTask(prev => ({
      ...prev,
      assignedToSections: prev.assignedToSections.includes(section)
        ? prev.assignedToSections.filter(s => s !== section)
        : [...prev.assignedToSections, section]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faTasks} className="text-blue-600" />
          Task Management ({tasks.length})
        </h2>
        <button
          onClick={() => openModal('create')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faPlus} />
          Create Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FontAwesomeIcon icon={faTasks} className="text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tasks Found</h3>
          <p className="text-gray-500">You haven't created any tasks yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div key={task._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{task.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                    <span className="font-semibold text-gray-800">{task.points}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {task.type}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(task.difficulty)}`}>
                    {task.difficulty}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                    {task.status || 'published'}
                  </span>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>Due: {formatDate(task.deadline)}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Sections:</span> {task.assignedToSections.join(', ')}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Submissions:</span> {task.submissions?.length || 0}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => openModal('view', task)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200 flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faEye} />
                    View
                  </button>
                  
                  <button
                    onClick={() => openModal('submissions', task)}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200"
                  >
                    Submissions ({task.submissions?.length || 0})
                  </button>
                  
                  <button
                    onClick={() => openModal('edit', task)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200 flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200 flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Task Modal */}
      {showModal && (modalType === 'create' || modalType === 'edit') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {modalType === 'create' ? 'Create New Task' : 'Edit Task'}
              </h3>
              <button className="text-gray-500 hover:text-gray-700 text-2xl" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={createTask} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newTask.points}
                    onChange={(e) => setNewTask(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="assignment">Assignment</option>
                    <option value="project">Project</option>
                    <option value="quiz">Quiz</option>
                    <option value="research">Research</option>
                    <option value="coding">Coding</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty *</label>
                  <select
                    value={newTask.difficulty}
                    onChange={(e) => setNewTask(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deadline *</label>
                  <input
                    type="datetime-local"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                <textarea
                  value={newTask.instructions}
                  onChange={(e) => setNewTask(prev => ({ ...prev, instructions: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Detailed instructions for the task..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Sections *</label>
                <div className="flex gap-4">
                  {['A', 'B', 'C'].map(section => (
                    <label key={section} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newTask.assignedToSections.includes(section)}
                        onChange={() => handleSectionChange(section)}
                        className="mr-2"
                      />
                      Section {section}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4">
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
                  {modalType === 'create' ? 'Create Task' : 'Update Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Task Modal */}
      {showModal && modalType === 'view' && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Task Details</h3>
              <button className="text-gray-500 hover:text-gray-700 text-2xl" onClick={closeModal}>×</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">{selectedTask.title}</h4>
                  <p className="text-gray-600">{selectedTask.description}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">{selectedTask.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Difficulty:</span>
                    <span className={`px-2 py-1 text-sm rounded-full ${getDifficultyColor(selectedTask.difficulty)}`}>
                      {selectedTask.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Points:</span>
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                      {selectedTask.points}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Deadline:</span>
                    <span>{formatDate(selectedTask.deadline)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Sections:</span>
                    <span>{selectedTask.assignedToSections.join(', ')}</span>
                  </div>
                </div>
              </div>

              {selectedTask.instructions && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Instructions</h5>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">{selectedTask.instructions}</pre>
                  </div>
                </div>
              )}

              {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Attachments</h5>
                  <div className="space-y-2">
                    {selectedTask.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FontAwesomeIcon icon={faDownload} className="text-blue-600" />
                        <a 
                          href={attachment.path} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {attachment.originalName}
                        </a>
                        <span className="text-xs text-gray-500">
                          ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {showModal && modalType === 'submissions' && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                Submissions for "{selectedTask.title}" ({selectedTask.submissions?.length || 0})
              </h3>
              <button className="text-gray-500 hover:text-gray-700 text-2xl" onClick={closeModal}>×</button>
            </div>
            
            <div className="p-6">
              {selectedTask.submissions && selectedTask.submissions.length > 0 ? (
                <div className="space-y-4">
                  {selectedTask.submissions.map((submission) => (
                    <div key={submission._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                            <FontAwesomeIcon icon={faUser} />
                            {submission.student.fullName} ({submission.student.usn})
                          </h5>
                          <p className="text-sm text-gray-600">Section: {submission.student.section}</p>
                          <p className="text-sm text-gray-600">Submitted: {formatDate(submission.submittedAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            submission.status === 'approved' ? 'text-green-600 bg-green-100' :
                            submission.status === 'rejected' ? 'text-red-600 bg-red-100' :
                            'text-blue-600 bg-blue-100'
                          }`}>
                            {submission.status === 'pending' ? 'Pending Review' : submission.status}
                          </span>
                          {submission.pointsAwarded > 0 && (
                            <span className="text-sm font-semibold text-green-600">
                              +{submission.pointsAwarded} points
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <h6 className="font-medium text-gray-700 mb-1">Submission Content:</h6>
                        <div className="bg-gray-50 p-3 rounded">
                          <pre className="whitespace-pre-wrap text-sm">{submission.content}</pre>
                        </div>
                      </div>

                      {submission.attachments && submission.attachments.length > 0 && (
                        <div className="mb-3">
                          <h6 className="font-medium text-gray-700 mb-1">Attachments:</h6>
                          <div className="space-y-1">
                            {submission.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <FontAwesomeIcon icon={faDownload} className="text-blue-600" />
                                <a 
                                  href={attachment.path} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {attachment.originalName}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {submission.feedback && (
                        <div className="mb-3">
                          <h6 className="font-medium text-gray-700 mb-1">Feedback:</h6>
                          <p className="text-sm text-gray-600">{submission.feedback}</p>
                        </div>
                      )}

                      {submission.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const feedback = prompt('Enter feedback (optional):');
                              const points = prompt('Enter points to award (0-' + selectedTask.points + '):');
                              if (points !== null) {
                                reviewSubmission(selectedTask._id, submission._id, {
                                  status: 'approved',
                                  feedback: feedback || '',
                                  pointsAwarded: parseInt(points) || 0
                                });
                              }
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const feedback = prompt('Enter rejection reason:');
                              if (feedback) {
                                reviewSubmission(selectedTask._id, submission._id, {
                                  status: 'rejected',
                                  feedback,
                                  pointsAwarded: 0
                                });
                              }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faTasks} className="text-4xl text-gray-400 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No Submissions Yet</h4>
                  <p className="text-gray-500">Students haven't submitted this task yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
