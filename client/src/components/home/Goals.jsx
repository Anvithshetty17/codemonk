import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBullseye, 
  faLightbulb, 
  faHandshake, 
  faBriefcase 
} from '@fortawesome/free-solid-svg-icons';

const goalsData = [
  {
    icon: faBullseye,
    title: 'Empower Students',
    description: 'Equip MCA Students with the skills and knowledge necessary for future success'
  },
  {
    icon: faLightbulb,
    title: 'Foster Innovation',
    description: 'Encourage creativity through coding challenges, competition and innovation projects.'
  },
  {
    icon: faHandshake,
    title: 'Promote Collaboration',
    description: 'Build supportive community where MCA students can collaborate, share knowledge and support each other.'
  },
  {
    icon: faBriefcase,
    title: 'Enhance Employability',
    description: 'Prepare students for successful careers by providing practical experiences and skill development.'
  }
];

const Goals = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Goals</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">What we aim to achieve with Code Monk</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {goalsData.map((goal, index) => (
            <div key={index} className="bg-white rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon icon={goal.icon} className="text-2xl text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{goal.title}</h3>
              <p className="text-gray-600 leading-relaxed">{goal.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Goals;
