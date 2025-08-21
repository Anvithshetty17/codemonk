import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faTasks, 
  faCalendarAlt,
  faClock,
  faExclamationTriangle,
  faCheckCircle,
  faFileUpload,
  faEye,
  faUser
} from '@fortawesome/free-solid-svg-icons';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTeam, setActiveTeam] = useState('');
  const [joinedTeams, setJoinedTeams] = useState([]);
  const [teamTasks, setTeamTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionModal, setSubmissionModal] = useState({ show: false, task: null });
  const [submission, setSubmission] = useState({ content: '', attachments: [] });

  useEffect(() => {
    fetchJoinedTeams();
  }, []);

  useEffect(() => {
    if (activeTeam) {
      fetchTeamTasks();
    } else {
      setTeamTasks([]);
    }
  }, [activeTeam]);

  const fetchJoinedTeams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teams/user/me');
      if (response.data.success) {
        const teams = response.data.data.joinedTeams || [];
        setJoinedTeams(teams);
        if (teams.length > 0) {
          setActiveTeam(teams[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      showError('Failed to load your teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamTasks = async () => {
    try {
      const response = await api.get(`/tasks/team/${activeTeam}`);
      if (response.data.success) {
        setTeamTasks(response.data.data.tasks);
      }
    } catch (error) {
      console.error('Error fetching team tasks:', error);
      showError('Failed to load team tasks');
    }
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/tasks/${submissionModal.task._id}/submit`, submission);
      if (response.data.success) {
        showSuccess('Task submitted successfully!');
        setSubmissionModal({ show: false, task: null });
        setSubmission({ content: '', attachments: [] });
        fetchTeamTasks();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to submit task');
    }
  };

  const hasUserSubmitted = (task) => {
    return task.submissions.some(sub => sub.student._id === user?.id);
  };

  const getUserSubmission = (task) => {
    return task.submissions.find(sub => sub.student._id === user?.id);
  };

  const isTaskOverdue = (dueDate, status) => {
    return new Date() > new Date(dueDate) && status !== 'completed';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      reviewed: 'bg-purple-100 text-purple-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      resubmit: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || colors.submitted;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading your dashboard...</span>
      </div>
    );
  }

  if (joinedTeams.length === 0) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faUsers} className="text-gray-300 text-6xl mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Teams Joined</h3>
        <p className="text-gray-500 mb-6">
          You haven't joined any teams yet. Join a team to access tasks and collaborate with others.
        </p>
        <a
          href="/teams"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
        >
          Browse Teams
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
          Select Team
        </h3>
        <select
          value={activeTeam}
          onChange={(e) => setActiveTeam(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {joinedTeams.map(team => (
            <option key={team._id} value={team._id}>
              {team.name} ({team.category})
            </option>
          ))}
        </select>
      </div>

      {/* Tasks Section */}
      {activeTeam && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faTasks} className="text-blue-600" />
            Team Tasks
          </h3>

          {teamTasks.length === 0 ? (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faTasks} className="text-gray-300 text-4xl mb-3" />
              <p className="text-gray-500">No tasks available for this team yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamTasks.map(task => {
                const userSubmission = getUserSubmission(task);
                const hasSubmitted = hasUserSubmitted(task);
                const isOverdue = isTaskOverdue(task.dueDate, task.status);

                return (
                  <div key={task._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
                          {isOverdue && (
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" title="Overdue" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {hasSubmitted && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userSubmission.status)}`}>
                          <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                          {userSubmission.status}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>

                    {task.requirements && task.requirements.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h5>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {task.requirements.slice(0, 2).map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                          {task.requirements.length > 2 && (
                            <li className="text-gray-500">+{task.requirements.length - 2} more...</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Submission Section */}
                    <div className="border-t pt-4">
                      {hasSubmitted ? (
                        <div className="space-y-3">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Your Submission:</h5>
                            <p className="text-sm text-gray-600 mb-2">{userSubmission.content}</p>
                            <div className="text-xs text-gray-500">
                              Submitted on {new Date(userSubmission.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {userSubmission.feedback && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <h5 className="text-sm font-medium text-blue-800 mb-2">Feedback:</h5>
                              <p className="text-sm text-blue-700 mb-2">{userSubmission.feedback.comment}</p>
                              {userSubmission.feedback.rating && (
                                <div className="text-sm text-blue-600">
                                  Rating: {userSubmission.feedback.rating}/10
                                </div>
                              )}
                              <div className="text-xs text-blue-500 mt-2">
                                Reviewed by {userSubmission.feedback.reviewedBy?.fullName} on {new Date(userSubmission.feedback.reviewedAt).toLocaleDateString()}
                              </div>
                            </div>
                          )}

                          {userSubmission.status === 'resubmit' && (
                            <button
                              onClick={() => setSubmissionModal({ show: true, task })}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm transition-colors duration-200 flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faFileUpload} />
                              Resubmit Task
                            </button>
                          )}
                        </div>
                      ) : task.status === 'active' ? (
                        <button
                          onClick={() => setSubmissionModal({ show: true, task })}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors duration-200 flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faFileUpload} />
                          Submit Task
                        </button>
                      ) : (
                        <span className="text-gray-500 text-sm">Task not available for submission</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Submit Task Modal */}
      {submissionModal.show && submissionModal.task && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSubmissionModal({ show: false, task: null })}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Submit Task: {submissionModal.task.title}</h3>
              <button className="text-gray-500 hover:text-gray-700 text-2xl" onClick={() => setSubmissionModal({ show: false, task: null })}>×</button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={handleSubmitTask}>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Submission Content *</label>
                <textarea
                  id="content"
                  value={submission.content}
                  onChange={(e) => setSubmission(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="8"
                  required
                  placeholder="Describe your solution, approach, code implementation, and any relevant details..."
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Task Requirements:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {submissionModal.task.requirements?.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200"
                  onClick={() => setSubmissionModal({ show: false, task: null })}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200"
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

export default StudentDashboard;
