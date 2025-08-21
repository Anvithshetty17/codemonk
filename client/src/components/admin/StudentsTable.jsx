import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

const StudentsTable = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterInterest, setFilterInterest] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { showError } = useToast();

  useEffect(() => {
    fetchStudents();
  }, [currentPage, filterInterest]);

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10
      });
      
      if (filterInterest) {
        params.append('areasOfInterest', filterInterest);
      }

      console.log('Fetching students with params:', params.toString());
      const response = await api.get(`/users?${params}`);
      console.log('Students API response:', response.data);
      
      if (response.data.success) {
        setStudents(response.data.data.users);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      console.error('Error response:', error.response?.data);
      showError(error.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
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

  const openStudentModal = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const closeStudentModal = () => {
    setSelectedStudent(null);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="students-loading">
        <div className="spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="students-table">
      <div className="students-header">
        <h2><FontAwesomeIcon icon={faUsers} /> Registered Students</h2>
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

      {students.length === 0 ? (
        <div className="no-students">
          <h3>No Students Found</h3>
          <p>No students match the current filter criteria.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="students-data-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>WhatsApp</th>
                  <th>Areas of Interest</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.fullName}</td>
                    <td>{student.email}</td>
                    <td>{student.phone}</td>
                    <td>{student.whatsappNumber || 'N/A'}</td>
                    <td>
                      <div className="interests-tags">
                        {Array.isArray(student.areasOfInterest) 
                          ? student.areasOfInterest.map((interest, index) => (
                              <span key={index} className="interest-tag">
                                {interest}
                              </span>
                            ))
                          : student.areasOfInterest
                        }
                      </div>
                    </td>
                    <td>{formatDate(student.createdAt)}</td>
                    <td>
                      <button
                        onClick={() => openStudentModal(student)}
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

      {/* Student Details Modal */}
      {showModal && selectedStudent && (
        <div className="modal-overlay" onClick={closeStudentModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Student Details</h3>
              <button 
                className="modal-close"
                onClick={closeStudentModal}
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
                      <span>{selectedStudent.fullName}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedStudent.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{selectedStudent.phone}</span>
                    </div>
                    <div className="detail-item">
                      <label>WhatsApp:</label>
                      <span>{selectedStudent.whatsappNumber || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Joined:</label>
                      <span>{formatDate(selectedStudent.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Coding Profile</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Coding Skills Rating:</label>
                      <span>{selectedStudent.codingSkillsRating || 'Not provided'}/10</span>
                    </div>
                    <div className="detail-item">
                      <label>Favorite Programming Language:</label>
                      <span>{selectedStudent.favoriteProgrammingLanguage || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Areas of Interest</h4>
                  <div className="interests-tags">
                    {Array.isArray(selectedStudent.areasOfInterest) 
                      ? selectedStudent.areasOfInterest.map((interest, index) => (
                          <span key={index} className="interest-tag">
                            {interest}
                          </span>
                        ))
                      : <span>{selectedStudent.areasOfInterest || 'Not provided'}</span>
                    }
                  </div>
                </div>

                {selectedStudent.favoriteLanguageReason && (
                  <div className="detail-section">
                    <h4>Why Their Favorite Language?</h4>
                    <p className="detail-text">{selectedStudent.favoriteLanguageReason}</p>
                  </div>
                )}

                {selectedStudent.proudProject && (
                  <div className="detail-section">
                    <h4>Project They're Proud Of</h4>
                    <p className="detail-text">{selectedStudent.proudProject}</p>
                  </div>
                )}

                {selectedStudent.debuggingProcess && (
                  <div className="detail-section">
                    <h4>Debugging Approach</h4>
                    <p className="detail-text">{selectedStudent.debuggingProcess}</p>
                  </div>
                )}

                {selectedStudent.previousExperience && (
                  <div className="detail-section">
                    <h4>Previous Experience</h4>
                    <p className="detail-text">{selectedStudent.previousExperience}</p>
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
