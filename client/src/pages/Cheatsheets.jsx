import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaReact, 
  FaCss3Alt, 
  FaGitAlt, 
  FaNodeJs, 
  FaDatabase,
  FaCode,
  FaBrain,
  FaDownload,
  FaEye,
  FaSearch,
  FaTimes
} from 'react-icons/fa';
import { 
  SiJavascript,
  SiPython
} from 'react-icons/si';
import cheatsheetsData from '../data/cheatsheets.json';

const Cheatsheets = () => {
  const [cheatsheets, setCheatsheets] = useState([]);
  const [filteredCheatsheets, setFilteredCheatsheets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Icon mapping
  const iconMap = {
    javascript: SiJavascript,
    react: FaReact,
    css: FaCss3Alt,
    git: FaGitAlt,
    node: FaNodeJs,
    database: FaDatabase,
    code: FaCode,
    python: SiPython,
    brain: FaBrain
  };

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setCheatsheets(cheatsheetsData);
      setFilteredCheatsheets(cheatsheetsData);
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let filtered = cheatsheets;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(sheet => sheet.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sheet =>
        sheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sheet.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCheatsheets(filtered);
  }, [cheatsheets, selectedCategory, searchTerm]);

  const categories = ['All', ...new Set(cheatsheets.map(sheet => sheet.category))];

  const handleDownload = (pdfPath, title) => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (pdfPath) => {
    window.open(pdfPath, '_blank');
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
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading cheatsheets...</p>
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
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-6 uppercase">
            Study Materials
          </h1>
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-green-600 to-teal-600 mx-auto mb-8 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Quick reference cheatsheets and study materials for various programming languages and technologies. 
            Perfect for interviews, quick reviews, and learning new concepts.
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
                  placeholder="Search cheatsheets..."
                  className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Cheatsheets Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {filteredCheatsheets.map((sheet, index) => {
            const IconComponent = iconMap[sheet.icon] || FaDatabase;
            
            return (
              <motion.div
                key={sheet.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.1 * index,
                  type: "spring",
                  stiffness: 100 
                }}
                whileHover={{ y: -5 }}
              >
                <div className="p-6">
                  {/* Icon and Category */}
                  <div className="flex items-center justify-between mb-4">
                    <motion.div 
                      className={`w-12 h-12 ${
                        sheet.icon === 'javascript' 
                          ? 'bg-blue-500' 
                          : sheet.icon === 'python' 
                            ? 'bg-green-500' 
                            : `bg-gradient-to-r ${sheet.color}`
                      } rounded-lg flex items-center justify-center shadow-none border-0`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8 }}
                    >
                      <IconComponent 
                        className={`text-xl ${
                          sheet.icon === 'javascript' 
                            ? 'text-white' 
                            : sheet.icon === 'python' 
                              ? 'text-white' 
                              : 'text-white'
                        }`} 
                      />
                    </motion.div>
                    <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                      {sheet.category}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                    {sheet.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {sheet.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => handlePreview(sheet.pdfPath)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaEye className="text-sm" />
                      Preview
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleDownload(sheet.pdfPath, sheet.title)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaDownload className="text-sm" />
                      Download
                    </motion.button>
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${sheet.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
              </motion.div>
            );
          })}
        </motion.div>

        {/* No Results */}
        {filteredCheatsheets.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl text-gray-300 mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No cheatsheets found</h3>
            <p className="text-gray-500">Try adjusting your search terms or category filter.</p>
          </motion.div>
        )}

        {/* Coming Soon Note */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-green-800 mb-2">More Materials Coming Soon!</h3>
            <p className="text-green-600">
              We're constantly adding new cheatsheets and study materials. 
              Check back regularly for updates on the latest technologies.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cheatsheets;