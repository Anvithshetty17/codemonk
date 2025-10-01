import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRobot, 
  FaPaperPlane, 
  FaTimes, 
  FaComment,
  FaUser,
  FaSpinner
} from 'react-icons/fa';

// Import club content for context-aware responses
import cheatsheets from '../data/cheatsheets.json';
import linkMaterials from '../data/linkmaterials.json';

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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
      
      // Frontend and UI/UX
      'frontend': ['sohan shiri'],
      'react': ['sohan shiri'],
      'css': ['sohan shiri'],
      'html': ['sohan shiri'],
      'ui': ['sohan shiri'],
      'ux': ['sohan shiri'],
      
      // Content Creation and Video
      'video editing': ['santhoji v'],
      'content creation': ['santhoji v'],
      'youtube': ['santhoji v'],
      'video': ['santhoji v'],
      
      // Communication and Motivation
      'communication': ['vaishnavi kini', 'sohan shiri'],
      'motivation': ['vaishnavi kini'],
      'confidence': ['vaishnavi kini'],
      'stage fear': ['vaishnavi kini'],
      'presentation': ['vaishnavi kini'],
      'women': ['vaishnavi kini'],
      
      // Logical Problems
      'logic': ['namratha'],
      'logical thinking': ['namratha'],
      'problem solving': ['namratha', 'harshith p'],
      
      // Web Development (multiple experts)
      'web development': ['anvith shetty', 'anup nayak', 'maneesh kumar', 'harshith p', 'namratha', 'santhoji v', 'vaishnavi kini', 'vidyashree'],
      'javascript': ['anvith shetty', 'anup nayak'],
      'java': ['anvith shetty', 'anup nayak'],
      'full stack': ['anvith shetty', 'anup nayak', 'maneesh kumar', 'namratha']
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
        return `**${member.name}** - ${member.role}

${member.description}

**Skills:** ${member.skills.join(', ')}

Want to know more about our team? Visit our team page on the CodeMonk platform!`;
      }
    }
    console.log('No team member found');
    return null;
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
            suggestionText += `**Contact ${suggestedSeniors[0].name} for expert guidance!**\n\n`;
          } else {
            suggestionText += `**Contact any of these experts for guidance:**\n`;
            suggestedSeniors.forEach(senior => {
              suggestionText += `• **${senior.name}**\n`;
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
      }, 1500); // 1.5 second delay for natural conversation flow
      
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

  // Component to format bot messages with proper styling
  const FormattedMessage = ({ text, isUser = false }) => {
    if (typeof text !== 'string') return <span>{text}</span>;

    // For user messages, just return simple text
    if (isUser) {
      return <span className="text-white">{text}</span>;
    }

    // Split the text into parts (code blocks, headings, regular text)
    const parts = text.split(/(```[\s\S]*?```|`[^`]+`|#{1,6}\s[^\n]+)/);
    
    return (
      <div className="space-y-2">
        {parts.map((part, index) => {
          // Multi-line code blocks
          if (part.startsWith('```') && part.endsWith('```')) {
            const code = part.slice(3, -3).trim();
            const lines = code.split('\n');
            const language = lines[0].toLowerCase();
            const codeContent = lines.slice(1).join('\n');
            
            return (
              <div key={index} className="my-2">
                <div className="bg-gray-900 text-gray-100 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 px-3 py-1 text-xs font-medium text-gray-300">
                    {language || 'Code'}
                  </div>
                  <pre className="p-2 overflow-x-auto text-xs max-w-full">
                    <code className="whitespace-pre-wrap break-words">{codeContent || code}</code>
                  </pre>
                </div>
              </div>
            );
          }
          
          // Inline code
          if (part.startsWith('`') && part.endsWith('`')) {
            const code = part.slice(1, -1);
            return (
              <code key={index} className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-xs font-mono break-words">
                {code}
              </code>
            );
          }
          
          // Headings
          if (part.match(/^#{1,6}\s/)) {
            const level = part.match(/^#+/)[0].length;
            const text = part.replace(/^#+\s/, '');
            const HeadingTag = `h${Math.min(level + 2, 6)}`;
            
            return React.createElement(HeadingTag, {
              key: index,
              className: `font-bold text-gray-900 mt-3 mb-1 break-words ${
                level === 1 ? 'text-base' : 
                level === 2 ? 'text-sm' : 'text-sm'
              }`
            }, text);
          }
          
          // Regular text with formatting
          return (
            <div key={index} className="space-y-1">
              {part.split('\n').map((line, lineIndex) => {
                if (!line.trim()) return <br key={lineIndex} />;
                
                // Bold text - properly format without showing **
                line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
                
                // Bullet points
                if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
                  const content = line.trim().substring(1).trim();
                  const formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
                  return (
                    <div key={lineIndex} className="flex items-start gap-2 ml-2">
                      <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                      <span className="break-words" dangerouslySetInnerHTML={{ __html: formattedContent }} />
                    </div>
                  );
                }
                
                // Numbered lists
                if (line.trim().match(/^\d+\./)) {
                  const content = line.trim().replace(/^\d+\.\s*/, '');
                  const formattedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
                  return (
                    <div key={lineIndex} className="flex items-start gap-2 ml-2">
                      <span className="text-blue-500 font-medium flex-shrink-0">{line.trim().match(/^\d+/)[0]}.</span>
                      <span className="break-words" dangerouslySetInnerHTML={{ __html: formattedContent }} />
                    </div>
                  );
                }
                
                // Regular paragraphs
                return (
                  <p key={lineIndex} className="leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: line }} />
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {console.log('Chatbot render - isOpen:', isOpen)}
      {/* Chat Toggle Button */}
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

      {/* Chat Window */}
      <div 
        className={`fixed bottom-16 sm:bottom-24 right-2 sm:right-6 w-[calc(100vw-16px)] sm:w-[480px] md:w-[550px] lg:w-[600px] h-[calc(100vh-80px)] sm:h-[600px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-all duration-300 ${
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
                      <FormattedMessage text={message.text} isUser={message.sender === 'user'} />
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
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
                    <FaRobot size={14} />
                  </div>
                  <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md p-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <FaSpinner className="animate-spin" size={14} />
                      <span className="text-sm">Typing...</span>
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