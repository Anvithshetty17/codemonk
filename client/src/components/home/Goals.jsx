import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Our Goals
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            What we aim to achieve with Code Monk
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {goalsData.map((goal, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ 
                  rotate: 360,
                  backgroundColor: "#dbeafe"
                }}
                transition={{ duration: 0.6 }}
              >
                <FontAwesomeIcon icon={goal.icon} className="text-2xl text-blue-600" />
              </motion.div>
              <motion.h3 
                className="text-xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.5 }}
              >
                {goal.title}
              </motion.h3>
              <motion.p 
                className="text-gray-600 leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.7 }}
              >
                {goal.description}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Goals;
