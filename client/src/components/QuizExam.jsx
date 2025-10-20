import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const QuizExam = ({ exam, studentInfo, onComplete, onCancel }) => {
  const { addToast } = useToast();
  
  // Randomize questions once on component mount
  const [randomizedQuestions] = useState(() => {
    const shuffled = [...exam.questions];
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(exam.duration * 60);
  const [startTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [checkingSubmission, setCheckingSubmission] = useState(true);

  // Check if student has already submitted this exam
  useEffect(() => {
    const checkPreviousSubmission = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/exams/${exam._id}/check-submission/${studentInfo.usn}`
        );
        
        if (response.data.hasSubmitted) {
          setAlreadySubmitted(true);
          addToast('❌ You have already submitted this exam', 'error');
        }
      } catch (error) {
        console.error('Error checking submission:', error);
        // If endpoint doesn't exist or error, allow exam to continue
      } finally {
        setCheckingSubmission(false);
      }
    };

    checkPreviousSubmission();
  }, [exam._id, studentInfo.usn, addToast]);

  // Disable right-click, text selection, and copy during exam
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      addToast('Right-click is disabled during exam', 'warning');
      return false;
    };

    // Disable copy
    const handleCopy = (e) => {
      e.preventDefault();
      addToast('Copying is disabled during exam', 'warning');
      return false;
    };

    // Disable cut
    const handleCut = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts for copy and screenshots
    const handleKeyDown = (e) => {
      // Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+P (print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x' || e.key === 'a' || e.key === 'p')) {
        e.preventDefault();
        addToast('This action is disabled during exam', 'warning');
        return false;
      }
      // F12, Ctrl+Shift+I, Ctrl+Shift+J (dev tools)
      if (e.keyCode === 123 || 
          ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74))) {
        e.preventDefault();
        return false;
      }
      
      // COMPREHENSIVE SCREENSHOT BLOCKING
      // PrtScn / Print Screen (keyCode: 44)
      if (e.keyCode === 44 || e.key === 'PrintScreen') {
        e.preventDefault();
        addToast('⚠️ Screenshots are not allowed during exam', 'error');
        return false;
      }
      
      // F10 key (keyCode: 121) - Some laptops use Fn+F10 for screenshot
      if (e.keyCode === 121 || e.key === 'F10') {
        e.preventDefault();
        addToast('⚠️ Screenshots are not allowed during exam', 'error');
        return false;
      }
      
      // F11 key (keyCode: 122) - Some laptops use Fn+F11 for screenshot
      if (e.keyCode === 122 || e.key === 'F11') {
        e.preventDefault();
        addToast('⚠️ Screenshots are not allowed during exam', 'error');
        return false;
      }
      
      // Alt + PrtScn (Active window screenshot)
      if (e.altKey && (e.keyCode === 44 || e.key === 'PrintScreen')) {
        e.preventDefault();
        addToast('⚠️ Screenshots are not allowed during exam', 'error');
        return false;
      }
      
      // Ctrl + PrtScn (Some laptops)
      if (e.ctrlKey && (e.keyCode === 44 || e.key === 'PrintScreen')) {
        e.preventDefault();
        addToast('⚠️ Screenshots are not allowed during exam', 'error');
        return false;
      }
      
      // Windows + PrtScn (Full screen to Pictures folder)
      if ((e.metaKey || e.key === 'Meta') && (e.keyCode === 44 || e.key === 'PrintScreen')) {
        e.preventDefault();
        addToast('⚠️ Screenshots are not allowed during exam', 'error');
        return false;
      }
      
      // Windows + Shift + S (Snipping Tool / Snip & Sketch)
      if ((e.metaKey || e.key === 'Meta') && e.shiftKey && e.key === 's') {
        e.preventDefault();
        addToast('⚠️ Screenshots are not allowed during exam', 'error');
        return false;
      }
      
      // Windows + G (Game Bar - can record screen)
      if ((e.metaKey || e.key === 'Meta') && e.key === 'g') {
        e.preventDefault();
        addToast('⚠️ Screen recording is not allowed during exam', 'error');
        return false;
      }
      
      // Windows + Alt + PrtScn (Game Bar screenshot)
      if ((e.metaKey || e.key === 'Meta') && e.altKey && (e.keyCode === 44 || e.key === 'PrintScreen')) {
        e.preventDefault();
        addToast('⚠️ Screenshots are not allowed during exam', 'error');
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [addToast]);

  // Detect screenshot attempts on mobile (Android/iOS)
  useEffect(() => {
    let screenshotDetected = false;

    // Detect visibility change (common during screenshot on mobile)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        screenshotDetected = true;
        setTimeout(() => {
          if (!document.hidden && screenshotDetected) {
            addToast('⚠️ Screenshot detection: This activity may be reported', 'error');
            screenshotDetected = false;
          }
        }, 100);
      }
    };

    // Detect user leaving the page (screenshot overlay triggers this on some devices)
    const handleBlur = () => {
      setTimeout(() => {
        if (document.hasFocus()) {
          addToast('⚠️ Suspicious activity detected', 'warning');
        }
      }, 200);
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    // Prevent screenshot on Android via secure flag (using meta tag)
    const metaTag = document.createElement('meta');
    metaTag.name = 'screenshot';
    metaTag.content = 'disabled';
    document.head.appendChild(metaTag);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      if (metaTag.parentNode) {
        metaTag.parentNode.removeChild(metaTag);
      }
    };
  }, [addToast]);

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
    if (currentQuestion < randomizedQuestions.length - 1) {
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

    const unanswered = randomizedQuestions.length - Object.keys(answers).length;
    if (unanswered > 0 && timeRemaining > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    setLoading(true);

    try {
      // Map randomized answers back to original question order
      // Create a map of original question indices
      const originalAnswers = {};
      randomizedQuestions.forEach((randomizedQuestion, randomizedIndex) => {
        // Find the original index of this question
        const originalIndex = exam.questions.findIndex(q => 
          q.question === randomizedQuestion.question && 
          q.correctAnswer === randomizedQuestion.correctAnswer
        );
        // Map the answer from randomized index to original index
        originalAnswers[originalIndex] = answers[randomizedIndex] || null;
      });

      // Format answers in original question order for backend
      const formattedAnswers = exam.questions.map((_, index) => ({
        selectedOption: originalAnswers[index] || null
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

  const question = randomizedQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / randomizedQuestions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = randomizedQuestions.length - answeredCount;

  // Show loading while checking if already submitted
  if (checkingSubmission) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 font-medium">Verifying exam eligibility...</p>
        </div>
      </div>
    );
  }

  // Show "Already Submitted" message if student has already taken the exam
  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full">
          <div className="text-center">
            {/* Error Icon */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-3">
              Already Submitted
            </h2>
            <p className="text-gray-600 mb-4">
              You have already submitted this exam
            </p>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <strong>Exam Details:</strong>
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    • Exam: {exam.examName}<br />
                    • Student: {studentInfo.studentName}<br />
                    • USN: {studentInfo.usn}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Each student is allowed to attempt the exam only once. If you believe this is an error, please contact your administrator.
              </p>
            </div>

            <button
              onClick={onCancel}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-4 md:p-6 select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>
      <style>{`
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        *::selection {
          background: transparent !important;
        }
        *::-moz-selection {
          background: transparent !important;
        }
        /* Prevent screenshot capture on supported browsers */
        body {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
        }
      `}</style>
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
                <div className="text-xl font-bold text-gray-900">{answeredCount} / {randomizedQuestions.length}</div>
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
                <span className="font-medium">Question {currentQuestion + 1} of {randomizedQuestions.length}</span>
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

            {currentQuestion < randomizedQuestions.length - 1 ? (
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
            {randomizedQuestions.map((_, index) => (
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
