import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
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
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="footer-brand"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.h3 
              className="text-2xl font-bold text-blue-400 mb-4"
              whileHover={{ scale: 1.05, color: "#60a5fa" }}
              transition={{ duration: 0.3 }}
            >
              Code Monk
            </motion.h3>
            <motion.p 
              className="text-gray-300 mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              Dept. Of MCA
            </motion.p>
            <motion.p 
              className="text-gray-400 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              NMAM Institute of Technology, Nitte, SH1, Karkala, Karnataka
            </motion.p>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="border-t border-gray-700 pt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.p 
            className="text-gray-400 mb-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            &copy; {new Date().getFullYear()} Code Monk. All rights reserved.
          </motion.p>
          <motion.p 
            className="text-gray-500 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            Transforming Beginners into Experts!
          </motion.p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
