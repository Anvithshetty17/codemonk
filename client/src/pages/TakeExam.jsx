import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';
import QuizExam from '../components/QuizExam';
import VideoExam from '../components/VideoExam';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TakeExam = () => {
  const { addToast } = useToast();
  const [step, setStep] = useState('enter'); // enter, taking, result
  const [studentInfo, setStudentInfo] = useState({
    usn: '',
    studentName: '',
    examCode: ''
  });
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [checkingStorage, setCheckingStorage] = useState(true);

  // Check for saved video exam progress on mount
  React.useEffect(() => {
    const checkSavedProgress = async () => {
      try {
        // Find any video exam in localStorage
        const keys = Object.keys(localStorage);
        const videoExamKey = keys.find(key => key.startsWith('videoExam_'));
        
        if (videoExamKey) {
          const savedData = JSON.parse(localStorage.getItem(videoExamKey));
          
          // Check if it's still valid (within 24 hours)
          const savedTime = new Date(savedData.timestamp);
          const now = new Date();
          const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            // Extract examId from key: videoExam_${examId}_${usn}
            const examId = savedData.examId;
            
            // Fetch exam details
            const response = await axios.get(`${API_URL}/exams/${examId}`);
            const examData = response.data.data;
            
            // Only auto-resume for video exams
            if (examData.examType === 'video') {
              setStudentInfo({
                usn: savedData.usn,
                studentName: savedData.studentName,
                examCode: '' // Not needed for resume
              });
              setExam(examData);
              setStep('taking');
              addToast('📌 Resuming your video exam...', 'info');
            }
          } else {
            // Remove expired data
            localStorage.removeItem(videoExamKey);
          }
        }
      } catch (error) {
        console.error('Error checking saved progress:', error);
      } finally {
        setCheckingStorage(false);
      }
    };

    checkSavedProgress();
  }, []);

  const handleStartExam = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/exams/code/${studentInfo.examCode.toUpperCase()}`
      );
      
      setExam(response.data.data);
      setStep('taking');
      addToast(`Starting ${response.data.data.examType === 'quiz' ? 'Quiz' : 'Video'} Exam`);
    } catch (error) {
      addToast({ type: 'error', message: error.response?.data?.message || 'Exam not found or inactive' });
    } finally {
      setLoading(false);
    }
  };

  const handleExamComplete = (resultData) => {
    setResult(resultData);
    setStep('result');
  };

  const handleRestart = () => {
    setStep('enter');
    setStudentInfo({ usn: '', studentName: '', examCode: '' });
    setExam(null);
    setResult(null);
  };

  // Show loading while checking localStorage
  if (checkingStorage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 font-medium">Checking for saved progress...</p>
        </div>
      </div>
    );
  }

  if (step === 'taking' && exam) {
    if (exam.examType === 'quiz') {
      return (
        <QuizExam
          exam={exam}
          studentInfo={studentInfo}
          onComplete={handleExamComplete}
          onCancel={handleRestart}
        />
      );
    } else {
      return (
        <VideoExam
          exam={exam}
          studentInfo={studentInfo}
          onComplete={handleExamComplete}
          onCancel={handleRestart}
        />
      );
    }
  }

  if (step === 'result' && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 max-w-lg w-full transform transition-all duration-500 hover:shadow-3xl">
          <div className="text-center">
            {/* Success Icon with Animation */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
              Exam Submitted Successfully!
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mb-8">Your results have been securely recorded</p>

            {/* Divider */}
            <div className="w-20 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-8"></div>

            {exam.examType === 'quiz' ? (
              <div className="space-y-4">
                <div className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Score</p>
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <p className="text-4xl font-extrabold text-blue-600">
                    {result.score} <span className="text-2xl text-blue-400">/ {result.totalQuestions}</span>
                  </p>
                </div>

                <div className="group p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Percentage</p>
                    <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-4xl font-extrabold text-purple-600">
                    {result.percentage}<span className="text-2xl">%</span>
                  </p>
                </div>

                <div className="group p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-orange-700 uppercase tracking-wide">Time Taken</p>
                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-3xl font-extrabold text-orange-600">
                    {result.timeTaken} <span className="text-xl text-orange-400">min</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="group p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Watch Time</p>
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-3xl font-extrabold text-green-600">
                    {Math.floor(result.watchTime / 60)}<span className="text-xl">m</span> {result.watchTime % 60}<span className="text-xl">s</span>
                  </p>
                </div>

                <div className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Completion</p>
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-4xl font-extrabold text-blue-600">
                    {result.completionPercentage}<span className="text-2xl">%</span>
                  </p>
                </div>

                <div className="group p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-orange-700 uppercase tracking-wide">Time Spent</p>
                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-3xl font-extrabold text-orange-600">
                    {result.timeTaken} <span className="text-xl text-orange-400">min</span>
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleRestart}
              className="mt-8 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Take Another Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 max-w-md w-full transform transition-all duration-500 hover:shadow-3xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:rotate-6 transition-transform duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Take Exam
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">Enter your details to begin your assessment</p>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mt-4"></div>
        </div>

        <form onSubmit={handleStartExam} className="space-y-5">
          <div className="relative">
            <label className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wide">
              USN / Roll Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <input
                type="text"
                value={studentInfo.usn}
                onChange={(e) => setStudentInfo({ ...studentInfo, usn: e.target.value.toUpperCase() })}
                placeholder="e.g., 4NI21CS001"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-gray-50 hover:bg-white"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wide">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                value={studentInfo.studentName}
                onChange={(e) => setStudentInfo({ ...studentInfo, studentName: e.target.value })}
                placeholder="Enter your full name"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-gray-50 hover:bg-white"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-semibold mb-2 text-sm uppercase tracking-wide">
              Exam Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="text"
                value={studentInfo.examCode}
                onChange={(e) => setStudentInfo({ ...studentInfo, examCode: e.target.value.toUpperCase() })}
                placeholder="e.g., EXAM2024"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 bg-gray-50 hover:bg-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Start Exam
              </>
            )}
          </button>
        </form>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-100">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Important Instructions</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Ensure stable internet connection</li>
                <li>• Do not refresh or close the browser</li>
                <li>• Cannot restart once exam begins</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
