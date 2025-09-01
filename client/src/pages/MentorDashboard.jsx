import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faUser, 
  faProjectDiagram,
  faTasks,
  faStar,
  faCalendarAlt,
  faCheckCircle,
  faClockRotateLeft,
  faExclamationTriangle,
  faEye,
  faEdit
} from '@fortawesome/free-solid-svg-icons';

const MentorDashboard = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [studentTasks, setStudentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(false);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchMentorGroups();
  }, []);

  const fetchMentorGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/groups/mentor-groups');
      
      if (response.data.success) {
        setGroups(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching mentor groups:', error);
      showError('Failed to load your assigned groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupStudentTasks = async (groupId) => {
    try {
      setTaskLoading(true);
      const response = await api.get(`/groups/${groupId}/student-tasks`);
      
      if (response.data.success) {
        setStudentTasks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching student tasks:', error);
      showError('Failed to load student tasks');
    } finally {
      setTaskLoading(false);
    }
  };

  const handleGroupSelect = async (group) => {
    setSelectedGroup(group);
    await fetchGroupStudentTasks(group._id);
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-100';
      case 'Submitted': return 'text-blue-600 bg-blue-100';
      case 'In Progress': return 'text-yellow-600 bg-yellow-100';
      case 'Assigned': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTaskStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return faCheckCircle;
      case 'Submitted': return faClockRotateLeft;
      case 'In Progress': return faExclamationTriangle;
      case 'Assigned': return faTasks;
      default: return faTasks;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-4">
          <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
          Mentor Dashboard
        </h1>
        <p className="text-gray-600">Manage your assigned groups and monitor student progress</p>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Groups Assigned</h3>
          <p className="text-gray-500">You haven't been assigned to any groups yet. Contact your administrator for group assignments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Groups List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Your Groups ({groups.length})</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {groups.map((group) => (
                  <div
                    key={group._id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedGroup?._id === group._id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                    }`}
                    onClick={() => handleGroupSelect(group)}
                  >
                    <h3 className="font-semibold text-gray-800 mb-2">{group.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} />
                        <span>{group.students.length} students</span>
                      </div>
                      {group.project && (
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faProjectDiagram} />
                          <span>{group.project.title}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>Created {new Date(group.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {group.project && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          group.project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          group.project.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {group.project.status}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Group Details */}
          <div className="lg:col-span-2">
            {!selectedGroup ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Group</h3>
                <p className="text-gray-500">Choose a group from the left to view detailed information and student progress.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Group Overview */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedGroup.name}</h2>
                  
                  {selectedGroup.project && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Title</p>
                          <p className="text-gray-800">{selectedGroup.project.title}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            selectedGroup.project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            selectedGroup.project.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedGroup.project.status}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-gray-500">Description</p>
                          <p className="text-gray-800">{selectedGroup.project.description}</p>
                        </div>
                        {selectedGroup.project.deadline && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Deadline</p>
                            <p className="text-gray-800">{new Date(selectedGroup.project.deadline).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Students List */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Group Members</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedGroup.students.map((student) => (
                        <div key={student._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {student.profileImage ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={student.profileImage}
                              alt={student.fullName}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <FontAwesomeIcon icon={faUser} className="text-gray-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{student.fullName}</p>
                            <p className="text-sm text-gray-600">{student.usn}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-yellow-600">
                              <FontAwesomeIcon icon={faStar} className="text-sm" />
                              <span className="font-semibold">{student.points || 0}</span>
                            </div>
                            <p className="text-xs text-gray-500">{student.completedTasks || 0} tasks</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Student Tasks Overview */}
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800">Student Task Progress</h3>
                  </div>
                  
                  {taskLoading ? (
                    <div className="p-6 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading tasks...</p>
                    </div>
                  ) : studentTasks.length === 0 ? (
                    <div className="p-6 text-center">
                      <FontAwesomeIcon icon={faTasks} className="text-4xl text-gray-400 mb-4" />
                      <p className="text-gray-500">No tasks assigned to group members yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {studentTasks.map((taskAssignment, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  {taskAssignment.student.profileImage ? (
                                    <img
                                      className="h-8 w-8 rounded-full object-cover"
                                      src={taskAssignment.student.profileImage}
                                      alt={taskAssignment.student.fullName}
                                    />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                      <FontAwesomeIcon icon={faUser} className="text-gray-600 text-xs" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-gray-800 text-sm">{taskAssignment.student.fullName}</p>
                                    <p className="text-xs text-gray-500">{taskAssignment.student.usn}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-medium text-gray-800">{taskAssignment.task.title}</p>
                                  <p className="text-sm text-gray-500 line-clamp-2">{taskAssignment.task.description}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {taskAssignment.task.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(taskAssignment.status)}`}>
                                  <FontAwesomeIcon icon={getTaskStatusIcon(taskAssignment.status)} className="mr-1" />
                                  {taskAssignment.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-sm" />
                                  <span className="font-semibold text-gray-800">{taskAssignment.task.points}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {taskAssignment.task.dueDate ? new Date(taskAssignment.task.dueDate).toLocaleDateString() : 'No deadline'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
