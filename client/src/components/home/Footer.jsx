import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Code Monk</h3>
            <p>Dept. Of MCA</p>
            <p>NMAM Institute of Technology, Nitte, SH1, Karkala, Karnataka</p>
          </div>
          <div className="footer-social">
            <h4>Connect With Us</h4>
            <div className="social-links">
              <a href="#" aria-label="Facebook" className="social-link">
                📘
              </a>
              <a href="#" aria-label="Instagram" className="social-link">
                📷
              </a>
              <a href="#" aria-label="LinkedIn" className="social-link">
                💼
              </a>
              <a href="#" aria-label="GitHub" className="social-link">
                🐙
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Code Monk. All rights reserved.</p>
          <p>Transforming Beginners into Experts!</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
