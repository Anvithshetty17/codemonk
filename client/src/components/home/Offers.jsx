import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faBriefcase, 
  faHandshake, 
  faMicrophone, 
  faRocket, 
  faTrophy, 
  faLaptopCode 
} from '@fortawesome/free-solid-svg-icons';

const offersData = [
  { icon: faBook, title: 'Workshop & Training' },
  { icon: faBriefcase, title: 'Internships' },
  { icon: faHandshake, title: 'Peer Learning' },
  { icon: faMicrophone, title: 'Guest Lectures' },
  { icon: faRocket, title: 'Real Time Projects' },
  { icon: faTrophy, title: 'Coding Contests' },
  { icon: faLaptopCode, title: 'Trending Tech Skills' }
];

const Offers = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Offers</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything we provide to help you grow as a developer</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-6">
          {offersData.map((offer, index) => (
            <div key={index} className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 hover:border-blue-200">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={offer.icon} className="text-lg text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 leading-tight">{offer.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Offers;
