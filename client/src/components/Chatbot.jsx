import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRobot, 
  FaPaperPlane, 
  FaTimes, 
  FaComment,
  FaUser,
  FaSpinner,
  FaTrash
} from 'react-icons/fa';

// Import club content for context-aware responses
import cheatsheets from '../data/cheatsheets.json';
import linkMaterials from '../data/linkmaterials.json';
import GeminiResponse from './GeminiResponse';

const Chatbot = () => {
  // Load messages from localStorage on component mount
  const loadMessages = () => {
    try {
      const saved = localStorage.getItem('codemonk-chat-messages');
      if (saved) {
        const parsedMessages = JSON.parse(saved);
        return parsedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading messages from localStorage:', error);
    }
    
    // Return default message if no saved messages
    return [
      {
        id: 1,
        text: "Hi! I'm your CodeMonk Assistant. I can help you with any questions - from general programming concepts to specific CodeMonk resources and club information. What would you like to know?",
        sender: 'bot',
        timestamp: new Date()
      }
    ];
  };

  // Save messages to localStorage
  const saveMessages = (messagesToSave) => {
    try {
      localStorage.setItem('codemonk-chat-messages', JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  };

  // Clear chat history
  const clearChatHistory = () => {
    const defaultMessages = [
      {
        id: Date.now(),
        text: "Hi! I'm your CodeMonk Assistant. I can help you with any questions - from general programming concepts to specific CodeMonk resources and club information. What would you like to know?",
        sender: 'bot',
        timestamp: new Date()
      }
    ];
    setMessages(defaultMessages);
    saveMessages(defaultMessages);
  };

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(loadMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Dynamic loading messages for better user experience
  const loadingMessages = [
    "🤔 Thinking deeply...",
    "🧠 Processing your question...", 
    "💡 Analyzing the best answer...",
    "🔍 Searching knowledge base...",
    
    "🎯 Finding relevant experts...",
    "📚 Consulting resources...",
    "✨ Almost ready with answer...",
    "🚀 Finalizing response...",
    "💭 Deep learning in progress..."
  ];

  // Cycle through loading messages
  useEffect(() => {
    let interval;
    if (isLoading) {
      let messageIndex = 0;
      setLoadingMessage(loadingMessages[0]);
      
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 1500); // Change message every 1.5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Save messages whenever they change
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Knowledge base for CodeMonk-related queries
  const clubKnowledge = {
    about: "CodeMonk is the MCA coding club at NMAM Institute of Technology. We transform beginners into experts through comprehensive programming education, team collaboration, and hands-on learning experiences.",
    features: [
      "Study materials with cheatsheets and educational links",
      "Team management and member profiles", 
      "Club announcements and updates",
      "Interview preparation resources",
      "DSA practice materials",
      "Web development tutorials"
    ],
    resources: {
      cheatsheets: cheatsheets.map(item => ({
        title: item.title,
        category: item.category,
        description: item.description
      })),
      links: linkMaterials.map(item => ({
        title: item.title,
        category: item.category,
        description: item.description,
        tags: item.tags
      }))
    },
    mission: "Our mission is to create a collaborative learning environment where students can enhance their coding skills, prepare for technical interviews, and build real-world projects together."
  };

  // NMAMIT Institute Information Database
  const nmamitKnowledge = {
    about: "NMAM Institute of Technology (NMAMIT) is a premier engineering institution located in Nitte, Karnataka, India. Established in 1986, it is affiliated with Visvesvaraya Technological University (VTU) and is part of the Nitte Education Trust.",
    location: {
      address: "Nitte, Karkala Taluk, Udupi District, Karnataka 574110",
      city: "Udupi",
      state: "Karnataka",
      country: "India"
    },
    establishment: {
      year: 1986,
      affiliation: "Visvesvaraya Technological University (VTU)",
      trust: "Nitte Education Trust",
      type: "Private Engineering College"
    },
    accreditation: {
      naac: "A+ Grade",
      nba: "NBA Accredited",
      aicte: "AICTE Approved"
    },
    departments: [
      "Computer Science & Engineering",
      "Information Science & Engineering", 
      "Electronics & Communication Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Master of Computer Applications (MCA)",
      "Master of Business Administration (MBA)"
    ],
    mcaProgram: {
      duration: "2 Years (4 Semesters)",
      eligibility: "Bachelor's degree with Mathematics/Statistics/Computer Science",
      specializations: [
        "Software Development",
        "Web Technologies", 
        "Mobile Application Development",
        "Data Science & Analytics",
        "Cloud Computing",
        "Cybersecurity"
      ],
      curriculum: [
        "Programming Languages (Java, Python, C++)",
        "Database Management Systems",
        "Data Structures & Algorithms",
        "Software Engineering",
        "Web Technologies",
        "Mobile Computing",
        "Machine Learning",
        "Project Management"
      ],
      facilities: [
        "State-of-the-art Computer Labs",
        "High-speed Internet Connectivity",
        "Latest Software Tools",
        "Industry-standard Development Environment",
        "Digital Library Access",
        "Research Facilities"
      ]
    },
    highlights: [
      "35+ years of educational excellence",
      "Strong industry connections and placements",
      "Modern infrastructure and facilities",
      "Experienced and qualified faculty",
      "Active student clubs and technical societies",
      "Regular workshops and seminars",
      "Industry partnerships and collaborations"
    ],
    placements: {
      companies: [
        "TCS", "Infosys", "Wipro", "Accenture", "Cognizant",
        "Microsoft", "Amazon", "Google", "IBM", "Oracle"
      ],
      averagePackage: "4-6 LPA",
      highestPackage: "15+ LPA"
    }
  };

  // SAMCA (Student Association of MCA) Information Database
  const samcaKnowledge = {
    about: "SAMCA (Student Association of MCA) is the official student association for the Master of Computer Applications department at NMAM Institute of Technology. It serves as a bridge between MCA students, faculty, and the administration.",
    fullForm: "Student Association of MCA",
    establishment: "Established to promote academic excellence and student welfare in the MCA department",
    objectives: [
      "Foster academic excellence among MCA students",
      "Organize technical and cultural events",
      "Facilitate industry interaction and placements",
      "Promote student welfare and development",
      "Bridge communication between students and faculty",
      "Encourage research and innovation",
      "Build strong alumni network"
    ],
    activities: {
      technical: [
        "Coding competitions and hackathons",
        "Technical workshops and seminars", 
        "Industry expert talks",
        "Project exhibitions",
        "Research paper presentations",
        "Technology awareness programs",
        "Certification courses"
      ],
      cultural: [
        "Annual cultural fest",
        "Talent competitions",
        "Literary events",
        "Sports tournaments",
        "Celebration of festivals",
        "Art and craft exhibitions",
        "Music and dance competitions"
      ],
      academic: [
        "Study groups and peer learning",
        "Academic mentoring programs",
        "Exam preparation sessions",
        "Guest lectures",
        "Industrial visits",
        "Internship facilitation",
        "Career guidance sessions"
      ]
    },
    benefits: [
      "Enhanced learning opportunities",
      "Skill development programs",
      "Networking with industry professionals",
      "Leadership development",
      "Participation in inter-college events",
      "Access to resources and facilities",
      "Career guidance and placement support"
    ],
    structure: {
      governance: "Student-led with faculty guidance",
      membership: "All MCA students are automatic members",
      leadership: "Elected student representatives",
      president: "Kiran - SAMCA President",
      committees: [
        "Academic Committee",
        "Cultural Committee", 
        "Technical Committee",
        "Sports Committee",
        "Placement Committee"
      ]
    },
    collaborations: [
      "Industry partnerships for internships",
      "Alumni network engagement",
      "Inter-departmental activities",
      "Collaboration with other student associations",
      "Partnership with CodeMonk coding club"
    ],
    achievements: [
      "Successful organization of technical symposiums",
      "High participation in inter-college competitions",
      "Strong placement record",
      "Active alumni engagement",
      "Recognition in academic and cultural events"
    ]
  };

  // Team member database for specific lookups
  const teamMembers = {
    'anvith shetty': {
      name: 'Anvith Shetty',
      role: 'Full Stack Developer & SEO Specialist',
      skills: ['Full Stack Web Development', 'SEO', 'Domain Management', 'Hosting', 'Java', 'JavaScript'],
      description: 'Expert in full stack web development with extensive knowledge in SEO, domain management, and hosting solutions. Proficient in Java and JavaScript development.'
    },
    'anup nayak': {
      name: 'Anup Nayak', 
      role: 'Full Stack Developer',
      skills: ['Full Stack Web Development', 'Java', 'JavaScript'],
      description: 'Experienced full stack developer with strong expertise in Java and JavaScript technologies.'
    },
    'apoorva': {
      name: 'Apoorva',
      role: 'Data Scientist',
      skills: ['Data Science', 'Database Management', 'Data Analytics', 'Research', 'Python'],
      description: 'Specialized in data science, database management, and research. Expert in Python for data analytics and research paper development.'
    },
    'harshith p': {
      name: 'Harshith P',
      role: 'Coder & Web Developer',
      skills: ['Coding', 'Web Development', 'Problem Solving'],
      description: 'Skilled coder and web developer with expertise in solving complex coding problems and building web applications.'
    },
    'maneesh kumar': {
      name: 'Maneesh Kumar',
      role: 'Full Stack Developer',
      skills: ['Full Stack Development', 'Web Technologies'],
      description: 'Full stack developer with comprehensive knowledge of web technologies and modern development frameworks.'
    },
    'namratha': {
      name: 'Namratha',
      role: 'Logic & Full Stack Developer',
      skills: ['Logical Problem Solving', 'Full Stack Development'],
      description: 'Expert in logical problem solving and full stack development with strong analytical thinking skills.'
    },
    'prajwal': {
      name: 'Prajwal',
      role: 'DSA & Competitive Programming Expert',
      skills: ['Data Structures & Algorithms', 'LeetCode', 'Competitive Programming', 'Coding'],
      description: 'Best in DSA and competitive programming. Expert in LeetCode problems and all types of coding challenges.'
    },
    'santhoji v': {
      name: 'Santhoji V',
      role: 'Web Developer & Content Creator',
      skills: ['Web Development', 'Video Editing', 'Content Creation'],
      description: 'Web developer with additional skills in video editing and content creation for digital platforms.'
    },
    'sohan shiri': {
      name: 'Sohan Shiri',
      role: 'Frontend Developer & Streamer',
      skills: ['Frontend Development', 'Streaming', 'Communication'],
      description: 'Frontend developer and content streamer with excellent communication skills and public speaking abilities.'
    },
    'vaishnavi kini': {
      name: 'Vaishnavi Kini',
      role: 'Web Developer & Motivational Speaker',
      skills: ['Web Development', 'Communication', 'Motivation', 'Women Empowerment', 'Stage Confidence'],
      description: 'Web developer with exceptional communication skills. Best at motivation, supporting and encouraging women, and helping overcome stage fear.'
    },
    'vidyashree': {
      name: 'Vidyashree',
      role: 'Coder & Web Developer',
      skills: ['Coding', 'Web Development'],
      description: 'Skilled coder and web developer with strong programming fundamentals and web development expertise.'
    },
    'yunith': {
      name: 'Yunith',
      role: 'IoT Developer & Coder',
      skills: ['IoT Development', 'Coding', 'Hardware Programming'],
      description: 'Best in IoT development with expertise in hardware programming and embedded systems.'
    },
    'kiran': {
      name: 'Kiran',
      role: 'SAMCA President & Student Leader',
      skills: ['Leadership', 'Student Administration', 'Event Management', 'Communication', 'Team Coordination'],
      description: 'President of SAMCA (Student Association of MCA) at NMAMIT. Excellent leadership skills with expertise in student administration, event management, and fostering collaboration between students and faculty.'
    }
  };

  // Function to suggest relevant seniors based on question topic (multiple if applicable)
  const suggestRelevantSeniors = (userQuestion) => {
    const question = userQuestion.toLowerCase();
    
    // Define topic mappings to seniors (now arrays for multiple experts)
    const topicMappings = {
      // DSA and Competitive Programming
      'dsa': ['prajwal'],
      'data structures': ['prajwal'], 
      'algorithms': ['prajwal'],
      'leetcode': ['prajwal'],
      'competitive programming': ['prajwal'],
      'coding problems': ['prajwal', 'harshith p'],
      'array': ['prajwal'],
      'linked list': ['prajwal'],
      'tree': ['prajwal'],
      'graph': ['prajwal'],
      
      // Data Science and Analytics
      'data science': ['apoorva'],
      'data analytics': ['apoorva'],
      'python': ['apoorva'],
      'database': ['apoorva'],
      'research': ['apoorva'],
      'machine learning': ['apoorva'],
      'statistics': ['apoorva'],
      
      // IoT and Hardware
      'iot': ['yunith'],
      'internet of things': ['yunith'],
      'hardware': ['yunith'],
      'embedded': ['yunith'],
      'sensors': ['yunith'],
      'arduino': ['yunith'],
      'raspberry pi': ['yunith'],
      
      // SEO and Domain Management
      'seo': ['anvith shetty'],
      'domain': ['anvith shetty'],
      'hosting': ['anvith shetty'],
      'website optimization': ['anvith shetty'],
      'google ranking': ['anvith shetty'],
      'codemonk': ['anvith shetty','anup nayak'],

      
      // Frontend and UI/UX
      'frontend': ['anvith shetty', 'anup nayak'],
      'react': ['anvith shetty', 'anup nayak', 'harshith p'],
      'css': ['anvith shetty', 'anup nayak'],
      'html': ['anvith shetty', 'anup nayak'],
      'ui': ['anvith shetty', 'anup nayak'],
      'ux': ['anvith shetty', 'anup nayak'],
      
      // Content Creation and Video
      'video editing': ['santhoji v'],
      'content creation': ['santhoji v'],
      'youtube': ['santhoji v'],
      'video': ['santhoji v'],
      
      // Streaming and Entertainment
      'streaming': ['sohan shiri'],
      'stream': ['sohan shiri'],
      'entertainment': ['sohan shiri'],
      'fun activities': ['sohan shiri'],
      'engagement': ['sohan shiri'],
      
      // Communication and Motivation (Vaishnavi Kini is the best)
      'communication': ['vaishnavi kini'],
      'english improvement': ['vaishnavi kini'],
      'english speaking': ['vaishnavi kini'],
      'mc': ['vaishnavi kini'],
      'master of ceremony': ['vaishnavi kini'],
      'stage fear': ['vaishnavi kini'],
      'stage confidence': ['vaishnavi kini'],
      'public speaking': ['vaishnavi kini'],
      'presentation skills': ['vaishnavi kini'],
      'motivation': ['vaishnavi kini'],
      'confidence': ['vaishnavi kini'],
      'presentation': ['vaishnavi kini'],
      'women': ['vaishnavi kini'],
      'women empowerment': ['vaishnavi kini'],
      'speaking skills': ['vaishnavi kini'],
      'communication skills': ['vaishnavi kini'],
      
      // Leadership and Student Administration (Kiran - SAMCA President)
      'leadership': ['kiran'],
      'student administration': ['kiran'],
      'event management': ['kiran'],
      'samca': ['kiran'],
      'student association': ['kiran'],
      'president': ['kiran'],
      'student leader': ['kiran'],
      'team coordination': ['kiran'],
      'student activities': ['kiran'],
      'student welfare': ['kiran'],
      
      // Logical Problems
      'logic': ['namratha'],
      'logical thinking': ['namratha'], 
      'problem solving': ['namratha', 'harshith p'],
      
      // Web Development (multiple experts)
      'web development': ['anvith shetty', 'anup nayak', 'maneesh kumar', 'harshith p', 'namratha', 'santhoji v', 'vaishnavi kini', 'vidyashree'],
      'javascript': ['anvith shetty', 'anup nayak','harshith p'],
      'java': ['anvith shetty', 'anup nayak'],
      'full stack': ['anvith shetty', 'anup nayak', 'maneesh kumar', 'namratha','harshith p']
    };
    
    // Find all matching seniors for the topic
    const relevantSeniors = [];
    for (const [topic, seniors] of Object.entries(topicMappings)) {
      if (question.includes(topic)) {
        seniors.forEach(senior => {
          if (!relevantSeniors.includes(senior) && teamMembers[senior]) {
            relevantSeniors.push(teamMembers[senior]);
          }
        });
      }
    }
    
    // If specific matches found, return them
    if (relevantSeniors.length > 0) {
      return relevantSeniors;
    }
    
    // Default suggestion for general coding questions
    if (question.includes('code') || question.includes('programming')) {
      return [teamMembers['prajwal']]; // Best for general coding
    }
    
    // Default to Anvith Shetty and Anup Nayak if no specific match found
    return [teamMembers['anvith shetty'], teamMembers['anup nayak']];
  };  // Function to detect and lookup team members
  // Function to detect and lookup team members
  const detectTeamMember = (text) => {
    const lowerText = text.toLowerCase();
    console.log('Checking for team member in:', lowerText);
    
    for (const [key, member] of Object.entries(teamMembers)) {
      if (lowerText.includes(key)) {
        console.log('Found team member:', member.name);
        
        // Special fun response for Kiran
        if (key === 'kiran') {
          return `🎖️ **Meet Our Beloved SAMCA President - Namma Kiran Anna!** 👑

**🌟 Kiran Anna - The Man, The Myth, The Legend!** 

Our amazing SAMCA President who leads with style and charm! 😎

**📧 Contact Information:**
📱 **Instagram:** @kiran_killur 
📞 **Call or DM him** - He's always ready to help students!

**👨‍💼 About Kiran Anna:**
• 🎓 **Role:** SAMCA President & Student Leader Extraordinaire  
• 🔥 **Personality:** Fun, approachable, and super friendly
• 💪 **Leadership Style:** Leads by example with a smile
• 🎯 **Mission:** Making student life awesome at NMAMIT MCA

**💕 Fun Fact Alert!** 
🔔 **Status Update:** He's still single and ready to mingle! 😉💕
*(Ladies, there's your chance! Slide into those DMs! 😂)*

**🎭 What Makes Kiran Anna Special:**
• Always available for student guidance 🤝
• Great sense of humor (as you can see! 😄)
• Excellent event organizer 🎉
• Master of student coordination 📋
• Instagram worthy personality 📸

**📱 Want to Connect?**
Just call him or drop a DM on Instagram **@kiran_killur** - he's super responsive and loves helping fellow students!

**🚀 Pro Tip:** Whether it's SAMCA related queries, student issues, or you just want to say hi - Kiran Anna is your go-to person! 

*Disclaimer: No guarantee on the "ready to mingle" status - it might change faster than JavaScript frameworks! 😂*

💡 **Kiran Anna represents the spirit of SAMCA - helpful, fun, and always there for students!** 🌟`;
        }
        
        // Standard response for other team members
        return `**${member.name}** - ${member.role}

${member.description}

**Skills:** ${member.skills.join(', ')}

Want to know more about our team? Visit our team page on the CodeMonk platform!`;
      }
    }
    console.log('No team member found');
    return null;
  };

  // Function to handle personality and identity questions
  const handlePersonalityQuestions = (text) => {
    const lowerText = text.toLowerCase();
    
    // Identity questions
    if (lowerText.includes('who are you') || lowerText.includes('what are you') || lowerText.includes('your name')) {
      return `Hi! I'm **CodeMonk Assistant**, your friendly AI companion for all things programming and CodeMonk related! 🤖

I'm here to help you with:
• Programming questions and coding challenges
• CodeMonk club information and resources  
• Team member details and expertise areas
• Study materials and learning guidance
• Technical interview preparation

Feel free to ask me anything! 😊`;
    }
    
    // Creator questions
    if (lowerText.includes('who created you') || lowerText.includes('who made you') || lowerText.includes('who built you') || lowerText.includes('who developed you')) {
      return `I was created by the talented team at CodeMonk! 👨‍💻👩‍💻

**My Creators:**
• **Anvith Shetty** - Full Stack Developer & SEO Specialist
• **Anup Nayak** - Full Stack Developer  
• **Apoorva** - Data Scientist

They built me to help students like you with programming questions, provide CodeMonk club information, and connect you with the right experts for personalized learning support.

Thanks to their hard work, I'm here to make your coding journey easier! 🚀`;
    }
    
    // Purpose questions
    if (lowerText.includes('what is your purpose') || lowerText.includes('why were you created') || lowerText.includes('what do you do')) {
      return `My purpose is to be your **ultimate coding companion**! 🎯

**What I do:**
• Answer programming and technical questions
• Provide CodeMonk club information and resources
• Help you find the right team members for specific topics
• Offer study materials and learning guidance
• Support your coding journey with expert recommendations

I'm designed to make learning programming more accessible and connect you with the amazing CodeMonk community. Whether you're a beginner or advancing your skills, I'm here to help! 💪`;
    }
    
    // About CodeMonk questions
    if (lowerText.includes('tell me about codemonk') || lowerText.includes('what is codemonk')) {
      return `**CodeMonk** is an amazing MCA coding club at NMAM Institute of Technology! 🏫

**Our Mission:** Transform beginners into experts through comprehensive programming education and collaboration.

**What we offer:**
• Expert mentorship from experienced developers
• Study materials and cheatsheets
• Interview preparation resources
• Team collaboration and real-world projects
• Supportive learning community

**Our Team:** We have incredible experts in various fields - DSA wizard Prajwal, communication expert Vaishnavi Kini, full-stack developers Anvith Shetty, Anup Nayak, Maneesh Kumar, Namratha, and Harshith P, data scientist Apoorva, IoT expert Yunith, web developer & content creator Santhoji V, frontend developer Sohan Shiri, and web developer Vidyashree.

**Faculty Support:**
Under the expert guidance of **PREMITHA KAMATH** ma'am (Placement Guide & CodeMonk Guide Lecturer), **ANANTHA MURTHY** sir (Placement Coordinator), and **Dr. MAMATHA BALIPA** ma'am (HOD).

We're here to help you succeed in your programming journey! 🌟`;
    }
    
    return null; // No personality match found
  };

  // Function to handle any mention of CodeMonk in user messages
  const detectCodeMonkMention = (text) => {
    const lowerText = text.toLowerCase();
    
    // Check if "codemonk" or "code monk" is mentioned anywhere in the message
    if (lowerText.includes('codemonk') || lowerText.includes('code monk')) {
      return `🎯 **CodeMonk - Transforming Beginners into Experts!** 🚀

**About CodeMonk:**
CodeMonk is the premier MCA coding club at NMAM Institute of Technology, dedicated to creating a vibrant learning community for aspiring developers.

**What makes us special:**
• 🧠 **Expert Team:** 12 talented members with diverse specializations
• 📚 **Comprehensive Learning:** From DSA to web development, IoT to data science
• 🤝 **Collaborative Environment:** Real-world projects and team collaboration
• 📈 **Career Growth:** Interview preparation and skill development
• 🌟 **Supportive Community:** Mentorship and peer learning

**Our Amazing Team:**
• **Prajwal** - DSA & Competitive Programming Expert
• **Vaishnavi Kini** - Communication & Motivational Expert
• **Anvith Shetty** - Full Stack Developer & SEO Specialist
• **Anup Nayak** - Full Stack Developer
• **Apoorva** - Data Scientist & Research Expert
• **Yunith** - IoT & Hardware Programming Specialist
• **Santhoji V** - Web Developer & Content Creator
• **Sohan Shiri** - Frontend Developer & Streamer
• **Maneesh Kumar** - Full Stack Developer
• **Namratha** - Logic & Full Stack Developer
• **Harshith P** - Coder & Problem Solver
• **Vidyashree** - Web Developer & Coder

**Faculty Support & Guidance:**
• **Dr. MAMATHA BALIPA** ma'am - Head of Department (HOD)
• **PREMITHA KAMATH** ma'am - Placement Guide & CodeMonk Guide Lecturer
• **ANANTHA MURTHY** sir - Placement Coordinator


💡 **Ready to start your coding journey with us? Ask me anything about programming, our team members, or how CodeMonk can help you grow!**`;
    }
    
    return null; // No CodeMonk mention found
  };

  // Function to handle NMAMIT-related queries
  const detectNMAMITMention = (text) => {
    const lowerText = text.toLowerCase();
    
    // Check for NMAMIT mentions
    if (lowerText.includes('nmamit') || lowerText.includes('nmam institute') || lowerText.includes('nitte') || 
        (lowerText.includes('nmam') && lowerText.includes('mca'))) {
      
      // Specific MCA program queries
      if (lowerText.includes('mca') || lowerText.includes('master of computer applications')) {
        return `🎓 **NMAMIT MCA Program - Excellence in Computer Applications** 💻

**About NMAMIT MCA:**
The Master of Computer Applications (MCA) program at NMAM Institute of Technology is designed to create industry-ready software professionals with strong technical and analytical skills.

**Program Details:**
• **Duration:** 2 Years (4 Semesters)
• **Affiliation:** Visvesvaraya Technological University (VTU)
• **Accreditation:** NBA Accredited, NAAC A+ Grade

**Curriculum Highlights:**
• Programming Languages (Java, Python, C++)
• Data Structures & Algorithms
• Database Management Systems
• Web Technologies & Mobile Computing
• Software Engineering & Project Management
• Machine Learning & Data Science
• Cloud Computing & Cybersecurity

**Specializations Available:**
• Software Development
• Web Technologies
• Mobile Application Development
• Data Science & Analytics
• Cloud Computing
• Cybersecurity

**Facilities:**
• State-of-the-art Computer Labs
• High-speed Internet & Latest Software Tools
• Digital Library Access
• Research Facilities
• Industry-standard Development Environment

**Placement Highlights:**
• Top recruiters: TCS, Infosys, Wipro, Accenture, Cognizant
• Average Package: 4-6 LPA
• Highest Package: 15+ LPA

**Faculty Support:**
• **Dr. MAMATHA BALIPA** ma'am - HOD
• **PREMITHA KAMATH** ma'am - Placement Guide & CodeMonk Guide
• **ANANTHA MURTHY** sir - Placement Coordinator

💡 **Ready to join NMAMIT MCA? It's where CodeMonk was born and thrives!**`;
      }
      
      // General NMAMIT queries
      return `🏛️ **NMAM Institute of Technology (NMAMIT) - 35+ Years of Excellence** 🌟

**About NMAMIT:**
Established in 1986, NMAMIT is a premier engineering institution located in the scenic town of Nitte, Karnataka. Part of the prestigious Nitte Education Trust.

**Key Information:**
• **Location:** Nitte, Karkala Taluk, Udupi District, Karnataka
• **Establishment:** 1986
• **Affiliation:** Visvesvaraya Technological University (VTU)
• **Accreditation:** NAAC A+ Grade, NBA Accredited, AICTE Approved

**Departments & Programs:**
• Computer Science & Engineering
• Information Science & Engineering
• Electronics & Communication Engineering
• Mechanical Engineering
• Civil Engineering
• **Master of Computer Applications (MCA)** 🎯
• Master of Business Administration (MBA)

**Why Choose NMAMIT:**
• 35+ years of educational excellence
• Modern infrastructure & state-of-the-art facilities
• Experienced and qualified faculty
• Strong industry connections
• Active student clubs like **CodeMonk** 🚀
• Regular workshops, seminars & industry partnerships
• Excellent placement record

**Notable Features:**
• Beautiful campus in Nitte
• Strong alumni network
• Research opportunities
• Industry collaborations
• Student-friendly environment

**Home to CodeMonk:** 🤖
NMAMIT is proud to host CodeMonk, the premier MCA coding club that transforms beginners into experts!

💡 **Want to know more about specific programs or admissions? Just ask!**`;
    }
    
    return null; // No NMAMIT mention found
  };

  // Function to handle SAMCA-related queries
  const detectSAMCAMention = (text) => {
    const lowerText = text.toLowerCase();
    
    // Check for SAMCA mentions
    if (lowerText.includes('samca') || lowerText.includes('student association of mca') || 
        lowerText.includes('student association mca') || 
        (lowerText.includes('student') && lowerText.includes('association') && lowerText.includes('mca'))) {
      
      return `🎓 **SAMCA - Student Association of MCA, NMAMIT** 🌟

**About SAMCA:**
SAMCA (Student Association of MCA) is the official student association for the Master of Computer Applications department at NMAM Institute of Technology. It serves as a dynamic bridge between MCA students, faculty, and administration.

**Our Mission:**
To foster academic excellence, promote student welfare, and create a vibrant learning community for MCA students.

**Key Objectives:**
• Foster academic excellence among MCA students
• Organize technical and cultural events
• Facilitate industry interaction and placements
• Promote student welfare and development
• Bridge communication between students and faculty
• Encourage research and innovation
• Build strong alumni network

**Activities & Events:**

**🔧 Technical Activities:**
• Coding competitions and hackathons
• Technical workshops and seminars
• Industry expert talks and guest lectures
• Project exhibitions and research presentations
• Technology awareness programs
• Certification courses and skill development

**🎭 Cultural Activities:**
• Annual cultural fest and talent competitions
• Literary events and creative competitions
• Sports tournaments and team building
• Festival celebrations and cultural programs
• Art exhibitions and creative showcases

**📚 Academic Support:**
• Study groups and peer learning sessions
• Academic mentoring programs
• Exam preparation and guidance
• Industrial visits and field trips
• Internship facilitation
• Career guidance and placement support

**Benefits of SAMCA Membership:**
• Enhanced learning opportunities
• Skill development programs
• Networking with industry professionals
• Leadership development opportunities
• Participation in inter-college events
• Access to exclusive resources and facilities
• Career guidance and placement support

**Organization Structure:**
• **Governance:** Student-led with faculty guidance
• **President:** **Kiran** - SAMCA President 👑
• **Membership:** All MCA students are automatic members
• **Leadership:** Elected student representatives
• **Committees:** Academic, Cultural, Technical, Sports, Placement

**Key Collaborations:**
• Industry partnerships for internships
• Active alumni network engagement
• Inter-departmental activities
• Partnership with **CodeMonk** coding club 🤝
• Collaboration with other student associations

**Notable Achievements:**
• Successful organization of technical symposiums
• High participation in inter-college competitions
• Strong placement record and industry connections
• Active alumni engagement and networking
• Recognition in academic and cultural events

**Faculty Support:**
Under the guidance of the MCA department faculty including:
• **Dr. MAMATHA BALIPA** ma'am - HOD
• **PREMITHA KAMATH** ma'am - Placement Guide
• **ANANTHA MURTHY** sir - Placement Coordinator

💡 **SAMCA and CodeMonk work together to create the best learning environment for MCA students at NMAMIT!**

Ready to be part of this amazing community? Join SAMCA and experience holistic development! 🚀`;
    }
    
    return null; // No SAMCA mention found
  };

  // Function to handle SAMCA President/Kiran queries with fun content
  const detectPresidentQuery = (text) => {
    const lowerText = text.toLowerCase();
    
    // Check for president or Kiran specific queries
    if (lowerText.includes('president') || lowerText.includes('precident') ||  lowerText.includes('who is kiran') ||
        lowerText.includes('about kiran') ||
        (lowerText.includes('kiran') && (lowerText.includes('president') || lowerText.includes('precident'))) ||
        (lowerText.includes('kiran anna') && (lowerText.includes('president') || lowerText.includes('precident'))) ||
        (lowerText.includes('samca') && (lowerText.includes('president') || lowerText.includes('precident'))) ||
        lowerText.includes('who is kiran') || lowerText.includes('about kiran')) {
      
      return `🎖️ **Meet Our Beloved SAMCA President - Namma Kiran Anna!** 👑

**🌟 Kiran Anna - The Man, The Myth, The Legend!** 

Our amazing SAMCA President who leads with style and charm! 😎

**📧 Contact Information:**
📱 **Instagram:** @kiran_killur 
📞 **Call or DM him** - He's always ready to help students!

**👨‍💼 About Kiran Anna:**
• 🎓 **Role:** SAMCA President & Student Leader Extraordinaire  
• 🔥 **Personality:** Fun, approachable, and super friendly
• 💪 **Leadership Style:** Leads by example with a smile
• 🎯 **Mission:** Making student life awesome at NMAMIT MCA

**💕 Fun Fact Alert!** 
🔔 **Status Update:** He's still single and ready to mingle! 😉💕
*(Ladies, there's your chance! Slide into those DMs! 😂)*

**🎭 What Makes Kiran Anna Special:**
• Always available for student guidance 🤝
• Great sense of humor (as you can see! 😄)
• Excellent event organizer 🎉
• Master of student coordination 📋
• Instagram worthy personality 📸

**📱 Want to Connect?**
Just call him or drop a DM on Instagram **@kiran_killur** - he's super responsive and loves helping fellow students!

**🚀 Pro Tip:** Whether it's SAMCA related queries, student issues, or you just want to say hi - Kiran Anna is your go-to person! 

*Disclaimer: No guarantee on the "ready to mingle" status - it might change faster than JavaScript frameworks! 😂*

💡 **Kiran Anna represents the spirit of SAMCA - helpful, fun, and always there for students!** 🌟`;
    }
    
    return null; // No president query found
  };

  // Detect if question is related to CodeMonk/club
  const isClubRelated = (text) => {
    const clubKeywords = [
      'codemonk', 'code monk', 'club', 'nmam', 'institute', 'team', 'members',
      'announcements', 'materials', 'cheatsheets', 'resources', 'mission',
      'about us', 'features', 'platform', 'dashboard', 'admin', 'student'
    ];
    
    return clubKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const toggleChat = () => {
    console.log('Chat toggle clicked, current state:', isOpen);
    setIsOpen(!isOpen);
    console.log('Chat state after toggle:', !isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

    const callGeminiAPI = async (userMessage) => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!API_KEY) {
      return "Please add your Google Gemini API key to the .env file to enable AI responses.";
    }

    // First check if it's a team member query
    const teamMemberInfo = detectTeamMember(userMessage);
    if (teamMemberInfo) {
      return teamMemberInfo;
    }

    // Handle personality questions about the chatbot
    const personalityResponse = handlePersonalityQuestions(userMessage);
    if (personalityResponse) {
      return personalityResponse;
    }

    // Check for any mention of CodeMonk in the message
    const codeMonkMention = detectCodeMonkMention(userMessage);
    if (codeMonkMention) {
      return codeMonkMention;
    }

    // Check for any mention of NMAMIT in the message
    const nmamitMention = detectNMAMITMention(userMessage);
    if (nmamitMention) {
      return nmamitMention;
    }

    // Check for any mention of SAMCA in the message
    const samcaMention = detectSAMCAMention(userMessage);
    if (samcaMention) {
      return samcaMention;
    }

    // Check for SAMCA President/Kiran specific queries
    const presidentQuery = detectPresidentQuery(userMessage);
    if (presidentQuery) {
      return presidentQuery;
    }

    try {
      // Create enhanced prompt with CodeMonk context when relevant
      let systemPrompt = "You are a helpful AI assistant that can answer any questions about programming, technology, and general topics. Format your responses to be student-friendly with clear structure, headings, and code examples when relevant.";
      
      // Add CodeMonk context for club-related questions
      if (isClubRelated(userMessage)) {
        systemPrompt += `\n\nAdditional context about CodeMonk: ${clubKnowledge.about}\n\nFeatures: ${clubKnowledge.features.join(', ')}\n\nMission: ${clubKnowledge.mission}\n\nWhen answering about CodeMonk, use this context to provide detailed and engaging responses.`;
      }
      
      // For programming questions, add helpful context
      if (isProgrammingRelated(userMessage)) {
        systemPrompt += "\n\nWhen answering programming questions:\n- Use clear headings (## for main sections)\n- Provide code examples in proper code blocks using ```language\n- Break down complex topics into bullet points\n- Include practical examples\n- Keep explanations concise but comprehensive\n- Use **bold** for important terms";
      }

      const fullPrompt = `${systemPrompt}\n\nUser question: ${userMessage}\n\nPlease provide a well-formatted, student-friendly answer with proper headings, code blocks, and clear structure:`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text.trim();
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Only provide a generic fallback message
      return `I'm having trouble connecting to the AI service right now. This might be due to:
      
1. Missing or invalid API key
2. Network connectivity issues
3. API service temporarily unavailable

Please check your Google Gemini API key in the .env file and try again. You can get a free API key from: https://aistudio.google.com/app/apikey`;
    }
  };

  // Helper function to detect programming-related questions
  const isProgrammingRelated = (text) => {
    const programmingKeywords = [
      'code', 'programming', 'javascript', 'python', 'java', 'react', 'nodejs', 'css', 'html',
      'algorithm', 'data structure', 'function', 'variable', 'array', 'object', 'class',
      'loop', 'condition', 'api', 'database', 'sql', 'git', 'debug', 'error', 'syntax',
      'framework', 'library', 'development', 'coding', 'software', 'web', 'frontend', 'backend'
    ];
    
    return programmingKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Helper function to determine if we should suggest CodeMonk resources
  const shouldSuggestResources = (text) => {
    const resourceKeywords = [
      'learn', 'tutorial', 'guide', 'example', 'practice', 'study', 'interview', 'preparation',
      'cheatsheet', 'reference', 'help', 'explain', 'understand'
    ];
    
    return resourceKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const botResponse = await callGeminiAPI(currentInput);
      
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Auto-suggest relevant seniors after AI response
      setTimeout(() => {
        const suggestedSeniors = suggestRelevantSeniors(currentInput);
        if (suggestedSeniors.length > 0) {
          let suggestionText = `💡 **Want personalized learning support?**\n\n`;

          if (suggestedSeniors.length === 1) {
            // Simple bold sentence for one senior (Markdown handles blank line separation)
            suggestionText += `**Contact ${suggestedSeniors[0].name} for expert guidance!**\n\n`;
          } else {
            // Use proper Markdown list so each senior appears on its own line
            suggestionText += `**Contact any of these experts for guidance:**\n\n`;
            suggestedSeniors.forEach(senior => {
              suggestionText += `- **${senior.name}**\n`;
            });
            suggestionText += `\n`;
          }

          suggestionText += `*Or reach out to any other CodeMonk team member for support through our team page!*`;
          
          const seniorSuggestion = {
            id: Date.now() + 2,
            text: suggestionText,
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, seniorSuggestion]);
        }
      }, 2800); // 2.8 second delay for natural conversation flow
      
      
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm experiencing some technical difficulties. Please try asking your question again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Removed custom FormattedMessage in favor of GeminiResponse markdown renderer

  return (
    <>
      {console.log('Chatbot render - isOpen:', isOpen)}
      {/* Chat Toggle Button */}
      {!isOpen && (
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[9999] bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        {isOpen ? <FaTimes size={24} /> : <FaComment size={24} />}
      </motion.button>
      )}
      {/* Chat Window */}
      <div 
        className={`fixed bottom-4 right-2 sm:right-6 w-[calc(100vw-16px)] sm:w-[480px] md:w-[550px] lg:w-[600px] h-[calc(100vh-80px)] sm:h-[600px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-all duration-300 ${
          isOpen 
            ? 'opacity-100 scale-100 visible z-[9998]' 
            : 'opacity-0 scale-95 invisible z-[-1]'
        }`}
      >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <FaRobot size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">CodeMonk Assistant</h3>
              <p className="text-sm text-white opacity-90">Online • Ready to help</p>
            </div>
              <button
              onClick={clearChatHistory}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200"
              title="Clear Chat History"
            >
              <FaTrash size={16} />
            </button>
            <button
              onClick={toggleChat}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-200"
              title="Clear Chat History"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 w-[95%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {message.sender === 'user' ? <FaUser size={14} /> : <FaRobot size={14} />}
                  </div>
                  <div className={`rounded-2xl p-3 flex-1 min-w-0 break-words overflow-hidden ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                  }`}>
                    <div className="text-sm leading-relaxed">
                      {message.sender === 'user' ? (
                        <span className="text-white whitespace-pre-wrap break-words">{message.text}</span>
                      ) : (
                        <GeminiResponse markdownText={message.text} />
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-white opacity-80' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 w-[95%]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center flex-shrink-0">
                    <FaRobot size={14} />
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800 rounded-2xl rounded-bl-md p-3 border-2 border-blue-200 shadow-md">
                    <div className="flex items-center gap-2">
                      <FaSpinner className="animate-spin text-blue-500" size={14} />
                      <span className="text-sm font-medium text-blue-700">{loadingMessage || "Thinking..."}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 sm:p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about CodeMonk..."
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-full hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane size={16} />
              </button>
            </div>
          </div>
        </div>
    </>
  );
};

export default Chatbot;