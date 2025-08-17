import './Benefits.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faRocket, 
  faBriefcase, 
  faUsers 
} from '@fortawesome/free-solid-svg-icons';

const benefitsData = [
  {
    icon: faBuilding,
    title: 'Foundation In Programming',
    description: 'Build a strong understanding of programming concepts and methods, with a focus on MCA specfic applications'
  },
  {
    icon: faRocket,
    title: 'Skill Improvement',
    description: 'Participate in competitions to enhance your coding skills used and logical thinking, tailored for MCA Students.'
  },
  {
    icon: faBriefcase,
    title: 'Career Preparation',
    description: 'Gain the knowledge and experience needed for successful campus placements and internships, with a focus on MCA career paths.'
  },
  {
    icon: faUsers,
    title: 'Community',
    description: 'Connect with like-minded MCA peers who share your passion for coding and problem solving.'
  }
];

const Benefits = () => {
  return (
    <section className="benefits">
      <div className="container">
        <div className="section-header">
          <h2>Benefits</h2>
          <p>What you'll gain by joining Code Monk</p>
        </div>
        <div className="grid grid-cols-4 benefits-grid">
          {benefitsData.map((benefit, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-icon">
                <FontAwesomeIcon icon={benefit.icon} />
              </div>
              <h3 className="benefit-title">{benefit.title}</h3>
              <p className="benefit-description">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
