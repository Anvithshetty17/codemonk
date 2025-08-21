const User = require('../models/User');
const connectDB = require('../config/database');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@codemonk.in' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      // Create admin user
      const admin = await User.create({
        fullName: 'Code Monk Admin',
        email: 'admin@codemonk.in',
        password: 'codemonk25',
        phone: '9999999999',
        areasOfInterest: ['Administration'],
        codingSkillsRating: 10,
        favoriteProgrammingLanguage: 'JavaScript',
        favoriteLanguageReason: 'Versatile and powerful for web development',
        proudProject: 'CodeMonk Platform - A comprehensive learning management system',
        debuggingProcess: 'Systematic approach using logs, breakpoints, and testing',
        role: 'admin'
      });

      console.log('Admin user created successfully:');
      console.log('Email: admin@codemonk.in');
      console.log('Password: codemonk25');
    }

    // Check if mentor exists
    const existingMentor = await User.findOne({ email: 'mentor@codemonk.in' });
    
    if (existingMentor) {
      console.log('Mentor user already exists');
    } else {
      // Create mentor user
      const mentor = await User.create({
        fullName: 'Code Monk Mentor',
        email: 'mentor@codemonk.in', 
        password: 'codemonk25',
        phone: '8888888888',
        areasOfInterest: ['Web Development', 'Teaching'],
        codingSkillsRating: 9,
        favoriteProgrammingLanguage: 'React',
        favoriteLanguageReason: 'Great for building interactive UIs',
        proudProject: 'Mentored 100+ students in web development',
        debuggingProcess: 'Step-by-step debugging with developer tools',
        role: 'mentor'
      });

      console.log('Mentor user created successfully:');
      console.log('Email: mentor@codemonk.in');
      console.log('Password: codemonk25');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedAdmin();
