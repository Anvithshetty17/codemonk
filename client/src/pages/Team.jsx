import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faGlobe, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
/* === TREASURE HUNT START === */
import { useTreasureHunt, EditableText } from '../utils/treasureHunt.jsx';
/* === TREASURE HUNT END === */

const Team = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();
  /* === TREASURE HUNT START === */
  const { secondFound, handleSecondTreasure } = useTreasureHunt();
  /* === TREASURE HUNT END === */

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/members');
      if (response.data.success) {
        console.log('Team members loaded:', response.data.data.members);
        // Sort members alphabetically by name
        const sortedMembers = response.data.data.members.sort((a, b) => 
          a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
        );
        setMembers(sortedMembers);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      showError('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
            />
          </div>
        </div>
      </div>
    );
  }

  console.log('Team component rendering, members count:', members.length);

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
            Meet The {/* === TREASURE HUNT START === */}
            <EditableText 
              initialText="Cold"
              targetText="Code"
              onCorrectEdit={handleSecondTreasure}
              isCompleted={secondFound}
            />
            {/* === TREASURE HUNT END === */} Monk Team
          </h1>
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-8 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            At CodeMonk, our team is composed of enthusiastic students with a shared passion for coding and technology. 
            Each member contributes their unique skills and perspectives, creating a vibrant and collaborative environment.
          </p>
        </motion.div>

        {members.length === 0 ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-12">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                <FontAwesomeIcon icon={faGlobe} className="text-white text-3xl" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Coming Soon!</h3>
              <p className="text-gray-600 text-lg">Our amazing team members will be featured here soon. Stay tuned to meet the brilliant minds behind Code Monk!</p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {members.map((member, index) => (
              <motion.div
                key={member._id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100 
                }}
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Image Section with Gradient Overlay */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                  <motion.img 
                    src={member.image?.startsWith('http') ? member.image : `/uploads/${member.image}`} 
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&color=fff&size=400&bold=true`;
                    }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                {/* Content Section */}
                <div className="p-6 space-y-4 text-center">
                  <motion.h3 
                    className="text-xl font-bold text-gray-900 transition-colors duration-300 uppercase"
                    whileHover={{ scale: 1.05 }}
                  >
                    {member.name}
                  </motion.h3>
                  
                  {member.role && (
                    <div className="inline-block px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm font-semibold rounded-full uppercase">
                      {member.role}
                    </div>
                  )}
                  
                  {member.description && (
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 text-left">
                      {member.description}
                    </p>
                  )}
                  
                  {/* Social Links */}
                  {(member.socialLinks?.linkedin || member.socialLinks?.github || member.socialLinks?.twitter || member.socialLinks?.portfolio || member.socialLinks?.email) && (
                    <motion.div 
                      className="flex justify-center flex-wrap gap-2 pt-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {member.socialLinks?.linkedin && (
                        <motion.a 
                          href={member.socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                          aria-label={`${member.name}'s LinkedIn`}
                          title="LinkedIn"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FontAwesomeIcon icon={faLinkedin} className="text-sm text-white" />
                        </motion.a>
                      )}
                      
                      {member.socialLinks?.github && (
                        <motion.a 
                          href={member.socialLinks.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                          aria-label={`${member.name}'s GitHub`}
                          title="GitHub"
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FontAwesomeIcon icon={faGithub} className="text-sm text-white" />
                        </motion.a>
                      )}
                      
                      {member.socialLinks?.twitter && (
                        <motion.a 
                          href={member.socialLinks.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                          aria-label={`${member.name}'s Twitter`}
                          title="Twitter"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FontAwesomeIcon icon={faTwitter} className="text-sm text-white" />
                        </motion.a>
                      )}
                      
                      {member.socialLinks?.portfolio && (
                        <motion.a 
                          href={member.socialLinks.portfolio} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 text-white hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                          aria-label={`${member.name}'s Portfolio`}
                          title="Portfolio"
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FontAwesomeIcon icon={faGlobe} className="text-sm text-white" />
                        </motion.a>
                      )}

                      {member.socialLinks?.email && (
                        <motion.a 
                          href={`mailto:${member.socialLinks.email}`} 
                          className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                          aria-label={`Email ${member.name}`}
                          title="Email"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FontAwesomeIcon icon={faEnvelope} className="text-sm text-white" />
                        </motion.a>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Team;