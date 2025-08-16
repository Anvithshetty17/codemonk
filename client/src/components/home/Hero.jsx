import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">CODE MONK</h1>
          <h2 className="hero-subtitle">Transforming Beginners into Experts!</h2>
          <p className="hero-description">
            Are you ready to embark on a coding journey like no other? At Code Monk, we believe that everyone has the potential to become a coding expert. Whether you're taking your first steps in programming or looking to refine your advanced skills, our tech club is designed to guide you every step of the way.
          </p>
          <div className="hero-actions">
            <Link to="/auth" className="btn btn-primary btn-lg">
              Join Our Community
            </Link>
            <Link to="/team" className="btn btn-outline btn-lg">
              Meet Our Team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
