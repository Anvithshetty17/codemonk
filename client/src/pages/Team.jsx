import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import './Team.css';

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
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
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
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
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
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
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
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5S13.5 5.83 13.5 5s.67-1.5 1.5-1.5zM9 3.5c.83 0 1.5.67 1.5 1.5S9.83 6.5 9 6.5 7.5 5.83 7.5 5s.67-1.5 1.5-1.5zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5z"/>
                          </svg>
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