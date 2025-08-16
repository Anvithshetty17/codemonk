import './Offers.css';

const offersData = [
  { icon: '📚', title: 'Workshop & Training' },
  { icon: '💼', title: 'Internships' },
  { icon: '🤝', title: 'Peer Learning' },
  { icon: '🎤', title: 'Guest Lectures' },
  { icon: '🚀', title: 'Real Time Projects' },
  { icon: '🏆', title: 'Coding Contests' },
  { icon: '💻', title: 'Trending Tech Skills' }
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
              <div className="offer-icon">{offer.icon}</div>
              <h3 className="offer-title">{offer.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Offers;
