const Task = require('../models/Task');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../client/public/uploads/tasks');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, documents, and archive files are allowed!'));
    }
  }
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Mentor/Admin only)
const createTask = asyncHandler(async (req, res) => {
  const { title, description, instructions, points, deadline, assignedToSections, type, difficulty } = req.body;

  // Validate user role
  if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only mentors and admins can create tasks'
    });
  }

  // Validate sections
  const validSections = ['A', 'B', 'C'];
  const sections = Array.isArray(assignedToSections) ? assignedToSections : [assignedToSections];
  const invalidSections = sections.filter(section => !validSections.includes(section));
  
  if (invalidSections.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid sections: ${invalidSections.join(', ')}`
    });
  }

  const task = await Task.create({
    title,
    description,
    instructions,
    points,
    deadline: new Date(deadline),
    assignedToSections: sections,
    type,
    difficulty,
    createdBy: req.user.id
  });

  await task.populate('createdBy', 'fullName role');

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task }
  });
});

// @desc    Get all tasks created by mentor
// @route   GET /api/tasks/my-tasks
// @access  Private (Mentor/Admin only)
const getMyTasks = asyncHandler(async (req, res) => {
  if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const tasks = await Task.find({ createdBy: req.user.id })
    .populate('createdBy', 'fullName role')
    .populate('submissions.student', 'fullName usn section')
    .populate('submissions.reviewedBy', 'fullName role')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { tasks }
  });
});

// @desc    Get tasks for student's section
// @route   GET /api/tasks/my-section
// @access  Private (Student only)
const getTasksForMySection = asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'This endpoint is for students only'
    });
  }

  if (!req.user.section) {
    return res.status(400).json({
      success: false,
      message: 'User section not found'
    });
  }

  const tasks = await Task.getTasksForSection(req.user.section);

  // Add submission status for each task
  const tasksWithStatus = tasks.map(task => {
    const submission = task.getSubmissionByStudent(req.user.id);
    return {
      ...task.toJSON(),
      mySubmission: submission || null,
      canSubmit: task.canStudentSubmit(req.user.id)
    };
  });

  res.json({
    success: true,
    data: { tasks: tasksWithStatus }
  });
});

// @desc    Submit task solution
// @route   POST /api/tasks/:id/submit
// @access  Private (Student only)
const submitTask = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const taskId = req.params.id;

  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Only students can submit tasks'
    });
  }

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check if student can submit
  if (!task.canStudentSubmit(req.user.id)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot submit this task. Either already submitted, task is overdue, or task is not published'
    });
  }

  // Check if student's section is assigned to this task
  if (!task.assignedToSections.includes(req.user.section)) {
    return res.status(403).json({
      success: false,
      message: 'This task is not assigned to your section'
    });
  }

  // Handle file attachments
  let attachments = [];
  if (req.files && req.files.length > 0) {
    attachments = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/tasks/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size
    }));
  }

  // Add submission to task
  const submission = {
    student: req.user.id,
    content,
    attachments,
    submittedAt: new Date()
  };

  task.submissions.push(submission);
  await task.save();

  await task.populate('submissions.student', 'fullName usn section');

  res.json({
    success: true,
    message: 'Task submitted successfully',
    data: { submission: task.submissions[task.submissions.length - 1] }
  });
});

// @desc    Review and grade submission
// @route   PATCH /api/tasks/:taskId/submissions/:submissionId/review
// @access  Private (Mentor/Admin only)
const reviewSubmission = asyncHandler(async (req, res) => {
  const { taskId, submissionId } = req.params;
  const { status, feedback, pointsAwarded } = req.body;

  if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only mentors and admins can review submissions'
    });
  }

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  const submission = task.submissions.id(submissionId);
  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Submission not found'
    });
  }

  // Update submission
  submission.status = status;
  submission.feedback = feedback;
  submission.pointsAwarded = Math.min(pointsAwarded || 0, task.points);
  submission.reviewedBy = req.user.id;
  submission.reviewedAt = new Date();

  await task.save();

  // If approved, update student points
  if (status === 'approved') {
    await User.findByIdAndUpdate(submission.student, {
      $inc: { points: submission.pointsAwarded }
    });
  }

  await task.populate('submissions.student', 'fullName usn section');
  await task.populate('submissions.reviewedBy', 'fullName role');

  res.json({
    success: true,
    message: 'Submission reviewed successfully',
    data: { submission }
  });
});

// @desc    Update task
// @route   PATCH /api/tasks/:id
// @access  Private (Creator only)
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check if user is the creator
  if (task.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only update your own tasks'
    });
  }

  const allowedFields = ['title', 'description', 'instructions', 'points', 'deadline', 'assignedToSections', 'type', 'difficulty', 'status'];
  const updates = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (updates.deadline) {
    updates.deadline = new Date(updates.deadline);
  }

  Object.assign(task, updates);
  await task.save();

  await task.populate('createdBy', 'fullName role');

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: { task }
  });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Creator/Admin only)
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check permissions
  if (task.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only delete your own tasks'
    });
  }

  await Task.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
});

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('createdBy', 'fullName role')
    .populate('submissions.student', 'fullName usn section')
    .populate('submissions.reviewedBy', 'fullName role');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // For students, check if they can access this task
  if (req.user.role === 'student') {
    if (!task.assignedToSections.includes(req.user.section)) {
      return res.status(403).json({
        success: false,
        message: 'This task is not assigned to your section'
      });
    }

    // Add submission status
    const submission = task.getSubmissionByStudent(req.user.id);
    const taskData = {
      ...task.toJSON(),
      mySubmission: submission || null,
      canSubmit: task.canStudentSubmit(req.user.id)
    };

    return res.json({
      success: true,
      data: { task: taskData }
    });
  }

  res.json({
    success: true,
    data: { task }
  });
});

// @desc    Get leaderboard
// @route   GET /api/tasks/leaderboard
// @access  Private
const getLeaderboard = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  
  const students = await User.find({ role: 'student' })
    .select('fullName usn section points')
    .sort({ points: -1, fullName: 1 })
    .limit(limit);

  // Add position numbers
  const leaderboard = students.map((student, index) => ({
    ...student.toJSON(),
    position: index + 1,
    isTopThree: index < 3
  }));

  res.json({
    success: true,
    data: { leaderboard }
  });
});

module.exports = {
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
};
