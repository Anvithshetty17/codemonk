const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Team = require('../models/Team');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
router.get('/', auth, asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status,
    priority,
    category,
    teamId,
    dueDate,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};
  
  // If user is a student, only show tasks from teams they're part of
  if (req.user.role === 'student') {
    const userTeams = await Team.find({ 
      'members.user': req.user.id,
      'members.status': 'active'
    }).select('_id');
    
    query.team = { $in: userTeams.map(team => team._id) };
  }

  if (status && status !== 'all') {
    query.status = status;
  }

  if (priority && priority !== 'all') {
    query.priority = priority;
  }

  if (category && category !== 'all') {
    query.category = category;
  }

  if (teamId) {
    query.team = teamId;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  if (dueDate) {
    const today = new Date();
    switch (dueDate) {
      case 'overdue':
        query.dueDate = { $lt: today };
        query.status = { $ne: 'completed' };
        break;
      case 'today':
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        query.dueDate = { $gte: today, $lte: endOfDay };
        break;
      case 'thisWeek':
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 7);
        query.dueDate = { $gte: today, $lte: endOfWeek };
        break;
    }
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const tasks = await Task.find(query)
    .populate('team', 'name description')
    .populate('creator', 'fullName email')
    .populate('assignedTo', 'fullName email')
    .populate('submissions.student', 'fullName email')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const total = await Task.countDocuments(query);

  res.json({
    success: true,
    data: {
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
router.get('/:id', auth, asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('team', 'name description mentors members')
    .populate('creator', 'fullName email role')
    .populate('assignedTo', 'fullName email role')
    .populate('submissions.student', 'fullName email role')
    .populate('submissions.feedback.reviewedBy', 'fullName email role');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check if user has access to this task
  const team = await Team.findById(task.team);
  const isMember = team.members.some(
    member => member.user.toString() === req.user.id && member.status === 'active'
  );
  const isMentor = team.mentors.some(mentor => mentor.toString() === req.user.id);
  const isCreator = team.creator.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isMember && !isMentor && !isCreator && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this task'
    });
  }

  res.json({
    success: true,
    data: { task }
  });
}));

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Mentor/Admin only)
router.post('/', auth, requireRole(['mentor', 'admin']), asyncHandler(async (req, res) => {
  const {
    title,
    description,
    teamId,
    assignedTo,
    dueDate,
    priority,
    category,
    requirements,
    resources,
    tags
  } = req.body;

  // Check if team exists and user has permission
  const team = await Team.findById(teamId);
  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  const isMentor = team.mentors.some(mentor => mentor.toString() === req.user.id);
  const isCreator = team.creator.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isMentor && !isCreator && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to create tasks for this team'
    });
  }

  const task = await Task.create({
    title,
    description,
    team: teamId,
    creator: req.user.id,
    assignedTo: assignedTo || [],
    dueDate,
    priority,
    category,
    requirements,
    resources,
    tags
  });

  const populatedTask = await Task.findById(task._id)
    .populate('team', 'name description')
    .populate('creator', 'fullName email')
    .populate('assignedTo', 'fullName email');

  res.status(201).json({
    success: true,
    data: { task: populatedTask }
  });
}));

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Creator/Mentor/Admin only)
router.put('/:id', auth, asyncHandler(async (req, res) => {
  let task = await Task.findById(req.params.id).populate('team');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check permissions
  const isMentor = task.team.mentors.some(mentor => mentor.toString() === req.user.id);
  const isTeamCreator = task.team.creator.toString() === req.user.id;
  const isTaskCreator = task.creator.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isMentor && !isTeamCreator && !isTaskCreator && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this task'
    });
  }

  const {
    title,
    description,
    assignedTo,
    dueDate,
    priority,
    status,
    category,
    requirements,
    resources,
    tags
  } = req.body;

  task = await Task.findByIdAndUpdate(
    req.params.id,
    {
      title,
      description,
      assignedTo,
      dueDate,
      priority,
      status,
      category,
      requirements,
      resources,
      tags
    },
    {
      new: true,
      runValidators: true
    }
  ).populate('team', 'name description')
   .populate('creator', 'fullName email')
   .populate('assignedTo', 'fullName email');

  res.json({
    success: true,
    data: { task }
  });
}));

// @desc    Submit task
// @route   POST /api/tasks/:id/submit
// @access  Private (Students only)
router.post('/:id/submit', auth, asyncHandler(async (req, res) => {
  const { content, attachments } = req.body;
  
  const task = await Task.findById(req.params.id).populate('team');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check if user is a member of the team
  const isMember = task.team.members.some(
    member => member.user.toString() === req.user.id && member.status === 'active'
  );

  if (!isMember) {
    return res.status(403).json({
      success: false,
      message: 'You must be a team member to submit this task'
    });
  }

  // Check if task is active
  if (task.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'This task is not accepting submissions'
    });
  }

  // Check if user has already submitted
  const existingSubmission = task.submissions.find(
    sub => sub.student.toString() === req.user.id
  );

  if (existingSubmission) {
    return res.status(400).json({
      success: false,
      message: 'You have already submitted this task'
    });
  }

  // Add submission
  task.submissions.push({
    student: req.user.id,
    content,
    attachments: attachments || [],
    submittedAt: new Date(),
    status: 'submitted'
  });

  await task.save();

  const updatedTask = await Task.findById(task._id)
    .populate('submissions.student', 'fullName email');

  res.json({
    success: true,
    message: 'Task submitted successfully',
    data: { task: updatedTask }
  });
}));

// @desc    Review submission
// @route   PUT /api/tasks/:id/submissions/:submissionId/review
// @access  Private (Mentor/Admin only)
router.put('/:id/submissions/:submissionId/review', auth, requireRole(['mentor', 'admin']), asyncHandler(async (req, res) => {
  const { status, comment, rating } = req.body;
  
  const task = await Task.findById(req.params.id).populate('team');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check permissions
  const isMentor = task.team.mentors.some(mentor => mentor.toString() === req.user.id);
  const isTeamCreator = task.team.creator.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isMentor && !isTeamCreator && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to review submissions for this task'
    });
  }

  // Find submission
  const submission = task.submissions.id(req.params.submissionId);
  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Submission not found'
    });
  }

  // Update submission
  submission.status = status;
  submission.feedback = {
    comment,
    rating,
    reviewedBy: req.user.id,
    reviewedAt: new Date()
  };

  await task.save();

  const updatedTask = await Task.findById(task._id)
    .populate('submissions.student', 'fullName email')
    .populate('submissions.feedback.reviewedBy', 'fullName email');

  res.json({
    success: true,
    message: 'Submission reviewed successfully',
    data: { task: updatedTask }
  });
}));

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Creator/Admin only)
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('team');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Check permissions
  const isTeamCreator = task.team.creator.toString() === req.user.id;
  const isTaskCreator = task.creator.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isTeamCreator && !isTaskCreator && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this task'
    });
  }

  await Task.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
}));

// @desc    Get team tasks
// @route   GET /api/tasks/team/:teamId
// @access  Private
router.get('/team/:teamId', auth, asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { status, priority } = req.query;

  // Check if user has access to this team
  const team = await Team.findById(teamId);
  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  const isMember = team.members.some(
    member => member.user.toString() === req.user.id && member.status === 'active'
  );
  const isMentor = team.mentors.some(mentor => mentor.toString() === req.user.id);
  const isCreator = team.creator.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isMember && !isMentor && !isCreator && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view tasks for this team'
    });
  }

  const query = { team: teamId };
  
  if (status && status !== 'all') {
    query.status = status;
  }
  
  if (priority && priority !== 'all') {
    query.priority = priority;
  }

  const tasks = await Task.find(query)
    .populate('creator', 'fullName email')
    .populate('assignedTo', 'fullName email')
    .populate('submissions.student', 'fullName email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { tasks }
  });
}));

// @desc    Get user's task submissions
// @route   GET /api/tasks/submissions/me
// @access  Private
router.get('/submissions/me', auth, asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    'submissions.student': req.user.id
  })
    .populate('team', 'name description')
    .populate('creator', 'fullName email')
    .populate('submissions.student', 'fullName email')
    .populate('submissions.feedback.reviewedBy', 'fullName email')
    .sort({ 'submissions.submittedAt': -1 });

  // Filter to only include user's submissions
  const userSubmissions = tasks.map(task => {
    const userSubmission = task.submissions.find(
      sub => sub.student._id.toString() === req.user.id
    );
    
    return {
      task: {
        _id: task._id,
        title: task.title,
        description: task.description,
        team: task.team,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status
      },
      submission: userSubmission
    };
  });

  res.json({
    success: true,
    data: { submissions: userSubmissions }
  });
}));

module.exports = router;
