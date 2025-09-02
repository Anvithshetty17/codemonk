import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTasks, 
  faCheck, 
  faClock, 
  faExclamationTriangle,
  faStar,
  faCalendarAlt,
  faCode,
  faBook,
  faProjectDiagram,
  faQuestionCircle,
  faFileAlt,
  faUpload,
  faDownload,
  faEye,
  faUser
} from '@fortawesome/free-solid-svg-icons';

const StudentTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'submit'
  const [submission, setSubmission] = useState({
    content: '',
    attachments: []
  });
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks/my-section');
      
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

  const submitTask = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('content', submission.content);
      
      // Append files
      submissionFiles.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await api.post(`/tasks/${selectedTask._id}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        showSuccess('Task submitted successfully');
        setShowModal(false);
        resetSubmission();
        fetchMyTasks();
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      showError(error.response?.data?.message || 'Failed to submit task');
    }
  };

  const resetSubmission = () => {
    setSubmission({ content: '', attachments: [] });
    setSubmissionFiles([]);
  };

  const openModal = (type, task) => {
    setModalType(type);
    setSelectedTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
    resetSubmission();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSubmissionFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'Coding': return faCode;
      case 'Reading': return faBook;
      case 'Project': return faProjectDiagram;
      case 'Quiz': return faQuestionCircle;
      case 'Assignment': return faFileAlt;
      default: return faTasks;
    }
  };

  const getStatusIcon = (task) => {
    if (task.mySubmission) {
      switch (task.mySubmission.status) {
        case 'approved': return <FontAwesomeIcon icon={faCheck} className="text-green-500" />;
        case 'rejected': return <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />;
        default: return <FontAwesomeIcon icon={faClock} className="text-blue-500" />;
      }
    }
    return task.isOverdue ? 
      <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" /> :
      <FontAwesomeIcon icon={faClock} className="text-gray-500" />;
  };

  const getStatusColor = (task) => {
    if (task.mySubmission) {
      switch (task.mySubmission.status) {
        case 'approved': return 'text-green-600 bg-green-100';
        case 'rejected': return 'text-red-600 bg-red-100';
        default: return 'text-blue-600 bg-blue-100';
      }
    }
    return task.isOverdue ? 'text-red-600 bg-red-100' : 'text-gray-600 bg-gray-100';
  };

  const getStatusText = (task) => {
    if (task.mySubmission) {
      switch (task.mySubmission.status) {
        case 'approved': return 'Approved';
        case 'rejected': return 'Rejected';
        default: return 'Under Review';
      }
    }
    return task.isOverdue ? 'Overdue' : 'Not Submitted';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const due = new Date(deadline);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faTasks} className="text-blue-600" />
          My Section Tasks ({tasks.length})
        </h2>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FontAwesomeIcon icon={faTasks} className="text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tasks Found</h3>
          <p className="text-gray-500">No tasks have been assigned to your section yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const daysRemaining = getDaysRemaining(task.deadline);
            
            return (
              <div key={task._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon icon={getTaskIcon(task.type)} className="text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                      </div>
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
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(task)}`}>
                        {getStatusIcon(task)}
                        {getStatusText(task)}
                      </span>
                      {task.mySubmission?.pointsAwarded > 0 && (
                        <span className="text-sm font-semibold text-green-600">
                          +{task.mySubmission.pointsAwarded} points
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>Due: {formatDate(task.deadline)}</span>
                    </div>
                    
                    {daysRemaining >= 0 && !task.mySubmission && (
                      <div className={`text-xs mt-1 ${task.isOverdue ? 'text-red-600' : daysRemaining <= 1 ? 'text-yellow-600' : 'text-gray-600'}`}>
                        {task.isOverdue ? 'Overdue' : daysRemaining === 0 ? 'Due today' : `${daysRemaining} days remaining`}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <FontAwesomeIcon icon={faUser} />
                      Created by: {task.createdBy.fullName}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal('view', task)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200 flex items-center gap-1"
                    >
                      <FontAwesomeIcon icon={faEye} />
                      View Details
                    </button>
                    
                    {task.canSubmit && (
                      <button
                        onClick={() => openModal('submit', task)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200 flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faUpload} />
                        Submit
                      </button>
                    )}
                  </div>

                  {task.mySubmission?.feedback && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <h5 className="text-sm font-semibold text-gray-800 mb-1">Feedback:</h5>
                      <p className="text-sm text-gray-700">{task.mySubmission.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Task Modal */}
      {showModal && modalType === 'view' && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Task Details</h3>
              <button 
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FontAwesomeIcon icon={getTaskIcon(selectedTask.type)} className="text-blue-600 text-xl" />
                  <h4 className="text-lg font-semibold text-gray-800">{selectedTask.title}</h4>
                  <span className="flex items-center gap-1 text-yellow-600">
                    <FontAwesomeIcon icon={faStar} />
                    {selectedTask.points} points
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{selectedTask.description}</p>
                
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {selectedTask.type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(selectedTask.difficulty)}`}>
                    {selectedTask.difficulty}
                  </span>
                  <span className="text-sm text-gray-600">
                    Created by: {selectedTask.createdBy.fullName}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              {selectedTask.instructions && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Instructions</h5>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">{selectedTask.instructions}</pre>
                  </div>
                </div>
              )}

              {/* Attachments */}
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

              {/* Task Info */}
              <div className="border-t pt-4">
                <h5 className="font-semibold text-gray-800 mb-2">Task Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTask)}`}>
                      {getStatusText(selectedTask)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Due Date:</span>
                    <span className="ml-2 text-sm text-gray-800">{formatDate(selectedTask.deadline)}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Assigned Sections:</span>
                    <span className="ml-2 text-sm text-gray-800">{selectedTask.assignedToSections.join(', ')}</span>
                  </div>
                  {selectedTask.mySubmission && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Submitted:</span>
                      <span className="ml-2 text-sm text-gray-800">{formatDate(selectedTask.mySubmission.submittedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* My Submission */}
              {selectedTask.mySubmission && (
                <div className="border-t pt-4">
                  <h5 className="font-semibold text-gray-800 mb-2">My Submission</h5>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">{selectedTask.mySubmission.content}</pre>
                  </div>
                  
                  {selectedTask.mySubmission.attachments && selectedTask.mySubmission.attachments.length > 0 && (
                    <div className="mt-3">
                      <h6 className="font-medium text-gray-700 mb-2">Submitted Files:</h6>
                      <div className="space-y-1">
                        {selectedTask.mySubmission.attachments.map((attachment, index) => (
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Task Modal */}
      {showModal && modalType === 'submit' && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Submit Task: {selectedTask.title}</h3>
              <button 
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={submitTask} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Submission *</label>
                <textarea
                  value={submission.content}
                  onChange={(e) => setSubmission(prev => ({ ...prev, content: e.target.value }))}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your solution, explanation, or answer here..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attachments (Optional)</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt,.zip,.rar"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: Images, PDF, Documents, Archives (Max 10MB each)
                </p>
                
                {submissionFiles.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h6>
                    <div className="space-y-2">
                      {submissionFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  Submit Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTasks;
