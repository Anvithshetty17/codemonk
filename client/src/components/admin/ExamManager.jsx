import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ExamManager = () => {
  const { addToast } = useToast();
  const [exams, setExams] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [examForm, setExamForm] = useState({
    examName: '',
    examCode: '',
    examType: 'quiz',
    duration: '',
    videoLink: ''
  });

  const [questionForm, setQuestionForm] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A'
  });

  const [questions, setQuestions] = useState([]);
  const [csvFile, setCsvFile] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem('authToken'); // Changed from 'token' to 'authToken'
      
      if (!token) {
        addToast('You must be logged in as admin. Please login first.', 'error');
        console.error('No token found. Please log in.');
        return;
      }
      
      const response = await axios.get(`${API_URL}/exams`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExams(response.data.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
      
      if (error.response?.status === 403) {
        addToast('Access denied. Please log in as an admin user.', 'error');
      } else if (error.response?.status === 401) {
        addToast('Session expired. Please log in again.', 'error');
      } else {
        addToast('Failed to fetch exams', 'error');
      }
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_URL}/exams`,
        examForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      addToast(response.data.message, 'success');
      
      if (examForm.examType === 'quiz') {
        // Navigate to question management
        setSelectedExam(response.data.data);
        setShowCreateModal(false);
        setShowQuestionModal(true);
      } else {
        // For video, just close modal and refresh list
        setShowCreateModal(false);
        fetchExams();
      }

      setExamForm({
        examName: '',
        examCode: '',
        examType: 'quiz',
        duration: '',
        videoLink: ''
      });
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to create exam', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    if (!questionForm.question || !questionForm.optionA || !questionForm.optionB || 
        !questionForm.optionC || !questionForm.optionD) {
      addToast('Please fill all fields', 'error');
      return;
    }

    setQuestions([...questions, questionForm]);
    setQuestionForm({
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A'
    });
    addToast('Question added successfully', 'success');
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
    addToast('Question removed', 'info');
  };

  const handleSaveQuestions = async () => {
    if (questions.length === 0) {
      addToast('Please add at least one question', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API_URL}/exams/${selectedExam._id}/questions`,
        { questions },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      addToast('Quiz created successfully!', 'success');
      setShowQuestionModal(false);
      setSelectedExam(null);
      setQuestions([]);
      fetchExams();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to save questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = text.split('\n').filter(row => row.trim());
        
        // Function to parse CSV row handling quoted fields with commas
        const parseCSVRow = (row) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < row.length; i++) {
            const char = row[i];
            
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };
        
        // Skip header row and parse questions
        const parsedQuestions = rows.slice(1).map(row => {
          const [question, optionA, optionB, optionC, optionD, correctOption] = parseCSVRow(row);
          
          return {
            question: question || '',
            optionA: optionA || '',
            optionB: optionB || '',
            optionC: optionC || '',
            optionD: optionD || '',
            correctOption: (correctOption || '').toUpperCase()
          };
        }).filter(q => q.question && q.correctOption); // Filter out empty rows

        setQuestions([...questions, ...parsedQuestions]);
        addToast(`${parsedQuestions.length} questions imported from CSV`, 'success');
        setCsvFile(null);
        e.target.value = ''; // Reset file input
      } catch (error) {
        console.error('CSV parsing error:', error);
        addToast('Error parsing CSV file. Please check the format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleToggleStatus = async (examId, currentStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(
        `${API_URL}/exams/${examId}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addToast(`Exam ${currentStatus ? 'deactivated' : 'activated'}`, 'success');
      fetchExams();
    } catch (error) {
      addToast('Failed to update exam status', 'error');
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam? All student submissions will also be deleted. This action cannot be undone!')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`${API_URL}/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast(response.data.message, 'success');
      fetchExams();
    } catch (error) {
      addToast('Failed to delete exam', 'error');
    }
  };

  const handleClearAllExams = async () => {
    const confirmText = 'DELETE ALL EXAMS';
    const userInput = window.prompt(
      `⚠️ DANGER ZONE ⚠️\n\nThis will permanently delete ALL exams and ALL student submissions from the database!\n\nThis action CANNOT be undone!\n\nType "${confirmText}" (without quotes) to confirm:`
    );

    if (userInput !== confirmText) {
      if (userInput !== null) {
        addToast({ type: 'error', message: 'Deletion cancelled - incorrect confirmation text' });
      }
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`${API_URL}/exams/clear/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast(response.data.message, 'success');
      fetchExams();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to clear exams', 'error');
    }
  };

  const handleViewScoreboard = (exam) => {
    window.location.href = `/admin/scoreboard/${exam._id}`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Authentication Warning */}
        {exams.length === 0 && !loading && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Authentication Required:</strong> You must be logged in as an admin user to manage exams. 
                  Please <a href="/login" className="underline font-semibold">log in</a> with admin credentials.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Exam Management</h1>
          <div className="flex gap-3">
            {exams.length > 0 && (
              <button
                onClick={handleClearAllExams}
                className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
                title="Delete all exams and submissions"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All Exams
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              + Create Exam
            </button>
          </div>
        </div>

        {/* Exams List */}
        <div className="grid gap-4">
          {exams.map((exam) => (
            <div key={exam._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{exam.examName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      exam.examType === 'quiz' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {exam.examType.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      exam.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {exam.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">
                    <strong>Code:</strong> {exam.examCode} | 
                    <strong> Duration:</strong> {exam.duration} mins
                    {exam.examType === 'quiz' && (
                      <> | <strong>Questions:</strong> {exam.questions.length}</>
                    )}
                  </p>
                  {exam.examType === 'video' && (
                    <p className="text-gray-600 text-sm">
                      <strong>Video Link:</strong> 
                      <a href={exam.videoLink} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline ml-2">
                        {exam.videoLink}
                      </a>
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewScoreboard(exam)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm transition"
                  >
                    Scoreboard
                  </button>
                  <button
                    onClick={() => handleToggleStatus(exam._id, exam.isActive)}
                    className={`px-4 py-2 rounded text-sm font-medium transition ${
                      exam.isActive 
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {exam.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteExam(exam._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Exam Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Exam</h2>
              <form onSubmit={handleCreateExam}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Exam Type</label>
                  <select
                    value={examForm.examType}
                    onChange={(e) => setExamForm({ ...examForm, examType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="quiz">Quiz</option>
                    <option value="video">Video Watching</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    {examForm.examType === 'quiz' ? 'Quiz Name' : 'Video Name'}
                  </label>
                  <input
                    type="text"
                    value={examForm.examName}
                    onChange={(e) => setExamForm({ ...examForm, examName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    {examForm.examType === 'quiz' ? 'Quiz Code' : 'Video Code'}
                  </label>
                  <input
                    type="text"
                    value={examForm.examCode}
                    onChange={(e) => setExamForm({ ...examForm, examCode: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={examForm.duration}
                    onChange={(e) => setExamForm({ ...examForm, duration: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>

                {examForm.examType === 'video' && (
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Video Link (YouTube URL)</label>
                    <input
                      type="url"
                      value={examForm.videoLink}
                      onChange={(e) => setExamForm({ ...examForm, videoLink: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setExamForm({
                        examName: '',
                        examCode: '',
                        examType: 'quiz',
                        duration: '',
                        videoLink: ''
                      });
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Question Management Modal */}
        {showQuestionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 my-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Add Questions to {selectedExam?.examName}
              </h2>

              {/* CSV Upload */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <label className="block text-gray-700 font-medium mb-2">
                  Upload Questions via CSV
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 mt-2">
                  CSV format: question,optionA,optionB,optionC,optionD,correctOption
                </p>
              </div>

              {/* Manual Question Entry */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-4 text-gray-800">Add Question Manually</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Question"
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Option A"
                    value={questionForm.optionA}
                    onChange={(e) => setQuestionForm({ ...questionForm, optionA: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Option B"
                    value={questionForm.optionB}
                    onChange={(e) => setQuestionForm({ ...questionForm, optionB: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Option C"
                    value={questionForm.optionC}
                    onChange={(e) => setQuestionForm({ ...questionForm, optionC: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Option D"
                    value={questionForm.optionD}
                    onChange={(e) => setQuestionForm({ ...questionForm, optionD: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={questionForm.correctOption}
                    onChange={(e) => setQuestionForm({ ...questionForm, correctOption: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">Correct Answer: A</option>
                    <option value="B">Correct Answer: B</option>
                    <option value="C">Correct Answer: C</option>
                    <option value="D">Correct Answer: D</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
                  >
                    + Add Question
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-800">
                  Questions Added ({questions.length})
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {questions.map((q, index) => (
                    <div key={index} className="p-4 bg-white border border-gray-300 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 mb-2">
                            {index + 1}. {q.question}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <p>A) {q.optionA}</p>
                            <p>B) {q.optionB}</p>
                            <p>C) {q.optionC}</p>
                            <p>D) {q.optionD}</p>
                          </div>
                          <p className="text-sm text-green-600 font-medium mt-2">
                            Correct: {q.correctOption}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveQuestion(index)}
                          className="ml-4 text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveQuestions}
                  disabled={loading || questions.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : `Save Quiz (${questions.length} questions)`}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Cancel quiz creation? All questions will be lost.')) {
                      setShowQuestionModal(false);
                      setSelectedExam(null);
                      setQuestions([]);
                    }
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamManager;

