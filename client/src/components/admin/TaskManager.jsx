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
  faUserCheck,
  faClock,
  faCheckCircle,
  faExclamationTriangle,
  faStar
} from '@fortawesome/free-solid-svg-icons';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalType, setModalType] = useState('create'); // 'create', 'view', 'edit'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    difficulty: '',
    tag: ''
  });
  const { showError, showSuccess } = useToast();

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'Coding',
    difficulty: 'Medium',
    points: 10,
    content: {
      problemStatement: '',
      inputFormat: '',
      outputFormat: '',
      constraints: '',
      examples: [{ input: '', output: '', explanation: '' }],
      readingMaterial: '',
      questions: [],
      resources: []
    },
    assignedStudents: [],
    tags: [],
    estimatedTime: 60
  });

  useEffect(() => {
    fetchTasks();
    fetchStudents();
  }, [currentPage, filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...filters
      });

      const response = await api.get(`/tasks?${params}`);
      if (response.data.success) {
        setTasks(response.data.data.tasks);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/users?role=student&limit=1000');
      if (response.data.success) {
        setStudents(response.data.data.users);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...newTask,
        tags: newTask.tags.filter(tag => tag.trim() !== ''),
        assignedStudents: newTask.assignedStudents.map(assignment => ({
          studentId: assignment.studentId,
          dueDate: assignment.dueDate
        }))
      };

      const response = await api.post('/tasks', taskData);
      if (response.data.success) {
        showSuccess('Task created successfully');
        setShowModal(false);
        resetNewTask();
        fetchTasks();
      }
    } catch (error) {
      console.error('Error creating task:', error);
      showError(error.response?.data?.message || 'Failed to create task');
    }
  };

  const resetNewTask = () => {
    setNewTask({
      title: '',
      description: '',
      type: 'Coding',
      difficulty: 'Medium',
      points: 10,
      content: {
        problemStatement: '',
        inputFormat: '',
        outputFormat: '',
        constraints: '',
        examples: [{ input: '', output: '', explanation: '' }],
        readingMaterial: '',
        questions: [],
        resources: []
      },
      assignedStudents: [],
      tags: [],
      estimatedTime: 60
    });
  };

  const openModal = (type, task = null) => {
    setModalType(type);
    setSelectedTask(task);
    if (type === 'create') {
      resetNewTask();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
    resetNewTask();
  };

  const addExample = () => {
    setNewTask(prev => ({
      ...prev,
      content: {
        ...prev.content,
        examples: [...prev.content.examples, { input: '', output: '', explanation: '' }]
      }
    }));
  };

  const updateExample = (index, field, value) => {
    setNewTask(prev => ({
      ...prev,
      content: {
        ...prev.content,
        examples: prev.content.examples.map((example, i) => 
          i === index ? { ...example, [field]: value } : example
        )
      }
    }));
  };

  const removeExample = (index) => {
    setNewTask(prev => ({
      ...prev,
      content: {
        ...prev.content,
        examples: prev.content.examples.filter((_, i) => i !== index)
      }
    }));
  };

  const addAssignment = () => {
    setNewTask(prev => ({
      ...prev,
      assignedStudents: [...prev.assignedStudents, { studentId: '', dueDate: '' }]
    }));
  };

  const updateAssignment = (index, field, value) => {
    setNewTask(prev => ({
      ...prev,
      assignedStudents: prev.assignedStudents.map((assignment, i) => 
        i === index ? { ...assignment, [field]: value } : assignment
      )
    }));
  };

  const removeAssignment = (index) => {
    setNewTask(prev => ({
      ...prev,
      assignedStudents: prev.assignedStudents.filter((_, i) => i !== index)
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case 'Submitted': return <FontAwesomeIcon icon={faUserCheck} className="text-blue-500" />;
      case 'In Progress': return <FontAwesomeIcon icon={faClock} className="text-yellow-500" />;
      case 'Overdue': return <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />;
      default: return <FontAwesomeIcon icon={faClock} className="text-gray-500" />;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faTasks} className="text-blue-600" />
          Task Management ({tasks.length})
        </h2>
        <button
          onClick={() => openModal('create')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faPlus} />
          Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Coding">Coding</option>
              <option value="Reading">Reading</option>
              <option value="Project">Project</option>
              <option value="Quiz">Quiz</option>
              <option value="Assignment">Assignment</option>
              <option value="Research">Research</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
            <input
              type="text"
              value={filters.tag}
              onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
              placeholder="Enter tag to filter..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FontAwesomeIcon icon={faTasks} className="text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tasks Found</h3>
          <p className="text-gray-500 mb-4">Create your first task to get started.</p>
          <button
            onClick={() => openModal('create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faPlus} />
            Create Task
          </button>
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
                  {task.estimatedTime && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      {task.estimatedTime}m
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    Assigned to {task.totalAssigned} student(s)
                  </div>
                  <div className="text-sm text-gray-600">
                    Completed: {task.completedCount}/{task.totalAssigned} ({task.completionRate.toFixed(1)}%)
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
                  <button
                    onClick={() => openModal('edit', task)}
                    className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200 flex items-center gap-1"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Edit Task Modal */}
      {showModal && modalType !== 'view' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {modalType === 'create' ? 'Create New Task' : 'Edit Task'}
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Coding">Coding</option>
                    <option value="Reading">Reading</option>
                    <option value="Project">Project</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Research">Research</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={newTask.difficulty}
                    onChange={(e) => setNewTask(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points *</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={newTask.points}
                    onChange={(e) => setNewTask(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={newTask.estimatedTime}
                    onChange={(e) => setNewTask(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Content based on task type */}
              {newTask.type === 'Coding' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Coding Task Details</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement *</label>
                    <textarea
                      value={newTask.content.problemStatement}
                      onChange={(e) => setNewTask(prev => ({
                        ...prev,
                        content: { ...prev.content, problemStatement: e.target.value }
                      }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Input Format</label>
                      <textarea
                        value={newTask.content.inputFormat}
                        onChange={(e) => setNewTask(prev => ({
                          ...prev,
                          content: { ...prev.content, inputFormat: e.target.value }
                        }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
                      <textarea
                        value={newTask.content.outputFormat}
                        onChange={(e) => setNewTask(prev => ({
                          ...prev,
                          content: { ...prev.content, outputFormat: e.target.value }
                        }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Constraints</label>
                    <textarea
                      value={newTask.content.constraints}
                      onChange={(e) => setNewTask(prev => ({
                        ...prev,
                        content: { ...prev.content, constraints: e.target.value }
                      }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Examples */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Examples</label>
                      <button
                        type="button"
                        onClick={addExample}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                      >
                        Add Example
                      </button>
                    </div>
                    {newTask.content.examples.map((example, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Example {index + 1}</span>
                          {newTask.content.examples.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExample(index)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Input</label>
                            <textarea
                              value={example.input}
                              onChange={(e) => updateExample(index, 'input', e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Output</label>
                            <textarea
                              value={example.output}
                              onChange={(e) => updateExample(index, 'output', e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Explanation</label>
                            <textarea
                              value={example.explanation}
                              onChange={(e) => updateExample(index, 'explanation', e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {newTask.type === 'Reading' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Reading Task Details</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reading Material *</label>
                    <textarea
                      value={newTask.content.readingMaterial}
                      onChange={(e) => setNewTask(prev => ({
                        ...prev,
                        content: { ...prev.content, readingMaterial: e.target.value }
                      }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Paste the reading material here or provide a URL to external content..."
                      required
                    />
                  </div>
                </div>
              )}

              {/* Student Assignments */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Assign to Students</label>
                  <button
                    type="button"
                    onClick={addAssignment}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                  >
                    Add Student
                  </button>
                </div>
                {newTask.assignedStudents.map((assignment, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <select
                      value={assignment.studentId}
                      onChange={(e) => updateAssignment(index, 'studentId', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student._id} value={student._id}>
                          {student.fullName} ({student.usn})
                        </option>
                      ))}
                    </select>
                    <input
                      type="datetime-local"
                      value={assignment.dueDate}
                      onChange={(e) => updateAssignment(index, 'dueDate', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeAssignment(index)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTask.tags.join(', ')}
                  onChange={(e) => setNewTask(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()) 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., algorithms, arrays, sorting"
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
              <button 
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{selectedTask.title}</h4>
                <p className="text-gray-600 mb-4">{selectedTask.description}</p>
                
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {selectedTask.type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(selectedTask.difficulty)}`}>
                    {selectedTask.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                    {selectedTask.points} points
                  </span>
                  {selectedTask.estimatedTime && (
                    <span className="text-sm text-gray-600">
                      ~{selectedTask.estimatedTime} minutes
                    </span>
                  )}
                </div>
              </div>

              {/* Task Content */}
              {selectedTask.type === 'Coding' && selectedTask.content.problemStatement && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Problem Statement</h5>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">{selectedTask.content.problemStatement}</pre>
                  </div>
                </div>
              )}

              {selectedTask.type === 'Reading' && selectedTask.content.readingMaterial && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Reading Material</h5>
                  <div className="bg-gray-50 p-4 rounded-md max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{selectedTask.content.readingMaterial}</pre>
                  </div>
                </div>
              )}

              {/* Assignment Status */}
              <div>
                <h5 className="font-semibold text-gray-800 mb-2">
                  Assignment Status ({selectedTask.completedCount}/{selectedTask.totalAssigned} completed)
                </h5>
                <div className="space-y-2">
                  {selectedTask.assignedTo.map((assignment, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(assignment.status)}
                        <div>
                          <div className="font-medium text-gray-800">
                            {assignment.student.fullName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {assignment.student.usn} • Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-800">
                          {assignment.status}
                        </div>
                        {assignment.pointsAwarded > 0 && (
                          <div className="text-xs text-gray-600">
                            {assignment.pointsAwarded} points
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Tags</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
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
