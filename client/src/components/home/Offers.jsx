import './Offers.css';
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
    <section className="offers">
      <div className="container">
        <div className="section-header">
          <h2>Our Offers</h2>
          <p>Everything we provide to help you grow as a developer</p>
        </div>
        <div className="offers-grid">
          {offersData.map((offer, index) => (
            <div key={index} className="offer-item">
              <div className="offer-icon">
                <FontAwesomeIcon icon={offer.icon} />
              </div>
              <h3 className="offer-title">{offer.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Offers;
