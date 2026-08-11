import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import Module from './models/Module.js';
import Lesson from './models/Lesson.js';
import Quiz from './models/Quiz.js';
import Mentor from './models/Mentor.js';
import Event from './models/Event.js';
import Resource from './models/Resource.js';
import Achievement from './models/Achievement.js';
import Project from './models/Project.js';

dotenv.config();

const COURSES_DATA = [
  {
    course: {
      title: 'Web Development',
      description: 'A structured deep-dive into the core building blocks of modern web development — HTML, CSS, JavaScript, React, Node.js, and Databases.',
      category: 'Web Development',
      difficulty: 'Beginner',
      estimatedHours: 10,
    },
    modules: [
      {
        title: 'Web Development Fundamentals',
        order: 1,
        lessons: [
          {
            title: 'How the Web Works',
            order: 1,
            content: `# Web Development Fundamentals\n\nWeb Development is the process of designing, building, deploying, and maintaining websites and web applications.\n\n### How the Web Works\nThe basic communication model is:\n**Client → Internet → Server → Database → Server → Client**\n\n- **Client**: Typically a web browser sending HTTP requests.\n- **Server**: Receives requests, processes business logic, and responds.\n- **HTTP Methods**: GET (Retrieve), POST (Create), PUT (Replace), PATCH (Modify), DELETE (Remove).\n- **HTTP Status Codes**:\n  - 200: OK\n  - 201: Created\n  - 400: Bad Request\n  - 401: Unauthorized\n  - 403: Forbidden\n  - 404: Not Found\n  - 500: Server Error`
          }
        ],
        quiz: {
          questions: [
            {
              text: 'Which HTTP method is used to retrieve data?',
              options: ['POST', 'GET', 'PUT', 'DELETE'],
              correctIndex: 1,
              topic: 'HTTP Methods',
              difficulty: 'easy'
            },
            {
              text: 'What does HTTP Status Code 404 represent?',
              options: ['Success', 'Created', 'Not Found', 'Unauthorized'],
              correctIndex: 2,
              topic: 'HTTP Status Codes',
              difficulty: 'easy'
            }
          ]
        }
      },
      {
        title: 'HTML Semantics & Structure',
        order: 2,
        lessons: [
          {
            title: 'Semantic HTML Elements',
            order: 1,
            content: `# HTML & Structure\n\nHTML (HyperText Markup Language) defines the structure of web pages.\n\n### Semantic HTML Elements\nSemantic elements clearly describe their meaning to both the browser and developer:\n- \`<header>\`: Header section.\n- \`<nav>\`: Navigation links.\n- \`<main>\`: Dominant main content.\n- \`<section>\`: Thematic grouping.\n- \`<article>\`: Independent content.\n- \`<footer>\`: Footer section.\n\n### Forms\nForms collect user input: \`<form>\`, \`<input>\`, \`<textarea>\`, \`<select>\`, and \`<button>\`.`
          }
        ],
        quiz: {
          questions: [
            {
              text: 'Which HTML tag represents the primary navigation block?',
              options: ['<header>', '<nav>', '<section>', '<aside>'],
              correctIndex: 1,
              topic: 'Semantic HTML',
              difficulty: 'easy'
            }
          ]
        }
      },
      {
        title: 'CSS Styling',
        order: 3,
        lessons: [
          {
            title: 'CSS Box Model & Flexbox',
            order: 1,
            content: `# CSS Styling & Layouts\n\nCSS (Cascading Style Sheets) controls the visual presentation of HTML.\n\n### CSS Box Model\nEvery HTML element is a box containing: **Content → Padding → Border → Margin**.\n\n### Flexbox & Grid\n- **Flexbox**: Primarily one-dimensional layouts.\n- **Grid**: Two-dimensional layouts.\n- Common flex properties: \`display: flex\`, \`justify-content\`, \`align-items\`, \`gap\`, \`flex-wrap\`.`
          }
        ],
        quiz: {
          questions: [
            {
              text: 'What are the components of the CSS Box Model?',
              options: ['Border, Width, Height', 'Content, Padding, Border, Margin', 'Display, Position, Float', 'Flex, Grid, Gap'],
              correctIndex: 1,
              topic: 'CSS Box Model',
              difficulty: 'easy'
            }
          ]
        }
      },
      {
        title: 'JavaScript Core',
        order: 4,
        lessons: [
          {
            title: 'JavaScript DOM & Async',
            order: 1,
            content: `# JavaScript Programming\n\nJavaScript adds dynamic interactions and behaviors to web pages.\n\n### DOM (Document Object Model)\nRepresents the HTML document as a programmable object structure that JavaScript can edit dynamically.\n\n### Asynchronous JavaScript\nHandles delay operations without blocking execution:\n- **Promises**\n- **Async/Await**\n- **Fetch API**`
          }
        ],
        quiz: {
          questions: [
            {
              text: 'What does DOM stand for?',
              options: ['Document Object Model', 'Data Oriented Module', 'Display Object Manager', 'Direct Output Method'],
              correctIndex: 0,
              topic: 'JavaScript DOM',
              difficulty: 'easy'
            }
          ]
        }
      },
      {
        title: 'React Fundamentals',
        order: 5,
        lessons: [
          {
            title: 'React Components & Hooks',
            order: 1,
            content: `# React Library\n\nReact is a JavaScript library for building user interfaces using reusable components.\n\n### Core Hooks\n- \`useState\`: Handles component state.\n- \`useEffect\`: Manages lifecycle side-effects.\n- \`useRef\`: Keeps mutable reference value.`
          }
        ],
        quiz: {
          questions: [
            {
              text: 'Which hook handles local state inside a React function component?',
              options: ['useEffect', 'useRef', 'useState', 'useContext'],
              correctIndex: 2,
              topic: 'React Hooks',
              difficulty: 'easy'
            }
          ]
        }
      },
      {
        title: 'Backend API Development',
        order: 6,
        lessons: [
          {
            title: 'Express & REST APIs',
            order: 1,
            content: `# Backend Development\n\nExpress is a lightweight Node.js web routing framework.\n\n### REST API Structure\nEndpoints communicate state using HTTP methods:\n- \`GET /api/courses\`\n- \`POST /api/courses\`\n- \`GET /api/courses/:id\`\n- \`DELETE /api/courses/:id\``
          }
        ],
        quiz: {
          questions: [
            {
              text: 'Which Node framework is commonly used to write REST API routes?',
              options: ['React', 'Express.js', 'Redux', 'Vue.js'],
              correctIndex: 1,
              topic: 'REST APIs',
              difficulty: 'easy'
            }
          ]
        }
      },
      {
        title: 'Databases & Mongoose',
        order: 7,
        lessons: [
          {
            title: 'MongoDB & Schema Structures',
            order: 1,
            content: `# Databases\n\nMongoDB is a Document NoSQL database that stores data records as document objects.\n\n### Concepts\n- Schema definition\n- Mongoose models\n- Collection queries`
          }
        ],
        quiz: {
          questions: [
            {
              text: 'MongoDB is classified as which database type?',
              options: ['Relational SQL', 'Document NoSQL', 'Key-Value Memory', 'Graph DB'],
              correctIndex: 1,
              topic: 'Databases',
              difficulty: 'easy'
            }
          ]
        }
      },
      {
        title: 'Advanced Deployment',
        order: 8,
        lessons: [
          {
            title: 'Deployment & Optimizations',
            order: 1,
            content: `# Full-Stack Architectures\n\nDeploying Node/React apps on cloud infrastructures with JWT authentication, role checks, and database index configurations.`
          }
        ],
        quiz: {
          questions: [
            {
              text: 'What protocol is commonly used for secure web API authentication tokens?',
              options: ['SMTP', 'JWT', 'FTP', 'DNS'],
              correctIndex: 1,
              topic: 'Advanced Topics',
              difficulty: 'easy'
            }
          ]
        }
      }
    ]
  },
  {
    course: {
      title: 'UI/UX Design',
      description: 'Master User Experience (UX) research and User Interface (UI) prototyping, wireframing, and Figma design systems.',
      category: 'UI/UX Design',
      difficulty: 'Beginner',
      estimatedHours: 8,
    },
    modules: [
      {
        title: 'UI vs UX Principles',
        order: 1,
        lessons: [
          {
            title: 'Visual Hierarchy & UI',
            order: 1,
            content: `# UI/UX Design Fundamentals\n\n- **UI (User Interface)**: Focuses on visual presentation, layout spacing, alignment, and colors.\n- **UX (User Experience)**: Focuses on research, journey mapping, personas, and usability.`
          }
        ],
        quiz: {
          questions: [
            {
              text: 'Which aspect deals primarily with color grids, buttons, cards, and typography layouts?',
              options: ['UX Design', 'UI Design', 'Database Queries', 'API routing'],
              correctIndex: 1,
              topic: 'UI vs UX',
              difficulty: 'easy'
            }
          ]
        }
      },
      {
        title: 'Color & Contrast',
        order: 2,
        lessons: [
          {
            title: 'Color Theory & Accessibility',
            order: 1,
            content: `# Color Theory\n\nColors create contrast and establish hierarchy. Green represents success, red denotes error, and yellow signals warning.`
          }
        ],
        quiz: {
          questions: [
            {
              text: 'Contrast is critical for which accessibility metric?',
              options: ['Page Load Speed', 'Readability & Visibility', 'DB Query Indexing', 'API response codes'],
              correctIndex: 1,
              topic: 'Color Theory',
              difficulty: 'easy'
            }
          ]
        }
      },
      {
        title: 'UX Research & Journeys',
        order: 3,
        lessons: [
          {
            title: 'User Journeys & Personas',
            order: 1,
            content: `# UX Research\n\nDesigning user journeys map user interactions from discover, login, dashboard, up to course certificate download.`
          }
        ],
        quiz: {
          questions: [
            {
              text: 'What represents a fictional persona in design thinking?',
              options: ['User Persona', 'API Payload', 'Database collection', 'System log file'],
              correctIndex: 0,
              topic: 'UX Research',
              difficulty: 'easy'
            }
          ]
        }
      }
    ]
  },
  {
    course: {
      title: 'Software Development',
      description: 'Understand requirement analysis, DSA (Data Structures & Algorithms), OOP patterns, and Git version control.',
      category: 'Software Development',
      difficulty: 'Intermediate',
      estimatedHours: 12,
    },
    modules: [
      {
        title: 'Data Structures & DSA',
        order: 1,
        lessons: [
          {
            title: 'Core Structures',
            order: 1,
            content: `# Data Structures\n\nAlgorithms process variables efficiently. Common structures include Arrays, Linked Lists, Stacks, Queues, Hash Tables, Trees, and Graphs.`
          }
        ],
        quiz: {
          questions: [
            {
              text: 'Which data structure follows First-In, First-Out (FIFO)?',
              options: ['Stack', 'Queue', 'Array', 'Hash Table'],
              correctIndex: 1,
              topic: 'Data Structures',
              difficulty: 'easy'
            }
          ]
        }
      },
      {
        title: 'Algorithms & Big O Complexity',
        order: 2,
        lessons: [
          {
            title: 'Big O Analysis',
            order: 1,
            content: `# Algorithms\n\nMeasures temporal and space resource consumption using Big O notation: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) merge sort, O(n²) quadratic.`
          }
        ],
        quiz: {
          questions: [
            {
              text: 'Which notation represents linear time complexity?',
              options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
              correctIndex: 1,
              topic: 'Complexity',
              difficulty: 'easy'
            }
          ]
        }
      },
      {
        title: 'Git Version Control',
        order: 3,
        lessons: [
          {
            title: 'Git Commands & Workflows',
            order: 1,
            content: `# Git Version Control\n\nGit is a distributed version control engine. Standard steps: Create branch → Commit edits → Push branch → Pull request.`
          }
        ],
        quiz: {
          questions: [
            {
              text: 'Which command sends your local commits to a remote repository?',
              options: ['git clone', 'git push', 'git pull', 'git status'],
              correctIndex: 1,
              topic: 'Git',
              difficulty: 'easy'
            }
          ]
        }
      }
    ]
  },
  {
    course: {
      title: 'Python Programming',
      description: 'Learn Python syntax, dictionary collections, OOP class functions, and Scikit-learn machine learning libraries.',
      category: 'Python Programming',
      difficulty: 'Beginner',
      estimatedHours: 8,
    },
    modules: [
      {
        title: 'Python Syntax & Flow',
        order: 1,
        lessons: [
          {
            title: 'Loops and Conditions',
            order: 1,
            content: `# Python Syntax\n\nPython variables are dynamically typed. Control flows include if-elif-else statements, for loops, and while loops.`
          }
        ],
        quiz: {
          questions: [
            {
              text: 'How do you check for loops iteration in Python?',
              options: ['using loop keyword', 'using for keyword', 'using foreach', 'using repeat'],
              correctIndex: 1,
              topic: 'Control Flow',
              difficulty: 'easy'
            }
          ]
        }
      },
      {
        title: 'Python Collections',
        order: 2,
        lessons: [
          {
            title: 'Lists and Dictionaries',
            order: 1,
            content: `# Python Collections\n\n- **List**: Mutable ordered sequence.\n- **Tuple**: Immutable ordered sequence.\n- **Set**: Unique elements.\n- **Dictionary**: Key-value mappings.`
          }
        ],
        quiz: {
          questions: [
            {
              text: 'Which collection stores key-value pairs in Python?',
              options: ['List', 'Tuple', 'Set', 'Dictionary'],
              correctIndex: 3,
              topic: 'Collections',
              difficulty: 'easy'
            }
          ]
        }
      }
    ]
  },
  {
    course: {
      title: 'Blockchain Technology',
      description: 'Explore cryptography, Ethereum ledger architectures, ERC-20 token specs, and Solidity smart contracts.',
      category: 'Blockchain',
      difficulty: 'Advanced',
      estimatedHours: 15,
    },
    modules: [
      {
        title: 'Blockchain & Cryptography',
        order: 1,
        lessons: [
          {
            title: 'Blocks and Hashing',
            order: 1,
            content: `# Blockchain Fundamentals\n\nA blockchain is a sequence of blocks linked cryptographically. Transactions are cryptographically hashed and chained to prevent tampering.`
          }
        ],
        quiz: {
          questions: [
            {
              text: 'How are blocks linked inside a blockchain?',
              options: ['Using index values', 'Using cryptographic hashes', 'Using database keys', 'Using FTP protocols'],
              correctIndex: 1,
              topic: 'Fundamentals',
              difficulty: 'easy'
            }
          ]
        }
      },
      {
        title: 'Solidity Smart Contracts',
        order: 2,
        lessons: [
          {
            title: 'Ethereum and Solidity Basics',
            order: 1,
            content: `# Smart Contracts\n\nA Smart Contract is a program deployed on the Ethereum blockchain. EVM executes solidity compiler bytecodes.`
          }
        ],
        quiz: {
          questions: [
            {
              text: 'Which programming language is commonly used to write Ethereum smart contracts?',
              options: ['JavaScript', 'Python', 'Solidity', 'Rust'],
              correctIndex: 2,
              topic: 'Solidity',
              difficulty: 'easy'
            }
          ]
        }
      }
    ]
  }
];

const SEED_MENTORS = [
  {
    name: 'Devanand K.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    expertise: ['React', 'Node.js', 'System Design'],
    experience: 6,
    bio: 'Senior full-stack architect specializing in high-performance caching and clean middleware patterns.',
    rating: 4.9,
    availability: ['Monday 10:00 AM', 'Wednesday 03:00 PM', 'Friday 05:00 PM'],
    skills: ['React', 'Express', 'Caching', 'Redis']
  },
  {
    name: 'Nisha Sharma',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    expertise: ['UI/UX Design', 'User Research', 'Design Systems'],
    experience: 5,
    bio: 'Lead product designer focusing on accessible, premium interface design and scalable design systems.',
    rating: 4.8,
    availability: ['Tuesday 11:00 AM', 'Thursday 02:00 PM'],
    skills: ['Figma', 'Prototyping', 'Accessibility', 'Wireframing']
  },
  {
    name: 'Vikas Patel',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    expertise: ['Blockchain', 'Cryptography', 'Smart Contracts'],
    experience: 7,
    bio: 'EVM blockchain engineer with deep expertise in Solidity audits and decentralized applications.',
    rating: 4.7,
    availability: ['Wednesday 10:00 AM', 'Friday 02:00 PM'],
    skills: ['Solidity', 'Ethereum', 'Web3.js', 'Hardhat']
  }
];

const SEED_EVENTS = [
  {
    title: 'Building High-Performance APIs with Express & Redis',
    description: 'Join us for a hands-on session exploring caching strategies, connection pooling, and distributed rate limiting.',
    date: '2026-08-20',
    time: '18:00',
    mentor: 'Devanand K.',
    capacity: 35,
    type: 'Workshop',
    creditsCost: 0
  },
  {
    title: 'Figma to Code: High-Fidelity UI Workflows',
    description: 'Learn the exact pipeline to translate Figma design tokens directly into Tailwind CSS code.',
    date: '2026-08-25',
    time: '15:00',
    mentor: 'Nisha Sharma',
    capacity: 50,
    type: 'Webinar',
    creditsCost: 15
  },
  {
    title: 'StudyBuddy Decentralized Hackathon',
    description: 'A 48-hour build sprint dedicated to creating decentralized learning platforms.',
    date: '2026-09-05',
    time: '09:00',
    mentor: 'Vikas Patel',
    capacity: 100,
    type: 'Hackathon',
    creditsCost: 0
  }
];

const SEED_RESOURCES = [
  {
    title: 'Full-Stack Deployment Cheatsheet',
    description: 'Step-by-step checklist to deploy Express apps on Vercel with MongoDB Atlas clustering configuration.',
    type: 'Cheatsheet',
    downloadUrl: '/downloads/deployment_cheatsheet.pdf',
    creditsCost: 0
  },
  {
    title: 'React 18 Performance Template',
    description: 'Vite template with optimized bundle sizing, code splitting configurations, and basic state structure.',
    type: 'Template',
    downloadUrl: '/downloads/react_template.zip',
    creditsCost: 20
  },
  {
    title: 'Solidity Smart Contract Audit Checklist',
    description: 'Common vulnerability patterns (reentrancy, integer overflows) and security guidelines.',
    type: 'Cheatsheet',
    downloadUrl: '/downloads/solidity_audit.pdf',
    creditsCost: 10
  },
  {
    title: 'UI/UX Interactive Component kit',
    description: 'Figma files containing common dashboard widget components and layouts.',
    type: 'Template',
    downloadUrl: '/downloads/ui_components.fig',
    creditsCost: 15
  }
];

const SEED_ACHIEVEMENTS = [
  {
    title: 'First Step',
    description: 'Completed your first learning lesson on StudyBuddy.',
    badgeIcon: 'Compass',
    criteriaType: 'lesson_complete',
    criteriaValue: 1
  },
  {
    title: 'Quiz Whiz',
    description: 'Scored 100% on any assessment.',
    badgeIcon: 'Award',
    criteriaType: 'quiz_score',
    criteriaValue: 100
  },
  {
    title: 'Habitual Learner',
    description: 'Reached a 7-day study streak.',
    badgeIcon: 'Flame',
    criteriaType: 'streak',
    criteriaValue: 7
  },
  {
    title: 'Track Finisher',
    description: 'Finished all lessons in any course track.',
    badgeIcon: 'Trophy',
    criteriaType: 'course_complete',
    criteriaValue: 1
  }
];

const SEED_PROJECTS = [
  {
    title: 'E-Learning Command Center',
    problemStatement: 'Design and build a responsive student command dashboard featuring study tasks tracking and mastery logs.',
    difficulty: 'Beginner',
    requiredSkills: ['HTML', 'CSS', 'JavaScript'],
    technology: ['HTML5', 'CSS Flexbox', 'Vanilla JS'],
    milestones: [
      { title: 'Responsive Shell', description: 'Design a clean sidebar desktop navigation shell.', order: 1 },
      { title: 'Interactive Widgets', description: 'Create dynamic metric blocks showing course progress.', order: 2 }
    ]
  },
  {
    title: 'Collaborative Community Hub',
    problemStatement: 'Develop a forum with category tagging, posts liking, and nested comments replies.',
    difficulty: 'Intermediate',
    requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB'],
    technology: ['React.js', 'Express.js', 'Mongoose', 'Tailwind'],
    milestones: [
      { title: 'REST API Setup', description: 'Create posts schema and routing endpoints.', order: 1 },
      { title: 'Frontend Forum Grid', description: 'Implement posts cards rendering and likes trigger.', order: 2 }
    ]
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[SEED] Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    Course.deleteMany({}),
    Module.deleteMany({}),
    Lesson.deleteMany({}),
    Quiz.deleteMany({}),
    Mentor.deleteMany({}),
    Event.deleteMany({}),
    Resource.deleteMany({}),
    Achievement.deleteMany({}),
    Project.deleteMany({})
  ]);
  console.log('[SEED] Cleared existing StudyBuddy database collections');

  let totalCourses = 0;
  let totalModules = 0;
  let totalLessons = 0;
  let totalQuizzes = 0;

  for (const cData of COURSES_DATA) {
    const course = await Course.create(cData.course);
    totalCourses++;
    console.log(`[SEED] Created course: ${course.title}`);

    for (const modData of cData.modules) {
      const mod = await Module.create({ courseId: course._id, title: modData.title, order: modData.order });
      totalModules++;
      console.log(`[SEED]   Module: ${mod.title}`);

      for (const lessonData of modData.lessons) {
        const wordCount = lessonData.content.trim().split(/\s+/).length;
        await Lesson.create({ moduleId: mod._id, ...lessonData, wordCount });
        totalLessons++;
      }

      if (modData.quiz && modData.quiz.questions) {
        await Quiz.create({ moduleId: mod._id, questions: modData.quiz.questions });
        totalQuizzes++;
      }
    }
  }

  // Seed mentors, events, resources, achievements, and projects
  await Promise.all([
    Mentor.create(SEED_MENTORS),
    Event.create(SEED_EVENTS),
    Resource.create(SEED_RESOURCES),
    Achievement.create(SEED_ACHIEVEMENTS),
    Project.create(SEED_PROJECTS)
  ]);

  console.log(`[SEED] Done. Created: ${totalCourses} courses, ${totalModules} modules, ${totalLessons} lessons, ${totalQuizzes} quizzes`);
  console.log(`[SEED] Seeded: ${SEED_MENTORS.length} mentors, ${SEED_EVENTS.length} events, ${SEED_RESOURCES.length} resources, ${SEED_ACHIEVEMENTS.length} achievements, ${SEED_PROJECTS.length} projects`);
  
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[SEED] Failed:', err.message);
  process.exit(1);
});
