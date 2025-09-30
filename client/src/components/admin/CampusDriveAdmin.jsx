import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaToggleOn, 
  FaToggleOff,
  FaCalendarAlt,
  FaBuilding,
  FaMoneyBillWave,
  FaSave,
  FaTimes,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { format } from 'date-fns';
import api from '../../utils/api';
import Swal from 'sweetalert2';

const CampusDriveAdmin = () => {
  const [campusDrives, setCampusDrives] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    jobDescription: '',
    dateOfFirstRound: '',
    category: '',
    package: '',
    studyMaterialLink: '',
    companyWebsite: '',
    additionalNotes: '',
    priority: 0
  });

  useEffect(() => {
    fetchCampusDrives();
    fetchCategories();
  }, []);

  const fetchCampusDrives = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campus-drives', {
        params: { active: 'all' }
      });
      setCampusDrives(response.data.data);
    } catch (error) {
      console.error('Error fetching campus drives:', error);
      Swal.fire('Error', 'Failed to fetch campus drives', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/campus-drives/categories');
      setCategories(response.data.data || ['Mass Recruitment', 'Dream Company', 'Super Dream Company']);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to default categories if API fails
      setCategories(['Mass Recruitment', 'Dream Company', 'Super Dream Company']);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      jobDescription: '',
      dateOfFirstRound: '',
      category: '',
      package: '',
      studyMaterialLink: '',
      companyWebsite: '',
      additionalNotes: '',
      priority: 0
    });
    setEditingDrive(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.companyName || !formData.jobDescription || !formData.dateOfFirstRound || 
          !formData.category || !formData.package) {
        Swal.fire('Error', 'Please fill in all required fields', 'error');
        return;
      }

      // Prepare the data with proper date format
      // Create date at noon to avoid timezone issues
      const selectedDate = new Date(formData.dateOfFirstRound + 'T12:00:00');
      
      const submitData = {
        companyName: formData.companyName.trim(),
        jobDescription: formData.jobDescription.trim(),
        dateOfFirstRound: selectedDate.toISOString(),
        category: formData.category,
        package: formData.package.trim(),
        priority: parseInt(formData.priority) || 0
      };

      // Add optional fields only if they have values
      if (formData.studyMaterialLink && formData.studyMaterialLink.trim()) {
        submitData.studyMaterialLink = formData.studyMaterialLink.trim();
      }
      
      if (formData.companyWebsite && formData.companyWebsite.trim()) {
        submitData.companyWebsite = formData.companyWebsite.trim();
      }
      
      if (formData.additionalNotes && formData.additionalNotes.trim()) {
        submitData.additionalNotes = formData.additionalNotes.trim();
      }

      console.log('Submitting data:', submitData);

      if (editingDrive) {
        // Update existing drive
        await api.put(`/campus-drives/${editingDrive._id}`, submitData);
        Swal.fire('Success', 'Campus drive updated successfully!', 'success');
      } else {
        // Create new drive
        await api.post('/campus-drives', submitData);
        Swal.fire('Success', 'Campus drive created successfully!', 'success');
      }

      setShowModal(false);
      resetForm();
      fetchCampusDrives();
    } catch (error) {
      console.error('Error saving campus drive:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to save campus drive';
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(err => err.msg || err.message).join(', ');
        errorMessage = errorMessages;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Swal.fire('Error', errorMessage, 'error');
    }
  };

  const handleEdit = (drive) => {
    setEditingDrive(drive);
    setFormData({
      companyName: drive.companyName,
      jobDescription: drive.jobDescription,
      dateOfFirstRound: format(new Date(drive.dateOfFirstRound), 'yyyy-MM-dd'),
      category: drive.category,
      package: drive.package,
      studyMaterialLink: drive.studyMaterialLink || '',
      companyWebsite: drive.companyWebsite || '',
      additionalNotes: drive.additionalNotes || '',
      priority: drive.priority
    });
    setShowModal(true);
  };

  const handleDelete = async (driveId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/campus-drives/${driveId}`);
        Swal.fire('Deleted!', 'Campus drive has been deleted.', 'success');
        fetchCampusDrives();
      } catch (error) {
        console.error('Error deleting campus drive:', error);
        Swal.fire('Error', 'Failed to delete campus drive', 'error');
      }
    }
  };

  const toggleStatus = async (driveId) => {
    try {
      await api.patch(`/campus-drives/${driveId}/toggle-status`, {});
      fetchCampusDrives();
    } catch (error) {
      console.error('Error toggling status:', error);
      Swal.fire('Error', 'Failed to update status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campus Drive Management</h2>
          <p className="text-gray-600 mt-1">Manage campus drives, company information, and study materials</p>
        </div>
        <motion.button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus /> Add New Drive
        </motion.button>
      </div>

      {/* Campus Drives Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campusDrives.map((drive) => (
                  <tr key={drive._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaBuilding className="text-red-500 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {drive.companyName}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {drive.jobDescription}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {drive.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaCalendarAlt className="text-gray-400 mr-2" />
                        {format(new Date(drive.dateOfFirstRound), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-green-600 font-medium">
                        <FaMoneyBillWave className="mr-2" />
                        {drive.package}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        drive.priority >= 8 ? 'bg-red-100 text-red-800' :
                        drive.priority >= 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {drive.priority}/10
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(drive._id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                          drive.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } transition-colors duration-200`}
                      >
                        {drive.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        {drive.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(drive)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(drive._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                        {drive.studyMaterialLink && (
                          <a
                            href={drive.studyMaterialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                            title="Study Material"
                          >
                            <FaExternalLinkAlt />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingDrive ? 'Edit Campus Drive' : 'Add New Campus Drive'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of First Round *
                    </label>
                    <input
                      type="date"
                      name="dateOfFirstRound"
                      value={formData.dateOfFirstRound}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Package *
                    </label>
                    <input
                      type="text"
                      name="package"
                      value={formData.package}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="e.g., 8-12 LPA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Study Material Link
                    </label>
                    <input
                      type="url"
                      name="studyMaterialLink"
                      value={formData.studyMaterialLink}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Website
                    </label>
                    <input
                      type="url"
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Describe the job role, requirements, and responsibilities"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Any additional information or tips for students"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority (0-10)
                  </label>
                  <input
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    min="0"
                    max="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Higher priority drives appear first</p>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors duration-200"
                  >
                    <FaSave />
                    {editingDrive ? 'Update Drive' : 'Create Drive'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CampusDriveAdmin;
