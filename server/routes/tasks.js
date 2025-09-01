const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getMyTasks,
  submitTask,
  startTask,
  reviewTask,
  getLeaderboard,
  getTaskStats
} = require('../controllers/taskController');
const { auth, adminAuth } = require('../middleware/auth');

// Protected routes for students
router.get('/my-tasks', auth, getMyTasks);
router.post('/:id/start', auth, startTask);
router.post('/:id/submit', auth, submitTask);

// Public leaderboard (accessible to all authenticated users)
router.get('/leaderboard', auth, getLeaderboard);

// Admin/Mentor routes
router.get('/', auth, getTasks);
router.post('/', adminAuth, createTask);
router.put('/:id/review', auth, reviewTask);

// Admin only routes
router.get('/stats', adminAuth, getTaskStats);

module.exports = router;