import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaYoutube,
  FaGlobe,
  FaTelegramPlane,
  FaWhatsapp,
  FaGoogleDrive,
  FaMobileAlt,
  FaExternalLinkAlt,
  FaSearch,
  FaTimes,
  FaTag
} from 'react-icons/fa';
import linkMaterialsData from '../data/linkmaterials.json';

const LinkMaterials = () => {
  const [linkMaterials, setLinkMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Icon mapping based on type
  const typeIconMap = {
    youtube: FaYoutube,
    website: FaGlobe,
    telegram: FaTelegramPlane,
    whatsapp: FaWhatsapp,
    drive: FaGoogleDrive,
    app: FaMobileAlt
  };

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLinkMaterials(linkMaterialsData);
      setFilteredMaterials(linkMaterialsData);
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let filtered = linkMaterials;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(material => material.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredMaterials(filtered);
  }, [linkMaterials, selectedCategory, searchTerm]);

  const categories = ['All', ...new Set(linkMaterials.map(material => material.category))];

  const handleLinkClick = (url, title) => {
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading educational resources...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent mb-6 uppercase">
            Educational Links
          </h1>
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-700 mx-auto mb-8 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Discover curated educational resources including YouTube channels, websites, mobile apps, 
            and community channels to accelerate your learning journey.
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources, tags, or descriptions..."
                  className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Categories</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Materials Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {filteredMaterials.map((material, index) => {
            const TypeIcon = typeIconMap[material.type] || FaGlobe;
            
            return (
              <motion.div
                key={material.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 cursor-pointer"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.1 * index,
                  type: "spring",
                  stiffness: 100 
                }}
                whileHover={{ y: -5 }}
                onClick={() => handleLinkClick(material.url, material.title)}
              >
                <div className="p-6">
                  {/* Header with Icon and Type */}
                  <div className="flex items-center justify-between mb-4">
                    <motion.div 
                      className={`w-12 h-12 bg-gradient-to-r ${material.color} rounded-lg flex items-center justify-center`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8 }}
                    >
                      <TypeIcon className="text-white text-xl" />
                    </motion.div>
                    <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full capitalize">
                      {material.type}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300">
                    {material.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {material.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {material.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md"
                      >
                        <FaTag className="text-xs" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Category */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                      {material.category}
                    </span>
                    <motion.div 
                      className="flex items-center gap-2 text-indigo-600 font-semibold group-hover:text-purple-700 transition-colors duration-300"
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-sm">Visit</span>
                      <FaExternalLinkAlt className="text-xs" />
                    </motion.div>
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${material.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
              </motion.div>
            );
          })}
        </motion.div>

        {/* No Results */}
        {filteredMaterials.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl text-gray-300 mb-4">🔗</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No resources found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters.</p>
          </motion.div>
        )}

        {/* Coming Soon Note */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-indigo-800 mb-2">More Resources Coming Soon!</h3>
            <p className="text-indigo-600">
              We're constantly adding new educational links and resources. 
              Have a suggestion? Let us know!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LinkMaterials;