const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const memberRoutes = require('./routes/members');
const materialRoutes = require('./routes/materials');
const announcementRoutes = require('./routes/announcements');
const groupRoutes = require('./routes/groups');
const taskRoutes = require('./routes/tasks');
const otpRoutes = require('./routes/otp');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow for development
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'https://codemonk.anvithshetty.me',
      'https://codemonk-anvith-shettys-projects.vercel.app',
      'https://opulent-space-rotary-phone-x55r5xwwg67c675p-5173.app.github.dev',
      'https://opulent-space-rotary-phone-x55r5xwwg67c675p-5173.app.github.dev/',
      process.env.CLIENT_URL
    ].filter(Boolean); // Remove any undefined values
    
    // In development, allow all localhost and GitHub Codespaces URLs
    if (process.env.NODE_ENV !== 'production' && origin) {
      if (origin.includes('localhost') || 
          origin.includes('127.0.0.1') || 
          origin.includes('.app.github.dev') ||
          origin.includes('vscode-cdn.net')) {
        return callback(null, true);
      }
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS rejected origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // 5 in production, 50 in development
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development for localhost
    if (process.env.NODE_ENV !== 'production') {
      return req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    }
    return false;
  }
});

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/otp', authLimiter, otpRoutes);
app.use('/api/users', userRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/tasks', taskRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
