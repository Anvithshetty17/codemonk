import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faProjectDiagram,
  faCalendarAlt,
  faUser,
  faChalkboardTeacher,
  faUpload,
  faCheckCircle,
  faExclamationTriangle,
  faClock,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';

const StudentGroupDashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [submissionData, setSubmissionData] = useState({
    submissionUrl: '',
    submissionText: ''
  });
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      const response = await api.get('/groups/my-groups');
      if (response.data.success) {
        setGroups(response.data.data.groups);
      }
    } catch (error) {
      showError('Failed to load your groups');
    } finally {
      setLoading(false);
    }
  };

  const openSubmissionModal = (group) => {
    setSelectedGroup(group);
    setSubmissionData({
      submissionUrl: '',
      submissionText: ''
    });
    setShowSubmissionModal(true);
  };

  const closeSubmissionModal = () => {
    setShowSubmissionModal(false);
    setSelectedGroup(null);
    setSubmissionData({
      submissionUrl: '',
      submissionText: ''
    });
  };

  const handleSubmission = async (e) => {
    e.preventDefault();
    
    if (!submissionData.submissionUrl && !submissionData.submissionText) {
      showError('Please provide either a submission URL or text');
      return;
    }

    try {
      const response = await api.post(`/groups/${selectedGroup._id}/submit`, submissionData);
      if (response.data.success) {
        showSuccess('Project submitted successfully');
        fetchMyGroups();
        closeSubmissionModal();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to submit project');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (submissionDate) => {
    if (!submissionDate) return null;
    const today = new Date();
    const deadline = new Date(submissionDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSubmissionStatus = (group, userId) => {
    if (!group.submissions || group.submissions.length === 0) return null;
    return group.submissions.find(sub => sub.submittedBy._id === userId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Needs Revision': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Submitted': return faUpload;
      case 'Under Review': return faClock;
      case 'Approved': return faCheckCircle;
      case 'Needs Revision': return faExclamationTriangle;
      default: return faFileAlt;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading your groups...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
          My Groups
        </h2>
        <p className="text-gray-600 mt-2">View your group assignments, project details, and submit your work</p>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Groups Assigned</h3>
          <p className="text-gray-500">You haven't been assigned to any groups yet. Please contact your administrator.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            const userSubmission = getSubmissionStatus(group, localStorage.getItem('userId')); // You might need to get userId from auth context
            const daysRemaining = getDaysRemaining(group.project?.submissionDate);
            const isOverdue = daysRemaining !== null && daysRemaining < 0;
            
            return (
              <div key={group._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{group.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                        group.status === 'Active' ? 'bg-green-100 text-green-800' :
                        group.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        group.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {group.status}
                      </span>
                    </div>
                    
                    {userSubmission && (
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(userSubmission.status)}`}>
                          <FontAwesomeIcon icon={getStatusIcon(userSubmission.status)} />
                          {userSubmission.status}
                        </span>
                        {userSubmission.grade && (
                          <div className="text-sm text-gray-600 mt-1">
                            Grade: {userSubmission.grade}/100
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {group.description && (
                    <p className="text-gray-600 mb-4">{group.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Group Members */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="text-blue-600" />
                        Group Members ({group.students.length})
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {group.students.map(student => (
                          <div key={student._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {student.fullName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-sm">{student.fullName}</div>
                              <div className="text-xs text-gray-500">{student.email}</div>
                              {student.usn && <div className="text-xs text-gray-400">USN: {student.usn}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mentors */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faChalkboardTeacher} className="text-green-600" />
                        Mentors ({group.mentors.length})
                      </h4>
                      <div className="space-y-2">
                        {group.mentors.length > 0 ? (
                          group.mentors.map(mentor => (
                            <div key={mentor._id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-medium text-sm">
                                  {mentor.fullName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-sm">{mentor.fullName}</div>
                                <div className="text-xs text-gray-500">{mentor.email}</div>
                                <div className="text-xs text-gray-400 capitalize">Role: {mentor.role}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No mentors assigned</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Project Information */}
                  {group.project?.title && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faProjectDiagram} className="text-purple-600" />
                        Project: {group.project.title}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Difficulty:</label>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            group.project.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            group.project.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {group.project.difficulty}
                          </span>
                        </div>
                        
                        {group.project.submissionDate && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Deadline:</label>
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500" />
                              <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                                {formatDate(group.project.submissionDate)}
                              </span>
                            </div>
                            {daysRemaining !== null && (
                              <div className={`text-xs ${
                                isOverdue ? 'text-red-600' : 
                                daysRemaining <= 3 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {isOverdue ? `Overdue by ${Math.abs(daysRemaining)} days` :
                                 daysRemaining === 0 ? 'Due today' :
                                 `${daysRemaining} days remaining`}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Submission Format:</label>
                          <span className="text-sm text-gray-900">{group.project.submissionFormat}</span>
                        </div>
                      </div>

                      {group.project.description && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
                          <p className="text-sm text-gray-900">{group.project.description}</p>
                        </div>
                      )}

                      {group.project.requirements && group.project.requirements.length > 0 && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Requirements:</label>
                          <ul className="list-disc list-inside space-y-1">
                            {group.project.requirements.map((req, index) => (
                              <li key={index} className="text-sm text-gray-900">{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {group.project.technologies && group.project.technologies.length > 0 && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Technologies:</label>
                          <div className="flex flex-wrap gap-2">
                            {group.project.technologies.map((tech, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Submission Section */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {userSubmission ? (
                          <div>
                            <h5 className="font-medium text-gray-800 mb-2">Your Submission</h5>
                            <div className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-start mb-2">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userSubmission.status)}`}>
                                  <FontAwesomeIcon icon={getStatusIcon(userSubmission.status)} />
                                  {userSubmission.status}
                                </span>
                                <span className="text-xs text-gray-500">
                                  Submitted: {formatDate(userSubmission.submittedAt)}
                                </span>
                              </div>
                              
                              {userSubmission.submissionUrl && (
                                <div className="mb-2">
                                  <label className="block text-xs font-medium text-gray-700">URL:</label>
                                  <a 
                                    href={userSubmission.submissionUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm break-all"
                                  >
                                    {userSubmission.submissionUrl}
                                  </a>
                                </div>
                              )}
                              
                              {userSubmission.submissionText && (
                                <div className="mb-2">
                                  <label className="block text-xs font-medium text-gray-700">Description:</label>
                                  <p className="text-sm text-gray-900">{userSubmission.submissionText}</p>
                                </div>
                              )}

                              {userSubmission.feedback && (
                                <div className="mb-2">
                                  <label className="block text-xs font-medium text-gray-700">Mentor Feedback:</label>
                                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{userSubmission.feedback}</p>
                                </div>
                              )}

                              {userSubmission.grade && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700">Grade:</label>
                                  <span className={`text-lg font-bold ${
                                    userSubmission.grade >= 80 ? 'text-green-600' :
                                    userSubmission.grade >= 60 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {userSubmission.grade}/100
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-gray-600 mb-3">You haven't submitted your project yet.</p>
                            <button
                              onClick={() => openSubmissionModal(group)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
                            >
                              <FontAwesomeIcon icon={faUpload} />
                              Submit Project
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {showSubmissionModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeSubmissionModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Submit Project</h3>
              <button 
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={closeSubmissionModal}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmission} className="p-6">
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Project: {selectedGroup.project?.title}</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Submission Format: {selectedGroup.project?.submissionFormat}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Submission URL *
                    <span className="text-xs text-gray-500 ml-2">
                      (GitHub repository, Google Drive link, etc.)
                    </span>
                  </label>
                  <input
                    type="url"
                    value={submissionData.submissionUrl}
                    onChange={(e) => setSubmissionData(prev => ({ ...prev, submissionUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/username/project-name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={submissionData.submissionText}
                    onChange={(e) => setSubmissionData(prev => ({ ...prev, submissionText: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any additional information about your submission, special instructions, or notes for the mentor..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeSubmissionModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faUpload} />
                  Submit Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentGroupDashboard;
