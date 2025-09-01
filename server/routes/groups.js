const express = require('express');
const router = express.Router();
const {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  getMyGroups,
  submitProject,
  reviewSubmission,
  getMentorGroups,
  getGroupStudentTasks
} = require('../controllers/groupController');
const { auth, adminAuth } = require('../middleware/auth');

// Public routes (none for groups)

// Protected routes
router.get('/my-groups', auth, getMyGroups);
router.get('/mentor-groups', auth, getMentorGroups);
router.get('/:id', auth, getGroup);
router.get('/:id/student-tasks', auth, getGroupStudentTasks);
router.post('/:id/submit', auth, submitProject);

// Admin only routes
router.get('/', adminAuth, getGroups);
router.post('/', adminAuth, createGroup);
router.put('/:id', adminAuth, updateGroup);
router.delete('/:id', adminAuth, deleteGroup);

// Mentor/Admin routes for reviewing
router.put('/:id/submissions/:submissionId/review', auth, reviewSubmission);

module.exports = router;
