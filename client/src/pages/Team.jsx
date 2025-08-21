import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

const Team = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/members');
      if (response.data.success) {
        console.log('Team members loaded:', response.data.data.members);
        setMembers(response.data.data.members);
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  console.log('Team component rendering, members count:', members.length);

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Meet The Code Monk Team!</h1>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            At CodeMonk, our team is composed of enthusiastic students with a shared passion for coding and technology. Each member contributes their unique skills and perspectives, creating a vibrant and collaborative environment. Get to know the people behind CodeMonk and see how their diverse backgrounds and talents come together to make our club a thriving community!
          </p>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Coming Soon!</h3>
              <p className="text-gray-600">Our amazing team members will be featured here soon. Stay tuned to meet the brilliant minds behind Code Monk!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member) => (
              <div key={member._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=2563eb&color=fff&size=300`;
                    }}
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{member.name}</h3>
                  
                  {member.description && (
                    <p className="text-gray-600 mb-4 leading-relaxed">{member.description}</p>
                  )}
                  
                  {(member.socialLinks?.linkedin || member.socialLinks?.github || member.socialLinks?.twitter || member.socialLinks?.portfolio) && (
                    <div className="flex space-x-3 pt-2">
                      {member.socialLinks?.linkedin && (
                        <a 
                          href={member.socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200"
                          aria-label={`${member.name}'s LinkedIn`}
                          title="LinkedIn"
                        >
                          <FontAwesomeIcon icon={faLinkedin} />
                        </a>
                      )}
                      
                      {member.socialLinks?.github && (
                        <a 
                          href={member.socialLinks.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors duration-200"
                          aria-label={`${member.name}'s GitHub`}
                          title="GitHub"
                        >
                          <FontAwesomeIcon icon={faGithub} />
                        </a>
                      )}
                      
                      {member.socialLinks?.twitter && (
                        <a 
                          href={member.socialLinks.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors duration-200"
                          aria-label={`${member.name}'s Twitter`}
                          title="Twitter"
                        >
                          <FontAwesomeIcon icon={faTwitter} />
                        </a>
                      )}
                      
                      {member.socialLinks?.portfolio && (
                        <a 
                          href={member.socialLinks.portfolio} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors duration-200"
                          aria-label={`${member.name}'s Portfolio`}
                          title="Portfolio"
                        >
                          <FontAwesomeIcon icon={faGlobe} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;