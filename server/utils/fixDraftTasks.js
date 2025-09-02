const mongoose = require('mongoose');
const Task = require('../models/Task');
require('dotenv').config();

const fixDraftTasks = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all draft tasks
    const draftTasks = await Task.find({ status: 'draft' });
    console.log(`Found ${draftTasks.length} draft tasks`);

    // Update them to published
    const result = await Task.updateMany(
      { status: 'draft' },
      { status: 'published' }
    );

    console.log(`Updated ${result.modifiedCount} tasks to published status`);

    // Check all tasks now
    const allTasks = await Task.find({});
    console.log('All tasks in database:');
    allTasks.forEach(task => {
      console.log(`- ${task.title}: status=${task.status}, sections=${task.assignedToSections}, isActive=${task.isActive}`);
    });

    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
};

fixDraftTasks();
