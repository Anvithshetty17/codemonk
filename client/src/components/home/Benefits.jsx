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
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Benefits</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">What you'll gain by joining Code Monk</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefitsData.map((benefit, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 hover:bg-white">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon icon={benefit.icon} className="text-2xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
              <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
