import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const QuizExam = ({ exam, studentInfo, onComplete, onCancel }) => {
  const { addToast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(exam.duration * 60);
  const [startTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Simple timer - auto submit when time is up
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (option) => {
    setAnswers({
      ...answers,
      [currentQuestion]: option
    });
  };

  const handleNext = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;

    const unanswered = exam.questions.length - Object.keys(answers).length;
    if (unanswered > 0 && timeRemaining > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    setLoading(true);

    try {
      // Format answers - backend will calculate isCorrect
      const formattedAnswers = exam.questions.map((_, index) => ({
        selectedOption: answers[index] || null
      }));

      const submissionData = {
        examId: exam._id,
        studentName: studentInfo.studentName,
        usn: studentInfo.usn,
        answers: formattedAnswers,
        startedAt: startTime.toISOString(),
        submittedAt: new Date().toISOString()
      };

      console.log('📤 Submitting quiz:', submissionData);

      const response = await axios.post(`${API_URL}/exams/submit-quiz`, submissionData);

      console.log('✅ Submission successful:', response.data);
      addToast(`✅ Quiz submitted! Score: ${response.data.data.score}/${response.data.data.totalQuestions}`, 'success');
      onComplete(response.data.data);
      
    } catch (error) {
      console.error('❌ Submission error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      const errorMsg = error.response?.data?.message || 'Failed to submit quiz';
      addToast(`❌ ${errorMsg}`, 'error');
      setLoading(false);
    }
  };

  const question = exam.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = exam.questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Professional Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6 mb-4 sm:mb-5">
          {/* Top Row - Exam Title and Exit */}
          <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-1 h-14 bg-blue-600 rounded-full"></div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">{exam.examName}</h1>
                <p className="text-sm text-gray-600">
                  {studentInfo.studentName} • {studentInfo.usn}
                </p>
              </div>
            </div>
            
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-white border-2 border-red-400 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Exit</span>
            </button>
          </div>

          {/* Bottom Row - Stats, Timer, Progress */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Answered Stats */}
              <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 font-medium">Answered</div>
                <div className="text-xl font-bold text-gray-900">{answeredCount} / {exam.questions.length}</div>
              </div>

              {/* Timer */}
              <div className={`px-5 py-2 rounded-lg border-2 ${
                timeRemaining < 60 
                  ? 'bg-red-50 border-red-500' 
                  : timeRemaining < 300
                  ? 'bg-orange-50 border-orange-500'
                  : 'bg-blue-50 border-blue-500'
              }`}>
                <div className={`text-xs font-semibold mb-0.5 ${
                  timeRemaining < 60 ? 'text-red-600' : timeRemaining < 300 ? 'text-orange-600' : 'text-blue-600'
                }`}>Time Left</div>
                <div className={`text-2xl font-bold ${
                  timeRemaining < 60 ? 'text-red-600' : timeRemaining < 300 ? 'text-orange-600' : 'text-blue-600'
                }`}>
                  {formatTime(timeRemaining)}
                </div>
              </div>

              {/* Progress Text */}
              <div className="ml-auto text-right">
                <div className="text-xs text-gray-500 font-medium">Progress</div>
                <div className="text-xl font-bold text-blue-600">{Math.round(progress)}%</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                <span className="font-medium">Question {currentQuestion + 1} of {exam.questions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 sm:p-6 md:p-8 mb-4 sm:mb-5">
          {/* Question Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-semibold">
              {currentQuestion + 1}
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 font-medium mb-2">QUESTION {currentQuestion + 1}</div>
              <h2 className="text-lg sm:text-xl text-gray-900 leading-relaxed">
                {question.question}
              </h2>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 ml-0 sm:ml-14">
            {['A', 'B', 'C', 'D'].map((option) => (
              <button
                key={option}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  answers[currentQuestion] === option
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-colors ${
                    answers[currentQuestion] === option
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 text-gray-600'
                  }`}>
                    {option}
                  </div>
                  <span className="text-gray-700 pt-0.5">{question[`option${option}`]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 sm:mb-5">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            {currentQuestion < exam.questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors ml-auto"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-auto"
              >
                {loading ? 'Submitting...' : 'Submit Exam'}
              </button>
            )}
          </div>
        </div>

        {/* Question Overview Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
            All Questions
          </h3>
          
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2 mb-5">
            {exam.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`aspect-square rounded-lg text-sm font-semibold transition-all ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                    : answers[index]
                    ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-lg ring-2 ring-blue-600 ring-offset-2"></div>
              <span className="text-sm text-gray-600">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 border border-green-300 rounded-lg"></div>
              <span className="text-sm text-gray-600">Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 border border-gray-200 rounded-lg"></div>
              <span className="text-sm text-gray-600">Not Answered ({unansweredCount})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizExam;
