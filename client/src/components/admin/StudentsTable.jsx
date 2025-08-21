import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserGraduate, faUserTie, faUserShield } from '@fortawesome/free-solid-svg-icons';

const StudentsTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterInterest, setFilterInterest] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filterInterest, filterRole]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });
      
      if (filterInterest) {
        params.append('areasOfInterest', filterInterest);
      }
      
      if (filterRole) {
        params.append('role', filterRole);
      }

      console.log('Fetching users with params:', params.toString());
      const response = await api.get(`/users?${params}`);
      console.log('Users API response:', response.data);
      
      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response?.data);
      showError(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      setUpdatingRole(userId);
      const response = await api.patch(`/users/${userId}/role`, { role: newRole });
      
      if (response.data.success) {
        showSuccess(`User role updated to ${newRole} successfully`);
        await fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      showError(error.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return faUserShield;
      case 'mentor': return faUserTie;
      case 'student': return faUserGraduate;
      default: return faUsers;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#dc2626'; // red
      case 'mentor': return '#2563eb'; // blue
      case 'student': return '#16a34a'; // green
      default: return '#6b7280'; // gray
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setLoading(true);
  };

  const handleFilterChange = (e) => {
    setFilterInterest(e.target.value);
    setCurrentPage(1);
    setLoading(true);
  };

  const handleRoleFilterChange = (e) => {
    setFilterRole(e.target.value);
    setCurrentPage(1);
    setLoading(true);
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FontAwesomeIcon icon={faUsers} /> Registered Users
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex flex-col">
            <label htmlFor="roleFilter" className="text-sm font-medium text-gray-700 mb-1">Filter by Role:</label>
            <select
              id="roleFilter"
              value={filterRole}
              onChange={handleRoleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="mentor">Mentors</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="interestFilter" className="text-sm font-medium text-gray-700 mb-1">Filter by Interest:</label>
            <select
              id="interestFilter"
              value={filterInterest}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Interests</option>
              <option value="Web Development">Web Development</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Data Science">Data Science</option>
              <option value="AI">Artificial Intelligence</option>
              <option value="Cybersecurity">Cybersecurity</option>
            </select>
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Users Found</h3>
          <p className="text-gray-500">No users match the current filter criteria.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Areas of Interest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <span 
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: getRoleColor(user.role),
                            color: 'white'
                          }}
                        >
                          <FontAwesomeIcon icon={getRoleIcon(user.role)} /> {user.role}
                        </span>
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user._id, e.target.value)}
                          disabled={updatingRole === user._id}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="student">Student</option>
                          <option value="mentor">Mentor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(user.areasOfInterest) 
                          ? user.areasOfInterest.map((interest, index) => (
                              <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {interest}
                              </span>
                            ))
                          : <span className="text-sm text-gray-500">{user.areasOfInterest}</span>
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openUserModal(user)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200"
                        title="View detailed information"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeUserModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">User Details</h3>
              <button 
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={closeUserModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name:</label>
                      <span className="text-gray-900">{selectedUser.fullName}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email:</label>
                      <span className="text-gray-900">{selectedUser.email}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role:</label>
                      <span 
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: getRoleColor(selectedUser.role),
                          color: 'white'
                        }}
                      >
                        <FontAwesomeIcon icon={getRoleIcon(selectedUser.role)} /> {selectedUser.role}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone:</label>
                      <span className="text-gray-900">{selectedUser.phone}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">WhatsApp:</label>
                      <span className="text-gray-900">{selectedUser.whatsappNumber || 'Not provided'}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Joined:</label>
                      <span className="text-gray-900">{formatDate(selectedUser.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Coding Profile</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Coding Skills Rating:</label>
                      <span className="text-gray-900">{selectedUser.codingSkillsRating || 'Not provided'}/10</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Favorite Programming Language:</label>
                      <span className="text-gray-900">{selectedUser.favoriteProgrammingLanguage || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Areas of Interest</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedUser.areasOfInterest) 
                      ? selectedUser.areasOfInterest.map((interest, index) => (
                          <span key={index} className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                            {interest}
                          </span>
                        ))
                      : <span className="text-gray-900">{selectedUser.areasOfInterest || 'Not provided'}</span>
                    }
                  </div>
                </div>

                {selectedUser.favoriteLanguageReason && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Why Their Favorite Language?</h4>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedUser.favoriteLanguageReason}</p>
                  </div>
                )}

                {selectedUser.proudProject && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Project They're Proud Of</h4>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedUser.proudProject}</p>
                  </div>
                )}

                {selectedUser.debuggingProcess && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Debugging Approach</h4>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedUser.debuggingProcess}</p>
                  </div>
                )}

                {selectedUser.previousExperience && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Previous Experience</h4>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedUser.previousExperience}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsTable;
