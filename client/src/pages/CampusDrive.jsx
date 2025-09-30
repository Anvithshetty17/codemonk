import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBuilding, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaExternalLinkAlt, 
  FaFilter,
  FaSort,
  FaClock,
  FaMapMarkerAlt,
  FaBookOpen,
  FaGlobe
} from 'react-icons/fa';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import api from '../utils/api';

const CampusDrive = () => {
  const [campusDrives, setCampusDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('dateOfFirstRound');
  const [categories, setCategories] = useState([]);

  // Fetch campus drives
  useEffect(() => {
    fetchCampusDrives();
    fetchCategories();
  }, [selectedCategory, sortBy]);

  const fetchCampusDrives = async () => {
    try {
      setLoading(true);
      const response = await api.get('/campus-drives', {
        params: {
          category: selectedCategory,
          sort: sortBy,
          active: 'true'
        }
      });
      setCampusDrives(response.data.data || []);
    } catch (error) {
      console.error('Error fetching campus drives:', error);
      setCampusDrives([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/campus-drives/categories');
      setCategories(['all', ...(response.data.data || [])]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(['all']); // Set default categories on error
    }
  };

  const getDateStatus = (date) => {
    const driveDate = new Date(date);
    if (isPast(driveDate) && !isToday(driveDate)) {
      return { status: 'past', label: 'Completed', color: 'text-gray-500' };
    } else if (isToday(driveDate)) {
      return { status: 'today', label: 'Today', color: 'text-red-600' };
    } else if (isTomorrow(driveDate)) {
      return { status: 'tomorrow', label: 'Tomorrow', color: 'text-orange-600' };
    } else {
      return { status: 'upcoming', label: 'Upcoming', color: 'text-green-600' };
    }
  };

  const formatDate = (date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Campus Drive Portal
          </h1>
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-red-600 to-pink-600 mx-auto mb-6 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Stay updated with upcoming campus drives, company information, and study materials to ace your interviews.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-500" />
                <span className="font-medium text-gray-700">Filter by Category:</span>
              </div>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaSort className="text-gray-500" />
                <span className="font-medium text-gray-700">Sort by:</span>
              </div>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="dateOfFirstRound">Date (Earliest First)</option>
                <option value="priority">Priority</option>
                <option value="companyName">Company Name</option>
                <option value="newest">Recently Added</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Campus Drives Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
          </div>
        ) : !campusDrives || campusDrives.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <FaBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-500 mb-2">No Campus Drives Found</h3>
            <p className="text-gray-400">
              {selectedCategory === 'all' 
                ? 'No campus drives are currently scheduled.' 
                : `No campus drives found in "${selectedCategory}" category.`}
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campusDrives && campusDrives.map((drive, index) => {
              const dateStatus = getDateStatus(drive.dateOfFirstRound);
              return (
                <motion.div
                  key={drive._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100 
                  }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  {/* Company Header */}
                  <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-white drop-shadow-lg">{drive.companyName}</h3>
                        <div className="flex items-center gap-2 text-red-100">
                          <FaMapMarkerAlt className="text-sm" />
                          <span className="text-sm">{drive.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${dateStatus.color === 'text-red-600' ? 'text-yellow-300' : 'text-red-100'}`}>
                          {dateStatus.label}
                        </div>
                        {drive.priority > 0 && (
                          <div className="bg-white/20 px-2 py-1 rounded-full text-xs mt-1">
                            Priority: {drive.priority}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Date */}
                    <div className="flex items-center gap-3 text-gray-600">
                      <FaCalendarAlt className="text-red-500" />
                      <div className="flex-1">
                        <div className="font-medium">{formatDate(drive.dateOfFirstRound)}</div>
                      </div>
                    </div>

                    {/* Package */}
                    <div className="flex items-center gap-3 text-gray-600">
                      <FaMoneyBillWave className="text-green-500" />
                      <div>
                        <span className="font-medium">Package: </span>
                        <span className="text-green-600 font-semibold">{drive.package}</span>
                      </div>
                    </div>

                    {/* Job Description */}
                    <div className="text-gray-600">
                      <p className="text-sm leading-relaxed line-clamp-3">
                        {drive.jobDescription}
                      </p>
                    </div>

                    {/* Additional Notes */}
                    {drive.additionalNotes && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 italic">
                          "{drive.additionalNotes}"
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      {drive.studyMaterialLink && (
                        <a
                          href={drive.studyMaterialLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium text-center transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <FaBookOpen className="text-sm" />
                          Study Material
                        </a>
                      )}
                      
                      {drive.companyWebsite && (
                        <a
                          href={drive.companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium text-center transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <FaGlobe className="text-sm" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-600/5 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        <motion.div
          className="text-center mt-16 bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-2xl font-bold text-red-600">{campusDrives ? campusDrives.length : 0}</div>
              <div className="text-sm text-gray-600">Active Drives</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {campusDrives ? campusDrives.filter(drive => getDateStatus(drive.dateOfFirstRound).status === 'upcoming').length : 0}
              </div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {campusDrives ? campusDrives.filter(drive => getDateStatus(drive.dateOfFirstRound).status === 'today' || getDateStatus(drive.dateOfFirstRound).status === 'tomorrow').length : 0}
              </div>
              <div className="text-sm text-gray-600">This Week</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {campusDrives ? new Set(campusDrives.map(drive => drive.category)).size : 0}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CampusDrive;
