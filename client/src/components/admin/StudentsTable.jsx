import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserGraduate, faUserTie, faUserShield, faEye, faTrash } from '@fortawesome/free-solid-svg-icons';

const StudentsTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterRole, setFilterRole] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });
      
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
      showError(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setDeleting(userId);
      const response = await api.delete(`/users/${userId}`);
      
      if (response.data.success) {
        showSuccess('User deleted successfully');
        await fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showError(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(null);
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
      case 'admin': return 'bg-red-500';
      case 'mentor': return 'bg-blue-500';
      case 'student': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <FontAwesomeIcon icon={faUsers} className="text-blue-600" />
          Registered Users ({users.length})
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex flex-col">
            <label htmlFor="roleFilter" className="text-sm font-medium text-gray-700 mb-1">Filter by Role:</label>
            <select
              id="roleFilter"
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="mentor">Mentors</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Users Found</h3>
          <p className="text-gray-500">No users match the current filter criteria.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.profileImage ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.profileImage}
                            alt={user.fullName}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.fullName?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.phone}</div>
                      {user.whatsappNumber && (
                        <div className="text-sm text-gray-500">WhatsApp: {user.whatsappNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${getRoleColor(user.role)}`}>
                        <FontAwesomeIcon icon={getRoleIcon(user.role)} />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.usn || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openUserModal(user)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200 flex items-center gap-1"
                          title="View detailed information"
                        >
                          <FontAwesomeIcon icon={faEye} />
                          View
                        </button>
                        <button
                          onClick={() => deleteUser(user._id, user.fullName)}
                          disabled={deleting === user._id}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete user"
                        >
                          {deleting === user._id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                          ) : (
                            <FontAwesomeIcon icon={faTrash} />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
                {/* Profile Image */}
                {selectedUser.profileImage && (
                  <div className="flex justify-center">
                    <img
                      className="h-32 w-32 rounded-full object-cover"
                      src={selectedUser.profileImage}
                      alt={selectedUser.fullName}
                    />
                  </div>
                )}

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name:</label>
                      <span className="text-gray-900">{selectedUser.fullName}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">USN:</label>
                      <span className="text-gray-900">{selectedUser.usn || 'Not provided'}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email:</label>
                      <span className="text-gray-900">{selectedUser.email}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role:</label>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${getRoleColor(selectedUser.role)}`}>
                        <FontAwesomeIcon icon={getRoleIcon(selectedUser.role)} />
                        {selectedUser.role}
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

                {/* Social Links */}
                {(selectedUser.linkedinUrl || selectedUser.githubUrl || selectedUser.portfolioUrl) && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Social Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedUser.linkedinUrl && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">LinkedIn:</label>
                          <a href={selectedUser.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedUser.linkedinUrl}
                          </a>
                        </div>
                      )}
                      {selectedUser.githubUrl && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">GitHub:</label>
                          <a href={selectedUser.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedUser.githubUrl}
                          </a>
                        </div>
                      )}
                      {selectedUser.portfolioUrl && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Portfolio:</label>
                          <a href={selectedUser.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {selectedUser.portfolioUrl}
                          </a>
                        </div>
                      )}
                    </div>
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
