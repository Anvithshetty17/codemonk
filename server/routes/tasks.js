const express = require('express');
const router = express.Router();
const {
  createTask,
  getMyTasks,
  getTasksForMySection,
  submitTask,
  reviewSubmission,
  updateTask,
  deleteTask,
  getTaskById,
  getLeaderboard,
  upload
} = require('../controllers/taskController');
const { auth, adminAuth } = require('../middleware/auth');

// Public leaderboard (accessible to all authenticated users)
router.get('/leaderboard', auth, getLeaderboard);

// Routes for students
router.get('/my-section', auth, getTasksForMySection);
router.post('/:id/submit', auth, upload.array('attachments', 5), submitTask);

// Routes for mentors/admins
router.get('/my-tasks', auth, getMyTasks);
router.post('/', auth, createTask);
router.patch('/:taskId/submissions/:submissionId/review', auth, reviewSubmission);

// General task routes
router.get('/:id', auth, getTaskById);
router.patch('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;