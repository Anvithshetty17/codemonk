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
      <div className="team-loading">
        <div className="container">
          <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  console.log('Team component rendering, members count:', members.length);

  return (
    <div className="team-page">
      <div className="container">
        <div className="team-header">
          <h1>Meet The Code Monk Team !</h1>
          <p className="team-intro">
            At CodeMonk, our team is composed of enthusiastic students with a shared passion for coding and technology. Each member contributes their unique skills and perspectives, creating a vibrant and collaborative environment. Get to know the people behind CodeMonk and see how their diverse backgrounds and talents come together to make our club a thriving community!
          </p>
        </div>

        {members.length === 0 ? (
          <div className="no-members">
            <div className="no-members-content">
              <h3>Coming Soon!</h3>
              <p>Our amazing team members will be featured here soon. Stay tuned to meet the brilliant minds behind Code Monk!</p>
            </div>
          </div>
        ) : (
          <div className="team-grid">
            {members.map((member) => (
              <div key={member._id} className="member-card">
                <div className="member-image">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=2563eb&color=fff&size=300`;
                    }}
                  />
                </div>
                
                <div className="member-content">
                  <h3 className="member-name">{member.name}</h3>
                  
                  {member.description && (
                    <p className="member-description">{member.description}</p>
                  )}
                  
                  {(member.socialLinks?.linkedin || member.socialLinks?.github || member.socialLinks?.twitter || member.socialLinks?.portfolio) && (
                    <div className="member-social-links">
                      {member.socialLinks?.linkedin && (
                        <a 
                          href={member.socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="social-link linkedin"
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
                          className="social-link github"
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
                          className="social-link twitter"
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
                          className="social-link portfolio"
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