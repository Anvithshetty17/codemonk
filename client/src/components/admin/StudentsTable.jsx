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
      <div className="students-loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="students-table">
      <div className="students-header">
        <h2><FontAwesomeIcon icon={faUsers} /> Registered Users</h2>
        <div className="students-filters">
          <div className="students-filter">
            <label htmlFor="roleFilter">Filter by Role:</label>
            <select
              id="roleFilter"
              value={filterRole}
              onChange={handleRoleFilterChange}
              className="form-select"
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="mentor">Mentors</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div className="students-filter">
            <label htmlFor="interestFilter">Filter by Interest:</label>
            <select
              id="interestFilter"
              value={filterInterest}
              onChange={handleFilterChange}
              className="form-select"
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
        <div className="no-students">
          <h3>No Users Found</h3>
          <p>No users match the current filter criteria.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="students-data-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Areas of Interest</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>
                      <div className="role-container">
                        <span 
                          className="role-badge" 
                          style={{ 
                            backgroundColor: getRoleColor(user.role),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}
                        >
                          <FontAwesomeIcon icon={getRoleIcon(user.role)} /> {user.role}
                        </span>
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user._id, e.target.value)}
                          disabled={updatingRole === user._id}
                          className="role-select"
                          style={{ marginLeft: '8px', fontSize: '0.8rem' }}
                        >
                          <option value="student">Student</option>
                          <option value="mentor">Mentor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                    <td>{user.phone}</td>
                    <td>
                      <div className="interests-tags">
                        {Array.isArray(user.areasOfInterest) 
                          ? user.areasOfInterest.map((interest, index) => (
                              <span key={index} className="interest-tag">
                                {interest}
                              </span>
                            ))
                          : user.areasOfInterest
                        }
                      </div>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <button
                        onClick={() => openUserModal(user)}
                        className="btn btn-secondary btn-sm"
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
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={closeUserModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button 
                className="modal-close"
                onClick={closeUserModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="student-details">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Full Name:</label>
                      <span>{selectedUser.fullName}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Role:</label>
                      <span 
                        className="role-badge" 
                        style={{ 
                          backgroundColor: getRoleColor(selectedUser.role),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        <FontAwesomeIcon icon={getRoleIcon(selectedUser.role)} /> {selectedUser.role}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{selectedUser.phone}</span>
                    </div>
                    <div className="detail-item">
                      <label>WhatsApp:</label>
                      <span>{selectedUser.whatsappNumber || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Joined:</label>
                      <span>{formatDate(selectedUser.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Coding Profile</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Coding Skills Rating:</label>
                      <span>{selectedUser.codingSkillsRating || 'Not provided'}/10</span>
                    </div>
                    <div className="detail-item">
                      <label>Favorite Programming Language:</label>
                      <span>{selectedUser.favoriteProgrammingLanguage || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Areas of Interest</h4>
                  <div className="interests-tags">
                    {Array.isArray(selectedUser.areasOfInterest) 
                      ? selectedUser.areasOfInterest.map((interest, index) => (
                          <span key={index} className="interest-tag">
                            {interest}
                          </span>
                        ))
                      : <span>{selectedUser.areasOfInterest || 'Not provided'}</span>
                    }
                  </div>
                </div>

                {selectedUser.favoriteLanguageReason && (
                  <div className="detail-section">
                    <h4>Why Their Favorite Language?</h4>
                    <p className="detail-text">{selectedUser.favoriteLanguageReason}</p>
                  </div>
                )}

                {selectedUser.proudProject && (
                  <div className="detail-section">
                    <h4>Project They're Proud Of</h4>
                    <p className="detail-text">{selectedUser.proudProject}</p>
                  </div>
                )}

                {selectedUser.debuggingProcess && (
                  <div className="detail-section">
                    <h4>Debugging Approach</h4>
                    <p className="detail-text">{selectedUser.debuggingProcess}</p>
                  </div>
                )}

                {selectedUser.previousExperience && (
                  <div className="detail-section">
                    <h4>Previous Experience</h4>
                    <p className="detail-text">{selectedUser.previousExperience}</p>
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
