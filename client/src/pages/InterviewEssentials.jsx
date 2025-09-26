import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaBrain, 
  FaArrowLeft, 
  FaChevronDown,
  FaCode,
  FaDatabase,
  FaServer,
  FaCog,
  FaNetworkWired,
  FaCloud,
  FaGitAlt,
  FaJsSquare,
  FaCopy,
  FaCheck
} from 'react-icons/fa';

const InterviewEssentials = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);
  const [copiedText, setCopiedText] = useState('');

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(id);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const toggleSection = (sectionId) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  const essentialTopics = [
    {
      id: 'ports',
      title: 'Common Port Numbers',
      icon: FaNetworkWired,
      color: 'from-blue-600 to-cyan-600',
      content: {
        description: 'Essential port numbers every developer should know',
        items: [
          { name: 'HTTP', port: '80', description: 'Hypertext Transfer Protocol' },
          { name: 'HTTPS', port: '443', description: 'HTTP Secure (SSL/TLS)' },
          { name: 'FTP', port: '21', description: 'File Transfer Protocol' },
          { name: 'SSH', port: '22', description: 'Secure Shell' },
          { name: 'Telnet', port: '23', description: 'Telnet Protocol' },
          { name: 'SMTP', port: '25', description: 'Simple Mail Transfer Protocol' },
          { name: 'DNS', port: '53', description: 'Domain Name System' },
          { name: 'DHCP', port: '67/68', description: 'Dynamic Host Configuration Protocol' },
          { name: 'POP3', port: '110', description: 'Post Office Protocol v3' },
          { name: 'IMAP', port: '143', description: 'Internet Message Access Protocol' },
          { name: 'SNMP', port: '161', description: 'Simple Network Management Protocol' },
          { name: 'LDAP', port: '389', description: 'Lightweight Directory Access Protocol' },
          { name: 'SMTPS', port: '465', description: 'SMTP Secure' },
          { name: 'MySQL', port: '3306', description: 'MySQL Database' },
          { name: 'PostgreSQL', port: '5432', description: 'PostgreSQL Database' },
          { name: 'MongoDB', port: '27017', description: 'MongoDB Database' },
          { name: 'Redis', port: '6379', description: 'Redis Database' },
          { name: 'Tomcat', port: '8080', description: 'Apache Tomcat Server' },
        ]
      }
    },
    {
      id: 'oop',
      title: 'OOP Concepts',
      icon: FaCog,
      color: 'from-purple-600 to-pink-600',
      content: {
        description: 'Four fundamental principles of Object-Oriented Programming',
        concepts: [
          {
            name: 'Encapsulation',
            definition: 'Bundling data and methods that operate on that data within a single unit',
            example: 'private variables with public getter/setter methods',
            benefits: ['Data hiding', 'Modularity', 'Flexibility', 'Maintainability']
          },
          {
            name: 'Inheritance',
            definition: 'Mechanism where a new class acquires properties and methods of existing class',
            example: 'class Dog extends Animal',
            benefits: ['Code reusability', 'Method overriding', 'Hierarchical classification']
          },
          {
            name: 'Polymorphism',
            definition: 'Ability of objects to take multiple forms - same interface, different implementations',
            example: 'Method overloading and overriding',
            benefits: ['Flexibility', 'Code reusability', 'Dynamic method resolution']
          },
          {
            name: 'Abstraction',
            definition: 'Hiding complex implementation details while showing only essential features',
            example: 'Abstract classes and interfaces',
            benefits: ['Simplicity', 'Modularity', 'Code maintenance']
          }
        ]
      }
    },
    {
      id: 'database',
      title: 'Database Essentials',
      icon: FaDatabase,
      color: 'from-green-600 to-teal-600',
      content: {
        description: 'Key database concepts and SQL fundamentals',
        topics: [
          {
            category: 'ACID Properties',
            items: [
              'Atomicity - All or nothing transaction',
              'Consistency - Data integrity maintained',
              'Isolation - Concurrent transactions don\'t interfere',
              'Durability - Committed data survives system failures'
            ]
          },
          {
            category: 'Normalization',
            items: [
              '1NF - Atomic values, no repeating groups',
              '2NF - 1NF + no partial dependencies',
              '3NF - 2NF + no transitive dependencies',
              'BCNF - 3NF + every determinant is a candidate key'
            ]
          },
          {
            category: 'SQL Commands',
            items: [
              'SELECT - Retrieve data',
              'INSERT - Add new records',
              'UPDATE - Modify existing records',
              'DELETE - Remove records',
              'CREATE - Create database objects',
              'ALTER - Modify database structure',
              'DROP - Delete database objects',
              'JOIN - Combine tables (INNER, LEFT, RIGHT, FULL)'
            ]
          }
        ]
      }
    },
    {
      id: 'datastructures',
      title: 'Data Structures',
      icon: FaBrain,
      color: 'from-orange-600 to-red-600',
      content: {
        description: 'Essential data structures with time complexities',
        structures: [
          {
            name: 'Array',
            operations: [
              'Access: O(1)',
              'Search: O(n)',
              'Insertion: O(n)',
              'Deletion: O(n)'
            ],
            use_cases: ['Random access', 'Mathematical operations', 'Lookup tables']
          },
          {
            name: 'Linked List',
            operations: [
              'Access: O(n)',
              'Search: O(n)',
              'Insertion: O(1)',
              'Deletion: O(1)'
            ],
            use_cases: ['Dynamic size', 'Frequent insertions/deletions', 'Implementation of other DS']
          },
          {
            name: 'Stack',
            operations: [
              'Push: O(1)',
              'Pop: O(1)',
              'Top/Peek: O(1)',
              'Search: O(n)'
            ],
            use_cases: ['Function calls', 'Expression evaluation', 'Undo operations', 'Browser history']
          },
          {
            name: 'Queue',
            operations: [
              'Enqueue: O(1)',
              'Dequeue: O(1)',
              'Front: O(1)',
              'Search: O(n)'
            ],
            use_cases: ['BFS', 'Process scheduling', 'Buffer for data streams']
          },
          {
            name: 'Binary Tree',
            operations: [
              'Search: O(log n) - O(n)',
              'Insert: O(log n) - O(n)',
              'Delete: O(log n) - O(n)',
              'Traversal: O(n)'
            ],
            use_cases: ['Hierarchical data', 'Expression parsing', 'Decision making']
          },
          {
            name: 'Hash Table',
            operations: [
              'Insert: O(1) avg',
              'Delete: O(1) avg',
              'Search: O(1) avg',
              'Worst case: O(n)'
            ],
            use_cases: ['Fast lookups', 'Caching', 'Database indexing', 'Sets and maps']
          }
        ]
      }
    },
    {
      id: 'algorithms',
      title: 'Algorithm Complexities',
      icon: FaCode,
      color: 'from-indigo-600 to-blue-600',
      content: {
        description: 'Time and space complexities of common algorithms',
        algorithms: [
          {
            category: 'Sorting Algorithms',
            items: [
              { name: 'Bubble Sort', time: 'O(n²)', space: 'O(1)', stable: 'Yes' },
              { name: 'Selection Sort', time: 'O(n²)', space: 'O(1)', stable: 'No' },
              { name: 'Insertion Sort', time: 'O(n²)', space: 'O(1)', stable: 'Yes' },
              { name: 'Merge Sort', time: 'O(n log n)', space: 'O(n)', stable: 'Yes' },
              { name: 'Quick Sort', time: 'O(n log n) avg', space: 'O(log n)', stable: 'No' },
              { name: 'Heap Sort', time: 'O(n log n)', space: 'O(1)', stable: 'No' }
            ]
          },
          {
            category: 'Search Algorithms',
            items: [
              { name: 'Linear Search', time: 'O(n)', space: 'O(1)' },
              { name: 'Binary Search', time: 'O(log n)', space: 'O(1)' },
              { name: 'BFS', time: 'O(V + E)', space: 'O(V)' },
              { name: 'DFS', time: 'O(V + E)', space: 'O(V)' }
            ]
          }
        ]
      }
    },
    {
      id: 'networking',
      title: 'Networking Basics',
      icon: FaServer,
      color: 'from-cyan-600 to-blue-600',
      content: {
        description: 'Essential networking concepts for interviews',
        topics: [
          {
            category: 'OSI Model (7 Layers)',
            items: [
              'Physical Layer - Hardware transmission',
              'Data Link Layer - Node-to-node delivery',
              'Network Layer - Routing (IP)',
              'Transport Layer - End-to-end delivery (TCP/UDP)',
              'Session Layer - Dialog control',
              'Presentation Layer - Data formatting',
              'Application Layer - User interface (HTTP, FTP)'
            ]
          },
          {
            category: 'TCP vs UDP',
            tcp: [
              'Connection-oriented',
              'Reliable delivery',
              'Ordered data',
              'Error checking',
              'Flow control',
              'Higher overhead'
            ],
            udp: [
              'Connectionless',
              'Best-effort delivery',
              'No ordering guarantee',
              'Minimal error checking',
              'No flow control',
              'Lower overhead'
            ]
          },
          {
            category: 'HTTP Status Codes',
            items: [
              '200 OK - Success',
              '201 Created - Resource created',
              '400 Bad Request - Client error',
              '401 Unauthorized - Authentication required',
              '403 Forbidden - Access denied',
              '404 Not Found - Resource not found',
              '500 Internal Server Error - Server error',
              '503 Service Unavailable - Server overloaded'
            ]
          }
        ]
      }
    },
    {
      id: 'systemdesign',
      title: 'System Design Basics',
      icon: FaCloud,
      color: 'from-teal-600 to-green-600',
      content: {
        description: 'Fundamental system design concepts for interviews',
        concepts: [
          {
            category: 'Scalability Principles',
            items: [
              'Horizontal vs Vertical Scaling',
              'Load Balancing (Round Robin, Least Connections)',
              'Database Sharding and Replication',
              'Caching Strategies (Redis, Memcached)',
              'CDN (Content Delivery Network)',
              'Microservices vs Monolithic Architecture'
            ]
          },
          {
            category: 'CAP Theorem',
            items: [
              'Consistency - All nodes see same data simultaneously',
              'Availability - System remains operational',
              'Partition Tolerance - System continues despite network failures',
              'You can only guarantee 2 out of 3 properties'
            ]
          },
          {
            category: 'Common Components',
            items: [
              'Load Balancer - Distributes incoming requests',
              'API Gateway - Single entry point for APIs',
              'Message Queue - Asynchronous communication',
              'Database (SQL vs NoSQL)',
              'Cache Layer - Fast data retrieval',
              'Monitoring & Logging - System observability'
            ]
          }
        ]
      }
    },
    {
      id: 'javascript',
      title: 'JavaScript Essentials',
      icon: FaJsSquare,
      color: 'from-yellow-500 to-orange-500',
      content: {
        description: 'Key JavaScript concepts frequently asked in interviews',
        topics: [
          {
            category: 'Core Concepts',
            items: [
              'Hoisting - Variable/function declarations moved to top',
              'Closures - Inner function accessing outer variables',
              'Event Loop - JavaScript\'s concurrency model',
              'Promises & Async/Await - Asynchronous programming',
              'Prototype Chain - Object inheritance in JS',
              'this keyword - Context binding'
            ]
          },
          {
            category: 'ES6+ Features',
            items: [
              'Arrow Functions - Lexical this binding',
              'Destructuring - Extract values from objects/arrays',
              'Spread/Rest Operators - ... syntax',
              'Template Literals - String interpolation',
              'let/const - Block-scoped variables',
              'Modules - import/export statements'
            ]
          },
          {
            category: 'Common Questions',
            items: [
              'Difference between == and === (type coercion)',
              'null vs undefined vs undeclared',
              'Event Bubbling vs Event Capturing',
              'setTimeout vs setInterval',
              'Call, Apply, Bind methods',
              'Map vs ForEach - Array iteration methods'
            ]
          }
        ]
      }
    },
    {
      id: 'git',
      title: 'Git Commands',
      icon: FaGitAlt,
      color: 'from-orange-500 to-red-500',
      content: {
        description: 'Essential Git commands for version control',
        commands: [
          {
            category: 'Basic Commands',
            items: [
              { cmd: 'git init', desc: 'Initialize a new Git repository' },
              { cmd: 'git clone <url>', desc: 'Clone a remote repository' },
              { cmd: 'git add .', desc: 'Stage all changes' },
              { cmd: 'git commit -m "message"', desc: 'Commit staged changes' },
              { cmd: 'git push', desc: 'Push commits to remote' },
              { cmd: 'git pull', desc: 'Fetch and merge remote changes' }
            ]
          },
          {
            category: 'Branching',
            items: [
              { cmd: 'git branch', desc: 'List all branches' },
              { cmd: 'git branch <name>', desc: 'Create new branch' },
              { cmd: 'git checkout <branch>', desc: 'Switch to branch' },
              { cmd: 'git merge <branch>', desc: 'Merge branch into current' },
              { cmd: 'git rebase <branch>', desc: 'Reapply commits on top of another branch' },
              { cmd: 'git branch -d <name>', desc: 'Delete branch' }
            ]
          },
          {
            category: 'Advanced Commands',
            items: [
              { cmd: 'git status', desc: 'Show working directory status' },
              { cmd: 'git log --oneline', desc: 'Show commit history' },
              { cmd: 'git reset --hard HEAD~1', desc: 'Reset to previous commit' },
              { cmd: 'git stash', desc: 'Temporarily save changes' },
              { cmd: 'git cherry-pick <hash>', desc: 'Apply specific commit' },
              { cmd: 'git revert <hash>', desc: 'Create new commit that undoes changes' }
            ]
          }
        ]
      }
    },
    {
      id: 'testing',
      title: 'Software Testing',
      icon: FaCode,
      color: 'from-green-500 to-blue-500',
      content: {
        description: 'Testing methodologies and best practices',
        concepts: [
          {
            category: 'Types of Testing',
            items: [
              'Unit Testing - Individual component testing',
              'Integration Testing - Component interaction testing',
              'End-to-End Testing - Complete workflow testing',
              'Acceptance Testing - User requirement validation',
              'Performance Testing - Speed and scalability',
              'Security Testing - Vulnerability assessment'
            ]
          },
          {
            category: 'Testing Frameworks',
            items: [
              'Jest - JavaScript testing framework',
              'JUnit - Java testing framework',
              'PyTest - Python testing framework',
              'Selenium - Web automation testing',
              'Cypress - Modern web testing',
              'Postman - API testing tool'
            ]
          },
          {
            category: 'Best Practices',
            items: [
              'Test-Driven Development (TDD)',
              'Arrange-Act-Assert pattern',
              'Mock vs Stub vs Fake objects',
              'Code Coverage metrics',
              'Continuous Testing in CI/CD',
              'Test Pyramid - Unit > Integration > E2E'
            ]
          }
        ]
      }
    }
  ];

  const SectionCard = ({ topic, isActive, onToggle }) => (
    <motion.div
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.button
        onClick={() => onToggle(topic.id)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        whileHover={{ x: 2 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className={`w-12 h-12 rounded-xl bg-gradient-to-r ${topic.color} flex items-center justify-center text-white`}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <topic.icon className="text-xl" />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{topic.title}</h3>
            <p className="text-gray-600 text-sm">{topic.content.description}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isActive ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaChevronDown className="text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100"
          >
            <div className="p-6">
              {renderSectionContent(topic)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderSectionContent = (topic) => {
    switch (topic.id) {
      case 'ports':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            {topic.content.items.map((item, index) => (
              <motion.div
                key={index}
                className="bg-blue-50 rounded-lg p-4 border border-blue-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-800">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {item.port}
                    </span>
                    <button
                      onClick={() => copyToClipboard(item.port, `port-${index}`)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {copiedText === `port-${index}` ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>
                <p className="text-blue-700 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        );

      case 'oop':
        return (
          <div className="space-y-6">
            {topic.content.concepts.map((concept, index) => (
              <motion.div
                key={index}
                className="bg-purple-50 rounded-lg p-6 border border-purple-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <h4 className="text-lg font-bold text-purple-800 mb-3">{concept.name}</h4>
                <p className="text-purple-700 mb-4">{concept.definition}</p>
                <div className="bg-white rounded-lg p-3 mb-4">
                  <span className="text-sm font-semibold text-purple-600">Example: </span>
                  <code className="text-purple-800 bg-purple-100 px-2 py-1 rounded text-sm">
                    {concept.example}
                  </code>
                </div>
                <div>
                  <span className="text-sm font-semibold text-purple-600">Benefits: </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {concept.benefits.map((benefit, i) => (
                      <span
                        key={i}
                        className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-xs"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'database':
        return (
          <div className="space-y-6">
            {topic.content.topics.map((section, index) => (
              <motion.div
                key={index}
                className="bg-green-50 rounded-lg p-6 border border-green-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <h4 className="text-lg font-bold text-green-800 mb-4">{section.category}</h4>
                <div className="grid gap-3">
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg p-3 border border-green-200 flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-green-800">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'datastructures':
        return (
          <div className="grid lg:grid-cols-2 gap-6">
            {topic.content.structures.map((structure, index) => (
              <motion.div
                key={index}
                className="bg-orange-50 rounded-lg p-6 border border-orange-200"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <h4 className="text-lg font-bold text-orange-800 mb-4">{structure.name}</h4>
                
                <div className="mb-4">
                  <span className="text-sm font-semibold text-orange-600">Time Complexities:</span>
                  <div className="mt-2 space-y-1">
                    {structure.operations.map((op, i) => (
                      <div key={i} className="bg-white rounded px-3 py-1 text-sm">
                        <code className="text-orange-800">{op}</code>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-semibold text-orange-600">Use Cases:</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {structure.use_cases.map((useCase, i) => (
                      <span
                        key={i}
                        className="bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-xs"
                      >
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'algorithms':
        return (
          <div className="space-y-6">
            {topic.content.algorithms.map((category, index) => (
              <motion.div
                key={index}
                className="bg-indigo-50 rounded-lg p-6 border border-indigo-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <h4 className="text-lg font-bold text-indigo-800 mb-4">{category.category}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg overflow-hidden">
                    <thead className="bg-indigo-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left">Algorithm</th>
                        <th className="px-4 py-3 text-left">Time Complexity</th>
                        <th className="px-4 py-3 text-left">Space Complexity</th>
                        {category.items[0].stable && <th className="px-4 py-3 text-left">Stable</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {category.items.map((item, i) => (
                        <tr key={i} className="border-b border-indigo-100">
                          <td className="px-4 py-3 font-semibold text-indigo-800">{item.name}</td>
                          <td className="px-4 py-3">
                            <code className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm">
                              {item.time}
                            </code>
                          </td>
                          <td className="px-4 py-3">
                            <code className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm">
                              {item.space}
                            </code>
                          </td>
                          {item.stable && (
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                item.stable === 'Yes' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.stable}
                              </span>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'networking':
        return (
          <div className="space-y-6">
            {topic.content.topics.map((section, index) => (
              <motion.div
                key={index}
                className="bg-cyan-50 rounded-lg p-6 border border-cyan-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <h4 className="text-lg font-bold text-cyan-800 mb-4">{section.category}</h4>
                
                {section.items && (
                  <div className="grid gap-3">
                    {section.items.map((item, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-lg p-3 border border-cyan-200 flex items-center gap-3"
                      >
                        <div className="w-2 h-2 bg-cyan-600 rounded-full"></div>
                        <span className="text-cyan-800">{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {section.tcp && section.udp && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-cyan-200">
                      <h5 className="font-bold text-cyan-800 mb-3">TCP</h5>
                      <div className="space-y-2">
                        {section.tcp.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-cyan-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-cyan-200">
                      <h5 className="font-bold text-cyan-800 mb-3">UDP</h5>
                      <div className="space-y-2">
                        {section.udp.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-cyan-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        );

      case 'systemdesign':
        return (
          <div className="space-y-6">
            {topic.content.concepts.map((section, index) => (
              <motion.div
                key={index}
                className="bg-teal-50 rounded-lg p-6 border border-teal-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <h4 className="text-lg font-bold text-teal-800 mb-4">{section.category}</h4>
                <div className="grid gap-3">
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg p-3 border border-teal-200 flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                      <span className="text-teal-800">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'javascript':
        return (
          <div className="space-y-6">
            {topic.content.topics.map((section, index) => (
              <motion.div
                key={index}
                className="bg-yellow-50 rounded-lg p-6 border border-yellow-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <h4 className="text-lg font-bold text-yellow-800 mb-4">{section.category}</h4>
                <div className="grid gap-3">
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg p-3 border border-yellow-200 flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      <span className="text-yellow-800">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'git':
        return (
          <div className="space-y-6">
            {topic.content.commands.map((section, index) => (
              <motion.div
                key={index}
                className="bg-orange-50 rounded-lg p-6 border border-orange-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <h4 className="text-lg font-bold text-orange-800 mb-4">{section.category}</h4>
                <div className="grid gap-3">
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg p-4 border border-orange-200"
                    >
                      <div className="flex flex-col gap-2">
                        <code className="text-orange-800 font-mono text-sm bg-orange-100 px-2 py-1 rounded">
                          {item.cmd}
                        </code>
                        <span className="text-orange-700 text-sm">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'testing':
        return (
          <div className="space-y-6">
            {topic.content.concepts.map((section, index) => (
              <motion.div
                key={index}
                className="bg-green-50 rounded-lg p-6 border border-green-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <h4 className="text-lg font-bold text-green-800 mb-4">{section.category}</h4>
                <div className="grid gap-3">
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg p-3 border border-green-200 flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-green-800">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
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
          
          <motion.div
            className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"
            animate={{ 
              rotate: 360,
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
          >
            <FaBrain className="text-white text-3xl" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Interview Essentials
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know before your technical interview - from port numbers to OOP concepts, all in one place
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-blue-600">18+</div>
            <div className="text-sm text-gray-600">Port Numbers</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-purple-600">4</div>
            <div className="text-sm text-gray-600">OOP Concepts</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-green-600">6</div>
            <div className="text-sm text-gray-600">Data Structures</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-lg">
            <div className="text-2xl font-bold text-orange-600">10+</div>
            <div className="text-sm text-gray-600">Algorithms</div>
          </div>
        </motion.div>

        {/* Essential Topics */}
        <div className="space-y-6">
          {essentialTopics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <SectionCard
                topic={topic}
                isActive={activeSection === topic.id}
                onToggle={toggleSection}
              />
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          className="text-center mt-12 p-8 bg-white rounded-2xl shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Pro Interview Tips</h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Before Interview</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Review these concepts thoroughly</li>
                <li>• Practice coding problems</li>
                <li>• Prepare behavioral questions</li>
                <li>• Research the company</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">During Interview</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Think out loud</li>
                <li>• Ask clarifying questions</li>
                <li>• Start with brute force solution</li>
                <li>• Optimize step by step</li>
              </ul>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">After Interview</h4>
              <ul className="text-purple-700 text-sm space-y-1">
                <li>• Send thank you email</li>
                <li>• Reflect on what went well</li>
                <li>• Note areas for improvement</li>
                <li>• Follow up appropriately</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InterviewEssentials;