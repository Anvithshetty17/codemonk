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
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      fullName: 'Code Monk Admin',
      email: 'admin@codemonk.in',
      password: 'codemonk25',
      phone: '9999999999',
      areasOfInterest: ['Administration'],
      role: 'admin'
    });

    console.log('Admin user created successfully:');
    console.log('Email: admin@codemonk.in');
    console.log('Password: codemonk25');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
