const express = require('express');
const router = express.Router();
const {
  createExam,
  addQuestions,
  updateQuestions,
  getExamByCode,
  checkSubmission,
  submitQuiz,
  submitVideoWatch,
  getAllExams,
  getExamById,
  getScoreboard,
  deleteExam,
  deleteAllExams,
  toggleExamStatus
} = require('../controllers/examController');
const { adminAuth } = require('../middleware/auth');

// Public routes (for students)
router.get('/code/:examCode', getExamByCode);
router.get('/:examId/check-submission/:usn', checkSubmission);
router.post('/submit-quiz', submitQuiz);
router.post('/submit-video', submitVideoWatch);

// Protected routes (for admin)
router.post('/', adminAuth, createExam);
router.get('/', adminAuth, getAllExams);
router.delete('/clear/all', adminAuth, deleteAllExams); // Clear all exams - must be before /:examId
router.get('/:examId', adminAuth, getExamById);
router.post('/:examId/questions', adminAuth, addQuestions);
router.put('/:examId/questions', adminAuth, updateQuestions);
router.get('/:examId/scoreboard', adminAuth, getScoreboard);
router.delete('/:examId', adminAuth, deleteExam);
router.patch('/:examId/toggle-status', adminAuth, toggleExamStatus);

module.exports = router;
