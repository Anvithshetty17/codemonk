import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.8 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        type: "spring",
        stiffness: 80
      }
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          >
            Benefits
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            What you'll gain by joining Code Monk
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {benefitsData.map((benefit, index) => (
            <motion.div 
              key={index} 
              className="bg-gray-50 rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:bg-white"
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                backgroundColor: "#ffffff",
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: 1.1
                }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                >
                  <FontAwesomeIcon icon={benefit.icon} className="text-2xl text-blue-600" />
                </motion.div>
              </motion.div>
              <motion.h3 
                className="text-xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.6 }}
              >
                {benefit.title}
              </motion.h3>
              <motion.p 
                className="text-gray-600 leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.8 }}
              >
                {benefit.description}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Benefits;
