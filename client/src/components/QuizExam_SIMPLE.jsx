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
    if (timeRemaining === 300) {
      addToast('⏰ 5 minutes remaining!', 'warning');
    }
    
    if (timeRemaining === 60) {
      addToast('⚠️ 1 minute left!', 'error');
    }

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

      const response = await axios.post(`${API_URL}/exams/submit-quiz`, {
        examId: exam._id,
        studentName: studentInfo.studentName,
        usn: studentInfo.usn,
        answers: formattedAnswers,
        startedAt: startTime.toISOString(),
        submittedAt: new Date().toISOString()
      });

      addToast(`✅ Quiz submitted! Score: ${response.data.data.score}/${response.data.data.totalQuestions}`, 'success');
      onComplete(response.data.data);
      
    } catch (error) {
      console.error('Submission error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to submit quiz';
      addToast(`❌ ${errorMsg}`, 'error');
      setLoading(false);
    }
  };

  const question = exam.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / exam.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{exam.examName}</h2>
              <p className="text-gray-600">{studentInfo.studentName} ({studentInfo.usn})</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Time Remaining</p>
              <p className={`text-3xl font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">Question {currentQuestion + 1} of {exam.questions.length}</p>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">{question.questionText}</h3>

          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((option) => (
              <button
                key={option}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  answers[currentQuestion] === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <span className="font-medium">{option}.</span> {question.options[option]}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <button
            onClick={onCancel}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Cancel
          </button>

          {currentQuestion < exam.questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>

        {/* Question Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-semibold text-gray-800 mb-3">Question Navigation</h4>
          <div className="flex flex-wrap gap-2">
            {exam.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg font-medium ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[index]
                    ? 'bg-green-100 text-green-800 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
              <span>Not Answered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizExam;
