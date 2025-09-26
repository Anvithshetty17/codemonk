import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaDesktop, 
  FaDatabase, 
  FaServer, 
  FaGlobe, 
  FaPlay, 
  FaPause,
  FaStop,
  FaArrowLeft,
  FaSearch,
  FaNetworkWired,
  FaCode,
  FaStepForward,
  FaStepBackward
} from 'react-icons/fa';

const WebsiteWorkflow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const animationTimeout = useRef(null);

  const steps = [
    {
      id: 0,
      title: "User Types Website URL",
      description: "You type 'google.com' in your browser address bar and press Enter",
      example: "💭 'I want to visit Google!'",
      highlight: "browser",
      action: "User Input",
      details: "This is where it all begins! You decide to visit a website and type its name."
    },
    {
      id: 1,
      title: "Browser Checks Cache",
      description: "Your browser first checks if it has recently visited this website and saved the information locally",
      example: "🤔 'Do I already know where google.com is?'",
      highlight: "cache",
      action: "Cache Lookup",
      details: "Cache is like your browser's memory - it remembers websites you've visited recently to make them load faster."
    },
    {
      id: 2,
      title: "Browser Asks DNS Resolver",
      description: "If not in cache, browser contacts the DNS system to find the website's actual location",
      example: "❓ 'DNS, please tell me where google.com lives!'",
      highlight: "dns",
      action: "DNS Query",
      details: "DNS (Domain Name System) is like the internet's phone book - it converts website names to IP addresses."
    },
    {
      id: 3,
      title: "DNS Returns IP Address",
      description: "DNS system looks up and returns the exact IP address where the website is hosted",
      example: "✅ 'google.com is located at 172.217.14.110'",
      highlight: "dns",
      action: "IP Address Found",
      details: "Every website has a unique IP address (like a postal address) that computers use to find it."
    },
    {
      id: 4,
      title: "Browser Connects to Web Server",
      description: "Now knowing the exact address, your browser establishes a connection to the web server",
      example: "🔗 'Connecting to Google's server at 172.217.14.110'",
      highlight: "server",
      action: "HTTP Request",
      details: "This is like knocking on the door of Google's computer and saying 'Hello, I'd like to see your website!'"
    },
    {
      id: 5,
      title: "Server Sends Website Files",
      description: "The web server responds by sending all the files needed to display the webpage",
      example: "📦 'Here's the HTML, CSS, JavaScript, and images!'",
      highlight: "server",
      action: "Files Transfer",
      details: "The server sends multiple files: HTML (structure), CSS (styling), JavaScript (interactivity), and images."
    },
    {
      id: 6,
      title: "Browser Renders the Webpage",
      description: "Your browser assembles all the received files and displays the beautiful webpage",
      example: "🎨 'Ta-da! Here's the Google homepage!'",
      highlight: "website",
      action: "Page Display",
      details: "Your browser is like an artist - it takes all the pieces and paints the final picture you see on screen."
    }
  ];

  const startAnimation = () => {
    setIsPlaying(true);
    setIsPaused(false);
    if (currentStep === -1) {
      setCurrentStep(0);
    }
    continueAnimation();
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
    setIsPaused(true);
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
      animationTimeout.current = null;
    }
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep(-1);
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
      animationTimeout.current = null;
    }
  };

  const continueAnimation = () => {
    if (currentStep < steps.length - 1) {
      animationTimeout.current = setTimeout(() => {
        setCurrentStep(prev => {
          const nextStep = prev + 1;
          if (nextStep < steps.length - 1) {
            continueAnimation();
          } else {
            setIsPlaying(false);
            setIsPaused(false);
          }
          return nextStep;
        });
      }, 4000); // 4 seconds per step for better understanding
    }
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else if (currentStep === -1) {
      setCurrentStep(0);
    }
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
    if (isPlaying) {
      pauseAnimation();
    }
  };

  const getComponentIcon = (component) => {
    const icons = {
      browser: FaDesktop,
      cache: FaDatabase,
      dns: FaSearch,
      server: FaServer,
      website: FaGlobe
    };
    return icons[component] || FaDesktop;
  };

  const ComponentBox = ({ type, isActive, position }) => {
    const Icon = getComponentIcon(type);
    const labels = {
      browser: "Your Browser",
      cache: "Browser Cache",
      dns: "DNS System",
      server: "Web Server",
      website: "Final Website"
    };

    const colors = {
      browser: "from-blue-500 to-blue-600",
      cache: "from-yellow-500 to-orange-500", 
      dns: "from-purple-500 to-purple-600",
      server: "from-green-500 to-green-600",
      website: "from-pink-500 to-pink-600"
    };

    const descriptions = {
      browser: "Where you type URLs",
      cache: "Temporary storage",
      dns: "Internet phone book",
      server: "Hosts the website",
      website: "What you see"
    };

    return (
      <motion.div
        className={`relative flex flex-col items-center p-6 rounded-2xl shadow-lg transition-all duration-700 cursor-pointer ${
          isActive 
            ? `bg-gradient-to-br ${colors[type]} text-white scale-110 shadow-2xl z-10` 
            : 'bg-white text-gray-600 scale-100 shadow-md hover:shadow-lg hover:scale-105'
        }`}
        style={position}
        animate={{
          scale: isActive ? 1.1 : 1,
          y: isActive ? -5 : 0
        }}
        transition={{ duration: 0.7, type: "spring", stiffness: 200 }}
        whileHover={{ scale: isActive ? 1.1 : 1.05, y: -2 }}
      >
        {/* Animated background pulse when active */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent"
            animate={{ 
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.02, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        {/* Icon with rotation animation */}
        <motion.div
          className={`w-16 h-16 rounded-full mb-3 flex items-center justify-center ${
            isActive ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-100'
          }`}
          animate={{
            rotate: isActive ? [0, 360] : 0,
            scale: isActive ? [1, 1.1, 1] : 1
          }}
          transition={{ 
            rotate: { duration: isActive ? 2 : 0, repeat: isActive ? Infinity : 0, ease: "linear" },
            scale: { duration: 1, repeat: isActive ? Infinity : 0, repeatType: "reverse" }
          }}
        >
          <Icon className={`text-2xl ${isActive ? 'text-white' : 'text-gray-600'}`} />
        </motion.div>
        
        {/* Title */}
        <h3 className={`text-sm font-bold text-center leading-tight mb-1 ${
          isActive ? 'text-white' : 'text-gray-800'
        }`}>
          {labels[type]}
        </h3>
        
        {/* Subtitle */}
        <p className={`text-xs text-center ${
          isActive ? 'text-white/90' : 'text-gray-500'
        }`}>
          {descriptions[type]}
        </p>

        {/* Activity indicator */}
        {isActive && (
          <motion.div
            className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </motion.div>
        )}
      </motion.div>
    );
  };

  const FlowArrow = ({ isVisible, delay = 0 }) => (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="flex items-center justify-center mx-4"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.8, delay, type: "spring", stiffness: 200 }}
        >
          <motion.div
            className="flex items-center"
            animate={{ 
              x: [0, 8, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.div 
              className="w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              animate={{ 
                scaleX: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div 
              className="w-0 h-0 border-l-4 border-r-0 border-t-2 border-b-2 border-l-purple-500 border-t-transparent border-b-transparent ml-1"
              animate={{ 
                scale: [1, 1.3, 1],
                x: [0, 3, 0]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <button
            onClick={() => navigate('/resources')}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
          >
            <FaArrowLeft className="text-sm" />
            Back to Resources
          </button>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Interactive Website Workflow
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Learn how websites load with full control - play, pause, and explore at your own pace
          </p>
        </motion.div>

        {/* Control Panel */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <button
              onClick={startAnimation}
              disabled={isPlaying}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlay className="text-sm" />
              {currentStep === -1 ? 'Start' : 'Resume'}
            </button>
            
            <button
              onClick={pauseAnimation}
              disabled={!isPlaying}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPause className="text-sm" />
              Pause
            </button>
            
            <button
              onClick={stopAnimation}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 hover:shadow-lg transition-all"
            >
              <FaStop className="text-sm" />
              Reset
            </button>
            
            <div className="h-8 w-px bg-gray-300"></div>
            
            <button
              onClick={goToPrevStep}
              disabled={currentStep <= 0}
              className="bg-gray-600 text-white px-4 py-3 rounded-full font-semibold inline-flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaStepBackward className="text-sm" />
            </button>
            
            <button
              onClick={goToNextStep}
              disabled={currentStep >= steps.length - 1}
              className="bg-gray-600 text-white px-4 py-3 rounded-full font-semibold inline-flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaStepForward className="text-sm" />
            </button>
          </div>
          
          {/* Step indicator dots */}
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 scale-125' 
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                title={`Go to step ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>

        {/* Main Content - Side by Side Layout */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Visual Flow - Left Side */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-800">Visual Workflow</h3>
            <div className="flex flex-col items-center gap-6">
              <ComponentBox 
                type="browser" 
                isActive={currentStep >= 0 && (steps[currentStep]?.highlight === 'browser')} 
                position={{}}
              />
              <FlowArrow isVisible={currentStep >= 1} delay={0.3} />
              
              <ComponentBox 
                type="cache" 
                isActive={currentStep >= 1 && (steps[currentStep]?.highlight === 'cache')} 
                position={{}}
              />
              <FlowArrow isVisible={currentStep >= 2} delay={0.6} />
              
              <ComponentBox 
                type="dns" 
                isActive={currentStep >= 2 && (steps[currentStep]?.highlight === 'dns')} 
                position={{}}
              />
              <FlowArrow isVisible={currentStep >= 4} delay={0.9} />
              
              <ComponentBox 
                type="server" 
                isActive={currentStep >= 4 && (steps[currentStep]?.highlight === 'server')} 
                position={{}}
              />
              <FlowArrow isVisible={currentStep >= 6} delay={1.2} />
              
              <ComponentBox 
                type="website" 
                isActive={currentStep >= 6 && (steps[currentStep]?.highlight === 'website')} 
                position={{}}
              />
            </div>
          </div>

          {/* Step Information - Right Side */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-center mb-6 text-gray-800">Step Details</h3>
            <div className="h-full flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {currentStep >= 0 ? (
                  <motion.div
                    key={currentStep}
                    className="text-center"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Step number with animation */}
                    <motion.div 
                      className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xl font-bold mb-4"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 3, -3, 0]
                      }}
                      transition={{ 
                        scale: { duration: 2, repeat: Infinity },
                        rotate: { duration: 3, repeat: Infinity }
                      }}
                    >
                      {currentStep + 1}
                    </motion.div>
                    
                    {/* Action badge */}
                    <motion.div
                      className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {steps[currentStep]?.action}
                    </motion.div>
                    
                    <motion.h2 
                      className="text-2xl font-bold text-gray-800 mb-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {steps[currentStep]?.title}
                    </motion.h2>
                    
                    <motion.p 
                      className="text-base text-gray-600 mb-4 leading-relaxed"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {steps[currentStep]?.description}
                    </motion.p>
                    
                    {/* Example speech bubble */}
                    <motion.div 
                      className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    >
                      <div className="text-blue-800 font-medium text-base mb-2">
                        {steps[currentStep]?.example}
                      </div>
                      <div className="text-blue-600 text-sm">
                        {steps[currentStep]?.details}
                      </div>
                    </motion.div>
                    
                    {/* Mini Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">
                        Step {currentStep + 1} of {steps.length}
                      </p>
                      <p className="text-xs text-gray-400">
                        {isPlaying ? '▶️ Auto-playing' : isPaused ? '⏸️ Paused' : '⏹️ Stopped'}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity }
                      }}
                    >
                      <FaGlobe className="text-white text-2xl" />
                    </motion.div>
                    
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      🚀 Ready to Start?
                    </h2>
                    
                    <p className="text-base text-gray-600 mb-6 leading-relaxed">
                      Use the controls above to start your interactive learning journey!
                    </p>
                    
                    <div className="bg-gradient-to-r from-green-50 to-yellow-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 font-semibold text-sm">
                        💡 You can play, pause, skip steps, or navigate manually using the controls above!
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteWorkflow;