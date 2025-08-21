import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFacebook, 
  faInstagram, 
  faLinkedin, 
  faGithub 
} from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="footer-brand">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">Code Monk</h3>
            <p className="text-gray-300 mb-2">Dept. Of MCA</p>
            <p className="text-gray-400 leading-relaxed">NMAM Institute of Technology, Nitte, SH1, Karkala, Karnataka</p>
          </div>
          <div className="footer-social">
            <h4 className="text-xl font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200">
                <FontAwesomeIcon icon={faFacebook} className="text-white" />
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors duration-200">
                <FontAwesomeIcon icon={faInstagram} className="text-white" />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors duration-200">
                <FontAwesomeIcon icon={faLinkedin} className="text-white" />
              </a>
              <a href="#" aria-label="GitHub" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors duration-200">
                <FontAwesomeIcon icon={faGithub} className="text-white" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400 mb-2">&copy; {new Date().getFullYear()} Code Monk. All rights reserved.</p>
          <p className="text-gray-500 text-sm">Transforming Beginners into Experts!</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
