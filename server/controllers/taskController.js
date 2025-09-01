const Task = require('../models/Task');
const User = require('../models/User');
const Group = require('../models/Group');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    type,
    difficulty,
    points,
    content,
    assignedStudents, // Array of {studentId, dueDate}
    tags,
    estimatedTime
  } = req.body;

  // Validate assigned students
  if (assignedStudents && assignedStudents.length > 0) {
    const studentIds = assignedStudents.map(assignment => assignment.studentId);
    const students = await User.find({ 
      _id: { $in: studentIds }, 
      role: 'student' 
    });
    
    if (students.length !== studentIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more assigned users are not students'
      });
    }
  }

  const task = await Task.create({
    title,
    description,
    type,
    difficulty,
    points,
    content,
    assignedTo: assignedStudents ? assignedStudents.map(assignment => ({
      student: assignment.studentId,
      dueDate: assignment.dueDate,
      assignedAt: new Date()
    })) : [],
    createdBy: req.user.id,
    tags,
    estimatedTime
  });

  await task.populate([
    { path: 'assignedTo.student', select: 'fullName email usn' },
    { path: 'createdBy', select: 'fullName email' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task }
  });
});

// @desc    Get all tasks (with filters)
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter based on user role
  let filter = { isActive: true };
  
  if (req.query.type) {
    filter.type = req.query.type;
  }
  
  if (req.query.difficulty) {
    filter.difficulty = req.query.difficulty;
  }

  if (req.query.tag) {
    filter.tags = { $in: [req.query.tag] };
  }

  // If user is a student, only show tasks assigned to them
  if (req.user.role === 'student') {
    filter['assignedTo.student'] = req.user.id;
  }

  // If user is a mentor, show tasks assigned to students in their groups
  if (req.user.role === 'mentor') {
    const mentorGroups = await Group.find({ mentors: req.user.id });
    const studentIds = mentorGroups.reduce((acc, group) => [...acc, ...group.students], []);
    filter['assignedTo.student'] = { $in: studentIds };
  }

  const tasks = await Task.find(filter)
    .populate([
      { path: 'assignedTo.student', select: 'fullName email usn points' },
      { path: 'assignedTo.reviewedBy', select: 'fullName email' },
      { path: 'createdBy', select: 'fullName email' }
    ])
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Task.countDocuments(filter);

  res.json({
    success: true,
    data: {
      tasks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTasks: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    }
  });
});

// @desc    Get student's tasks
// @route   GET /api/tasks/my-tasks
// @access  Private/Student
const getMyTasks = asyncHandler(async (req, res) => {
  const status = req.query.status;
  
  let filter = {
    'assignedTo.student': req.user.id,
    isActive: true
  };

  if (status) {
    filter['assignedTo.status'] = status;
  }

  const tasks = await Task.find(filter)
    .populate([
      { path: 'assignedTo.reviewedBy', select: 'fullName email' },
      { path: 'createdBy', select: 'fullName email' }
    ])
    .sort({ 'assignedTo.dueDate': 1 });

  // Filter and format the response for the specific student
  const formattedTasks = tasks.map(task => {
    const studentAssignment = task.assignedTo.find(
      assignment => assignment.student.toString() === req.user.id
    );
    
    return {
      ...task.toJSON(),
      assignment: studentAssignment,
      assignedTo: undefined // Remove all assignments for privacy
    };
  });

  res.json({
    success: true,
    data: { tasks: formattedTasks }
  });
});

// @desc    Submit task solution
// @route   POST /api/tasks/:id/submit
// @access  Private/Student
const submitTask = asyncHandler(async (req, res) => {
  const { code, answers, notes, submissionUrl } = req.body;
  const taskId = req.params.id;

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  const assignmentIndex = task.assignedTo.findIndex(
    assignment => assignment.student.toString() === req.user.id
  );

  if (assignmentIndex === -1) {
    return res.status(403).json({
      success: false,
      message: 'Task not assigned to you'
    });
  }

  const assignment = task.assignedTo[assignmentIndex];
  
  if (assignment.status === 'Completed') {
    return res.status(400).json({
      success: false,
      message: 'Task already completed'
    });
  }

  // Update submission
  assignment.submission = {
    code,
    answers,
    notes,
    submissionUrl
  };
  assignment.submittedAt = new Date();
  assignment.status = 'Submitted';

  // If it was not started before, mark as started
  if (!assignment.startedAt) {
    assignment.startedAt = new Date();
  }

  await task.save();

  res.json({
    success: true,
    message: 'Task submitted successfully',
    data: { assignment }
  });
});

// @desc    Start working on a task
// @route   POST /api/tasks/:id/start
// @access  Private/Student
const startTask = asyncHandler(async (req, res) => {
  const taskId = req.params.id;

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  const assignmentIndex = task.assignedTo.findIndex(
    assignment => assignment.student.toString() === req.user.id
  );

  if (assignmentIndex === -1) {
    return res.status(403).json({
      success: false,
      message: 'Task not assigned to you'
    });
  }

  const assignment = task.assignedTo[assignmentIndex];
  
  if (assignment.startedAt) {
    return res.status(400).json({
      success: false,
      message: 'Task already started'
    });
  }

  assignment.startedAt = new Date();
  assignment.status = 'In Progress';

  await task.save();

  res.json({
    success: true,
    message: 'Task started successfully',
    data: { assignment }
  });
});

// @desc    Review and grade task submission
// @route   POST /api/tasks/:id/review
// @access  Private/Admin/Mentor
const reviewTask = asyncHandler(async (req, res) => {
  const { studentId, grade, feedback, pointsAwarded } = req.body;
  const taskId = req.params.id;

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  const assignmentIndex = task.assignedTo.findIndex(
    assignment => assignment.student.toString() === studentId
  );

  if (assignmentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  const assignment = task.assignedTo[assignmentIndex];
  
  if (assignment.status !== 'Submitted') {
    return res.status(400).json({
      success: false,
      message: 'Task must be submitted before review'
    });
  }

  // Validate points awarded
  const maxPoints = task.points;
  if (pointsAwarded < 0 || pointsAwarded > maxPoints) {
    return res.status(400).json({
      success: false,
      message: `Points awarded must be between 0 and ${maxPoints}`
    });
  }

  // Update assignment
  assignment.grade = grade;
  assignment.feedback = feedback;
  assignment.pointsAwarded = pointsAwarded;
  assignment.reviewedBy = req.user.id;
  assignment.reviewedAt = new Date();
  assignment.completedAt = new Date();
  assignment.status = 'Completed';

  await task.save();

  // Update student's total points and completed tasks
  const student = await User.findById(studentId);
  student.points += pointsAwarded;
  student.completedTasks += 1;
  await student.save();

  // Update leaderboard rankings
  await updateLeaderboardRankings();

  res.json({
    success: true,
    message: 'Task reviewed successfully',
    data: { assignment }
  });
});

// @desc    Get leaderboard
// @route   GET /api/tasks/leaderboard
// @access  Private
const getLeaderboard = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  
  const students = await User.find({ role: 'student' })
    .select('fullName email usn points completedTasks rank profileImage')
    .sort({ points: -1, completedTasks: -1, fullName: 1 })
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

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private/Admin
const getTaskStats = asyncHandler(async (req, res) => {
  const totalTasks = await Task.countDocuments({ isActive: true });
  const totalAssignments = await Task.aggregate([
    { $match: { isActive: true } },
    { $unwind: '$assignedTo' },
    { $count: 'total' }
  ]);

  const completedAssignments = await Task.aggregate([
    { $match: { isActive: true } },
    { $unwind: '$assignedTo' },
    { $match: { 'assignedTo.status': 'Completed' } },
    { $count: 'total' }
  ]);

  const pendingReviews = await Task.aggregate([
    { $match: { isActive: true } },
    { $unwind: '$assignedTo' },
    { $match: { 'assignedTo.status': 'Submitted' } },
    { $count: 'total' }
  ]);

  const avgPoints = await User.aggregate([
    { $match: { role: 'student' } },
    { $group: { _id: null, avgPoints: { $avg: '$points' } } }
  ]);

  res.json({
    success: true,
    data: {
      totalTasks,
      totalAssignments: totalAssignments[0]?.total || 0,
      completedAssignments: completedAssignments[0]?.total || 0,
      pendingReviews: pendingReviews[0]?.total || 0,
      averageStudentPoints: avgPoints[0]?.avgPoints || 0
    }
  });
});

// Helper function to update leaderboard rankings
const updateLeaderboardRankings = async () => {
  const students = await User.find({ role: 'student' })
    .sort({ points: -1, completedTasks: -1, fullName: 1 });

  for (let i = 0; i < students.length; i++) {
    students[i].rank = i + 1;
    await students[i].save();
  }
};

module.exports = {
  createTask,
  getTasks,
  getMyTasks,
  submitTask,
  startTask,
  reviewTask,
  getLeaderboard,
  getTaskStats
};
