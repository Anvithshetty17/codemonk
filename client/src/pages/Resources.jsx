import { motion } from 'framer-motion';
import { FaGitAlt, FaBook, FaJava, FaBrain } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Resources = () => {
  const navigate = useNavigate();
  
  const handleGitLearningClick = () => {
    window.open('https://codemonk-git.vercel.app', '_blank');
  };

  const handleMCANotesClick = () => {
    window.open('https://drive.google.com/drive/folders/1U1yrt9pYkBbeEqFMAs6UL0_TVLAlCbTg?usp=sharing', '_blank');
  };

  const handleJavaPrepClick = () => {
    window.open('https://gotext-prep.vercel.app/', '_blank');
  };

  const handleInterviewEssentialsClick = () => {
    navigate('/interview-essentials');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Resources
          </h1>
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-8 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Explore our educational resources and interactive demonstrations to enhance your understanding of web technologies and development concepts.
          </p>
        </motion.div>

        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl w-full">
            {/* Git Learning Resource */}
            <motion.button
              onClick={handleGitLearningClick}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 p-8"
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.5,
                type: "spring",
                stiffness: 100 
              }}
            >
              <div className="text-center">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full mx-auto mb-6 flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <FaGitAlt className="text-white text-2xl" />
                </motion.div>
                
                <motion.h3 
                  className="text-xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  Learn Git CMD and GitHub
                </motion.h3>
                
                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  Master Git commands and GitHub workflows with interactive tutorials and hands-on practice.
                </p>
                
                <motion.div 
                  className="inline-flex items-center text-orange-600 font-semibold group-hover:text-red-600 transition-colors duration-300"
                  whileHover={{ x: 5 }}
                >
                  Explore →
                </motion.div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
            </motion.button>

            {/* MCA Notes Resource */}
            <motion.button
              onClick={handleMCANotesClick}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 p-8"
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.7,
                type: "spring",
                stiffness: 100 
              }}
            >
              <div className="text-center">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <FaBook className="text-white text-2xl" />
                </motion.div>
                
                <motion.h3 
                  className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  MCA Theory and Lab Notes
                </motion.h3>
                
                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  Comprehensive collection of MCA theory notes and lab materials. All subjects covered with detailed explanations.
                </p>
                
                <motion.div 
                  className="inline-flex items-center text-blue-600 font-semibold group-hover:text-purple-600 transition-colors duration-300"
                  whileHover={{ x: 5 }}
                >
                  Access Notes →
                </motion.div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
            </motion.button>

            {/* Java Preparation Resource */}
            <motion.button
              onClick={handleJavaPrepClick}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 p-8"
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.9,
                type: "spring",
                stiffness: 100 
              }}
            >
              <div className="text-center">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full mx-auto mb-6 flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <FaJava className="text-white text-2xl" />
                </motion.div>
                
                <motion.h3 
                  className="text-xl font-bold text-gray-900 mb-4 group-hover:text-amber-600 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  Java Interview Preparation
                </motion.h3>
                
                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  Complete Java preparation platform with interview questions, coding challenges, and comprehensive study materials.
                </p>
                
                <motion.div 
                  className="inline-flex items-center text-amber-600 font-semibold group-hover:text-orange-600 transition-colors duration-300"
                  whileHover={{ x: 5 }}
                >
                  Start Learning →
                </motion.div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
            </motion.button>

            {/* Interview Essentials Resource */}
            <motion.button
              onClick={handleInterviewEssentialsClick}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 p-8"
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 1.1,
                type: "spring",
                stiffness: 100 
              }}
            >
              <div className="text-center">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <FaBrain className="text-white text-2xl" />
                </motion.div>
                
                <motion.h3 
                  className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  Interview Essentials
                </motion.h3>
                
                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  Must-know concepts before technical interviews - port numbers, OOP, data structures, and algorithms all in one place.
                </p>
                
                <motion.div 
                  className="inline-flex items-center text-purple-600 font-semibold group-hover:text-indigo-600 transition-colors duration-300"
                  whileHover={{ x: 5 }}
                >
                  Study Now →
                </motion.div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <p className="text-gray-500 italic">More resources coming soon...</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Resources;