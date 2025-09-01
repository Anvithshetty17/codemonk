import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTasks, 
  faPlay, 
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
  faSearch
} from '@fortawesome/free-solid-svg-icons';

const StudentTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'submit'
  const [statusFilter, setStatusFilter] = useState('');
  const [submission, setSubmission] = useState({
    code: '',
    answers: [],
    notes: '',
    submissionUrl: ''
  });
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchMyTasks();
  }, [statusFilter]);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const response = await api.get(`/tasks/my-tasks${params}`);
      
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

  const startTask = async (taskId) => {
    try {
      const response = await api.post(`/tasks/${taskId}/start`);
      if (response.data.success) {
        showSuccess('Task started successfully');
        fetchMyTasks();
      }
    } catch (error) {
      console.error('Error starting task:', error);
      showError(error.response?.data?.message || 'Failed to start task');
    }
  };

  const submitTask = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/tasks/${selectedTask._id}/submit`, submission);
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
    setSubmission({
      code: '',
      answers: [],
      notes: '',
      submissionUrl: ''
    });
  };

  const openModal = (type, task) => {
    setModalType(type);
    setSelectedTask(task);
    if (type === 'submit') {
      // Initialize answers array for reading tasks
      if (task.type === 'Reading' && task.content.questions) {
        setSubmission(prev => ({
          ...prev,
          answers: new Array(task.content.questions.length).fill('')
        }));
      }
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
    resetSubmission();
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'Coding': return faCode;
      case 'Reading': return faBook;
      case 'Project': return faProjectDiagram;
      case 'Quiz': return faQuestionCircle;
      case 'Assignment': return faFileAlt;
      case 'Research': return faSearch;
      default: return faTasks;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <FontAwesomeIcon icon={faCheck} className="text-green-500" />;
      case 'Submitted': return <FontAwesomeIcon icon={faCheck} className="text-blue-500" />;
      case 'In Progress': return <FontAwesomeIcon icon={faClock} className="text-yellow-500" />;
      case 'Overdue': return <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />;
      default: return <FontAwesomeIcon icon={faClock} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'Submitted': return 'text-blue-600 bg-blue-100';
      case 'In Progress': return 'text-yellow-600 bg-yellow-100';
      case 'Overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate, status) => {
    return new Date() > new Date(dueDate) && status !== 'Completed' && status !== 'Submitted';
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
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
          My Tasks ({tasks.length})
        </h2>
        
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tasks</option>
            <option value="Assigned">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Submitted">Submitted</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FontAwesomeIcon icon={faTasks} className="text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tasks Found</h3>
          <p className="text-gray-500">
            {statusFilter 
              ? `No tasks with status "${statusFilter}".`
              : 'You have no tasks assigned yet.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map((task) => {
            const assignment = task.assignment;
            const overdue = isOverdue(assignment.dueDate, assignment.status);
            const daysRemaining = getDaysRemaining(assignment.dueDate);
            
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
                    {task.estimatedTime && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        ~{task.estimatedTime}m
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(assignment.status)}`}>
                        {getStatusIcon(assignment.status)}
                        {assignment.status}
                      </span>
                      {assignment.pointsAwarded > 0 && (
                        <span className="text-sm font-semibold text-green-600">
                          +{assignment.pointsAwarded} points
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>Due: {formatDate(assignment.dueDate)}</span>
                    </div>
                    
                    {daysRemaining >= 0 && assignment.status !== 'Completed' && (
                      <div className={`text-xs mt-1 ${overdue ? 'text-red-600' : daysRemaining <= 1 ? 'text-yellow-600' : 'text-gray-600'}`}>
                        {overdue ? 'Overdue' : daysRemaining === 0 ? 'Due today' : `${daysRemaining} days remaining`}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal('view', task)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200"
                    >
                      View Details
                    </button>
                    
                    {assignment.status === 'Assigned' && (
                      <button
                        onClick={() => startTask(task._id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200 flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faPlay} />
                        Start
                      </button>
                    )}
                    
                    {(assignment.status === 'In Progress' || assignment.status === 'Assigned') && (
                      <button
                        onClick={() => openModal('submit', task)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200"
                      >
                        Submit
                      </button>
                    )}
                  </div>

                  {assignment.feedback && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <h5 className="text-sm font-semibold text-gray-800 mb-1">Feedback:</h5>
                      <p className="text-sm text-gray-700">{assignment.feedback}</p>
                      {assignment.grade && (
                        <p className="text-sm text-gray-600 mt-1">Grade: {assignment.grade}/100</p>
                      )}
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
                  {selectedTask.estimatedTime && (
                    <span className="text-sm text-gray-600">
                      Estimated time: {selectedTask.estimatedTime} minutes
                    </span>
                  )}
                </div>
              </div>

              {/* Task Content */}
              {selectedTask.type === 'Coding' && selectedTask.content.problemStatement && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Problem Statement</h5>
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <pre className="whitespace-pre-wrap text-sm">{selectedTask.content.problemStatement}</pre>
                  </div>

                  {selectedTask.content.inputFormat && (
                    <div className="mb-4">
                      <h6 className="font-semibold text-gray-800 mb-1">Input Format</h6>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <pre className="whitespace-pre-wrap text-sm">{selectedTask.content.inputFormat}</pre>
                      </div>
                    </div>
                  )}

                  {selectedTask.content.outputFormat && (
                    <div className="mb-4">
                      <h6 className="font-semibold text-gray-800 mb-1">Output Format</h6>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <pre className="whitespace-pre-wrap text-sm">{selectedTask.content.outputFormat}</pre>
                      </div>
                    </div>
                  )}

                  {selectedTask.content.constraints && (
                    <div className="mb-4">
                      <h6 className="font-semibold text-gray-800 mb-1">Constraints</h6>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <pre className="whitespace-pre-wrap text-sm">{selectedTask.content.constraints}</pre>
                      </div>
                    </div>
                  )}

                  {selectedTask.content.examples && selectedTask.content.examples.length > 0 && (
                    <div>
                      <h6 className="font-semibold text-gray-800 mb-2">Examples</h6>
                      {selectedTask.content.examples.map((example, index) => (
                        <div key={index} className="border border-gray-200 rounded-md p-3 mb-3">
                          <h6 className="font-medium text-gray-700 mb-2">Example {index + 1}</h6>
                          {example.input && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-600">Input:</span>
                              <pre className="bg-gray-50 p-2 rounded text-sm mt-1">{example.input}</pre>
                            </div>
                          )}
                          {example.output && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-600">Output:</span>
                              <pre className="bg-gray-50 p-2 rounded text-sm mt-1">{example.output}</pre>
                            </div>
                          )}
                          {example.explanation && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Explanation:</span>
                              <p className="text-sm text-gray-700 mt-1">{example.explanation}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedTask.type === 'Reading' && selectedTask.content.readingMaterial && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Reading Material</h5>
                  <div className="bg-gray-50 p-4 rounded-md max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{selectedTask.content.readingMaterial}</pre>
                  </div>
                  
                  {selectedTask.content.questions && selectedTask.content.questions.length > 0 && (
                    <div className="mt-4">
                      <h6 className="font-semibold text-gray-800 mb-2">Questions</h6>
                      {selectedTask.content.questions.map((question, index) => (
                        <div key={index} className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            {index + 1}. {question.question}
                          </p>
                          {question.options && question.options.length > 0 && (
                            <div className="ml-4">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="text-sm text-gray-600">
                                  {String.fromCharCode(97 + optIndex)}. {option}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Assignment Info */}
              <div className="border-t pt-4">
                <h5 className="font-semibold text-gray-800 mb-2">Assignment Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTask.assignment.status)}`}>
                      {selectedTask.assignment.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Due Date:</span>
                    <span className="ml-2 text-sm text-gray-800">{formatDate(selectedTask.assignment.dueDate)}</span>
                  </div>
                  {selectedTask.assignment.startedAt && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Started:</span>
                      <span className="ml-2 text-sm text-gray-800">{formatDate(selectedTask.assignment.startedAt)}</span>
                    </div>
                  )}
                  {selectedTask.assignment.submittedAt && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Submitted:</span>
                      <span className="ml-2 text-sm text-gray-800">{formatDate(selectedTask.assignment.submittedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
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
              {selectedTask.type === 'Coding' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Code Solution *</label>
                  <textarea
                    value={submission.code}
                    onChange={(e) => setSubmission(prev => ({ ...prev, code: e.target.value }))}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Enter your code here..."
                    required
                  />
                </div>
              )}

              {selectedTask.type === 'Reading' && selectedTask.content.questions && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Questions</h4>
                  {selectedTask.content.questions.map((question, index) => (
                    <div key={index} className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {index + 1}. {question.question}
                      </label>
                      {question.type === 'multiple-choice' && question.options ? (
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <label key={optIndex} className="flex items-center">
                              <input
                                type="radio"
                                name={`question-${index}`}
                                value={option}
                                onChange={(e) => {
                                  const newAnswers = [...submission.answers];
                                  newAnswers[index] = e.target.value;
                                  setSubmission(prev => ({ ...prev, answers: newAnswers }));
                                }}
                                className="mr-2"
                              />
                              <span className="text-sm">{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          value={submission.answers[index] || ''}
                          onChange={(e) => {
                            const newAnswers = [...submission.answers];
                            newAnswers[index] = e.target.value;
                            setSubmission(prev => ({ ...prev, answers: newAnswers }));
                          }}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your answer..."
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {(selectedTask.type === 'Project' || selectedTask.type === 'Assignment') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Submission URL (GitHub, Drive, etc.)</label>
                  <input
                    type="url"
                    value={submission.submissionUrl}
                    onChange={(e) => setSubmission(prev => ({ ...prev, submissionUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/username/project"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                <textarea
                  value={submission.notes}
                  onChange={(e) => setSubmission(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional notes about your submission..."
                />
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
