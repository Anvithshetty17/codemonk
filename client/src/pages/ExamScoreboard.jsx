import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ExamScoreboard = () => {
  const { addToast } = useToast();
  const { examId } = useParams();
  const navigate = useNavigate();
  const [scoreboard, setScoreboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchScoreboard();
  }, [examId]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchScoreboard(true); // Silent refresh
      }, 5000); // Refresh every 5 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchScoreboard = async (silent = false) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${API_URL}/exams/${examId}/scoreboard`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setScoreboard(response.data);
      if (!silent) setLoading(false);
    } catch (error) {
      if (!silent) {
        addToast({ type: 'error', message: 'Failed to fetch scoreboard' });
        setLoading(false);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const exportToCSV = () => {
    if (!scoreboard || !scoreboard.data || scoreboard.data.length === 0) {
      addToast({ type: 'error', message: 'No data to export' });
      return;
    }

    const isQuiz = scoreboard.examType === 'quiz';
    
    let csvContent = isQuiz
      ? 'USN,Name,Score,Total Questions,Percentage,Time Taken (mins),Submitted At,Status,Auto-Submit Reason\n'
      : 'USN,Name,Watch Time,Total Duration,Completion %,Time Spent (mins),Submitted At,Status,Auto-Submit Reason\n';

    scoreboard.data.forEach(row => {
      const status = row.autoSubmitted ? 'AUTO-SUBMITTED' : 'MANUAL';
      const reason = row.autoSubmitted ? row.autoSubmitReason : 'N/A';
      
      if (isQuiz) {
        csvContent += `${row.usn},"${row.studentName}",${row.score},${row.totalQuestions},${row.percentage},${row.timeTaken},"${formatDate(row.submittedAt)}",${status},${reason}\n`;
      } else {
        csvContent += `${row.usn},"${row.studentName}",${formatTime(row.watchTime)},${formatTime(row.totalVideoDuration)},${row.completionPercentage},${row.timeTaken},"${formatDate(row.submittedAt)}",${status},${reason}\n`;
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${scoreboard.examCode}_scoreboard.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addToast('Scoreboard exported to CSV');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scoreboard...</p>
        </div>
      </div>
    );
  }

  if (!scoreboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl">Failed to load scoreboard</p>
          <button
            onClick={() => navigate('/admin')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Admin Panel
          </button>
        </div>
      </div>
    );
  }

  const isQuiz = scoreboard.examType === 'quiz';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{scoreboard.examName}</h1>
              <div className="flex gap-3 items-center flex-wrap">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Code: {scoreboard.examCode}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isQuiz ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                }`}>
                  {isQuiz ? 'QUIZ' : 'VIDEO'}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {scoreboard.totalSubmissions} Submissions
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  autoRefresh
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {autoRefresh ? '🔄 Live' : 'Auto-refresh OFF'}
              </button>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
              >
                📥 Export CSV
              </button>
              <button
                onClick={() => fetchScoreboard()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {/* Legend for Auto-Submit */}
        {scoreboard.data && scoreboard.data.some(row => row.autoSubmitted) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Auto-Submission Detected</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Rows highlighted in <strong className="text-red-600">red</strong> indicate auto-submitted exams due to:</p>
                  <ul className="list-disc list-inside mt-1 ml-2">
                    <li><strong>⏱️ Timeout:</strong> Time limit exceeded</li>
                    <li><strong>⚠️ Tab Change:</strong> Student switched tabs or minimized browser</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scoreboard Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {scoreboard.data && scoreboard.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      USN
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    {isQuiz ? (
                      <>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Percentage
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Watch Time
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Completion
                        </th>
                      </>
                    )}
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Time Taken
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Submitted At
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {scoreboard.data
                    .sort((a, b) => {
                      if (isQuiz) {
                        return parseFloat(b.percentage) - parseFloat(a.percentage);
                      } else {
                        return parseFloat(b.completionPercentage) - parseFloat(a.completionPercentage);
                      }
                    })
                    .map((row, index) => (
                      <tr 
                        key={row.usn} 
                        className={`transition ${
                          row.autoSubmitted 
                            ? 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`text-lg font-bold ${
                              index === 0 ? 'text-yellow-500' :
                              index === 1 ? 'text-gray-400' :
                              index === 2 ? 'text-orange-600' :
                              'text-gray-600'
                            }`}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.usn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {row.studentName}
                        </td>
                        {isQuiz ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="text-lg font-bold text-blue-600">
                                {row.score}/{row.totalQuestions}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                parseFloat(row.percentage) >= 80 ? 'bg-green-100 text-green-700' :
                                parseFloat(row.percentage) >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {row.percentage}%
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                              {formatTime(row.watchTime)} / {formatTime(row.totalVideoDuration)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                parseFloat(row.completionPercentage) >= 80 ? 'bg-green-100 text-green-700' :
                                parseFloat(row.completionPercentage) >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {row.completionPercentage}%
                              </span>
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                          {row.timeTaken} mins
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(row.submittedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {row.autoSubmitted ? (
                            <div className="flex flex-col items-center">
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300">
                                AUTO-SUBMITTED
                              </span>
                              <span className="text-xs text-red-600 mt-1">
                                {row.autoSubmitReason === 'timeout' ? '⏱️ Timeout' : 
                                 row.autoSubmitReason === 'tab_change' ? '⚠️ Tab Change' : 
                                 'Auto'}
                              </span>
                            </div>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                              MANUAL
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No submissions yet</p>
              <p className="text-gray-400 text-sm mt-2">Students' results will appear here once they submit</p>
            </div>
          )}
        </div>

        {/* Statistics */}
        {scoreboard.data && scoreboard.data.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Total Submissions</h3>
              <p className="text-3xl font-bold text-blue-600">{scoreboard.totalSubmissions}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 text-sm font-medium mb-2">Auto-Submitted</h3>
              <p className="text-3xl font-bold text-red-600">
                {scoreboard.data.filter(s => s.autoSubmitted).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ({((scoreboard.data.filter(s => s.autoSubmitted).length / scoreboard.data.length) * 100).toFixed(0)}%)
              </p>
            </div>
            {isQuiz && (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Average Score</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {(scoreboard.data.reduce((sum, s) => sum + parseFloat(s.percentage), 0) / scoreboard.data.length).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Pass Rate (≥60%)</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {((scoreboard.data.filter(s => parseFloat(s.percentage) >= 60).length / scoreboard.data.length) * 100).toFixed(0)}%
                  </p>
                </div>
              </>
            )}
            {!isQuiz && (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Average Completion</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {(scoreboard.data.reduce((sum, s) => sum + parseFloat(s.completionPercentage), 0) / scoreboard.data.length).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Full Completion (≥80%)</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {((scoreboard.data.filter(s => parseFloat(s.completionPercentage) >= 80).length / scoreboard.data.length) * 100).toFixed(0)}%
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamScoreboard;

