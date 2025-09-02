import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy, 
  faMedal, 
  faAward,
  faStar,
  faUser,
  faTasks,
  faCrown,
  faFire,
  faChartLine,
  faUsers
} from '@fortawesome/free-solid-svg-icons';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks/leaderboard?limit=50');
      
      if (response.data.success) {
        setLeaderboard(response.data.data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      showError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <FontAwesomeIcon icon={faTrophy} className="absolute inset-0 m-auto text-blue-600 text-xl" />
            </div>
            <p className="mt-6 text-gray-600 text-lg">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200 mb-6">
            <FontAwesomeIcon icon={faTrophy} className="text-yellow-500 text-2xl" />
            <h1 className="text-3xl font-bold text-gray-800">Leaderboard</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Celebrating our top performers based on completed tasks and points earned. 
            Keep pushing your limits and climb the ranks!
          </p>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="mb-6">
              <FontAwesomeIcon icon={faTrophy} className="text-6xl text-gray-300 mb-4" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No Data Available</h3>
            <p className="text-gray-500 text-lg">The leaderboard will be populated as students complete tasks.</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            

            {/* Complete Rankings */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FontAwesomeIcon icon={faChartLine} />
                  Complete Rankings
                </h2>
                <p className="text-blue-100 mt-2">All student rankings based on performance</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Rank</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">USN</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Section</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Points</th>
                      <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Tasks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leaderboard.map((student) => (
                      <tr 
                        key={student._id} 
                        className={`hover:bg-gray-50 transition-colors ${
                          student.isTopThree ? `bg-gradient-to-r border-l-4 ${
                            student.position === 1 ? 'from-yellow-50 to-yellow-100 border-yellow-400' :
                            student.position === 2 ? 'from-gray-50 to-gray-100 border-gray-400' : 
                            'from-amber-50 to-amber-100 border-amber-400'
                          }` : ''
                        }`}
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {student.position <= 3 ? (
                              <FontAwesomeIcon 
                                icon={student.position === 1 ? faCrown : student.position === 2 ? faMedal : faAward} 
                                className={`text-xl ${
                                  student.position === 1 ? 'text-yellow-500' : 
                                  student.position === 2 ? 'text-gray-400' : 'text-amber-600'
                                }`} 
                              />
                            ) : (
                              <span className="text-xl font-bold text-gray-500">#{student.position}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            {student.profileImage ? (
                              <img
                                className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                                src={student.profileImage}
                                alt={student.fullName}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                                <FontAwesomeIcon icon={faUser} className="text-gray-500" />
                              </div>
                            )}
                            <div>
                              <div className={`font-semibold text-lg ${
                                student.position <= 3 ? 
                                  student.position === 1 ? 'text-yellow-700' : 
                                  student.position === 2 ? 'text-gray-700' : 'text-amber-700'
                                  : 'text-gray-700'
                              }`}>
                                {student.fullName}
                              </div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className="text-gray-700 font-medium">{student.usn}</span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Section {student.section || 'N/A'}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="bg-yellow-100 rounded-lg px-3 py-2 flex items-center gap-2 w-fit">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                            <span className="font-bold text-lg text-gray-700">{student.points}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="bg-blue-100 rounded-lg px-3 py-2 flex items-center gap-2 w-fit">
                            <FontAwesomeIcon icon={faTasks} className="text-blue-500" />
                            <span className="font-semibold text-gray-700">{student.completedTasks}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200 text-center transform hover:scale-105 transition-transform">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-full mb-4">
                  <FontAwesomeIcon icon={faTrophy} className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Top Score</h3>
                <p className="text-3xl font-bold text-yellow-600">{leaderboard[0]?.points || 0}</p>
                <p className="text-sm text-yellow-700 mt-1">points</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 text-center transform hover:scale-105 transition-transform">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
                  <FontAwesomeIcon icon={faTasks} className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Most Tasks</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {Math.max(...leaderboard.map(s => s.completedTasks), 0)}
                </p>
                <p className="text-sm text-blue-700 mt-1">completed</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 text-center transform hover:scale-105 transition-transform">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                  <FontAwesomeIcon icon={faUsers} className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Active Students</h3>
                <p className="text-3xl font-bold text-green-600">
                  {leaderboard.filter(s => s.completedTasks > 0).length}
                </p>
                <p className="text-sm text-green-700 mt-1">participating</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 text-center transform hover:scale-105 transition-transform">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-full mb-4">
                  <FontAwesomeIcon icon={faChartLine} className="text-2xl text-white" />
                </div>
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Average Score</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {leaderboard.length > 0 ? Math.round(leaderboard.reduce((acc, s) => acc + s.points, 0) / leaderboard.length) : 0}
                </p>
                <p className="text-sm text-purple-700 mt-1">points</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
