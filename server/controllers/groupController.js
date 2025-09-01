const Group = require('../models/Group');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private/Admin
const getGroups = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const groups = await Group.find(filter)
    .populate('students', 'fullName email usn role')
    .populate('mentors', 'fullName email role')
    .populate('createdBy', 'fullName email')
    .populate('submissions.submittedBy', 'fullName email')
    .populate('submissions.reviewedBy', 'fullName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Group.countDocuments(filter);

  res.json({
    success: true,
    data: {
      groups,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalGroups: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    }
  });
});

// @desc    Get single group
// @route   GET /api/groups/:id
// @access  Private
const getGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('students', 'fullName email usn role phone whatsappNumber')
    .populate('mentors', 'fullName email role phone')
    .populate('createdBy', 'fullName email')
    .populate('submissions.submittedBy', 'fullName email')
    .populate('submissions.reviewedBy', 'fullName email');

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  res.json({
    success: true,
    data: { group }
  });
});

// @desc    Create new group
// @route   POST /api/groups
// @access  Private/Admin
const createGroup = asyncHandler(async (req, res) => {
  const { name, description, students, mentors, project } = req.body;

  // Validate students exist and are students
  if (students && students.length > 0) {
    const studentUsers = await User.find({ 
      _id: { $in: students }, 
      role: 'student' 
    });
    
    if (studentUsers.length !== students.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected students are invalid'
      });
    }
  }

  // Validate mentors exist and are mentors/admins
  if (mentors && mentors.length > 0) {
    const mentorUsers = await User.find({ 
      _id: { $in: mentors }, 
      role: { $in: ['mentor', 'admin'] }
    });
    
    if (mentorUsers.length !== mentors.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected mentors are invalid'
      });
    }
  }

  const group = await Group.create({
    name,
    description,
    students: students || [],
    mentors: mentors || [],
    project: project || {},
    createdBy: req.user.id
  });

  const populatedGroup = await Group.findById(group._id)
    .populate('students', 'fullName email usn role')
    .populate('mentors', 'fullName email role')
    .populate('createdBy', 'fullName email');

  res.status(201).json({
    success: true,
    message: 'Group created successfully',
    data: { group: populatedGroup }
  });
});

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private/Admin
const updateGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  const { students, mentors } = req.body;

  // Validate students if provided
  if (students) {
    const studentUsers = await User.find({ 
      _id: { $in: students }, 
      role: 'student' 
    });
    
    if (studentUsers.length !== students.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected students are invalid'
      });
    }
  }

  // Validate mentors if provided
  if (mentors) {
    const mentorUsers = await User.find({ 
      _id: { $in: mentors }, 
      role: { $in: ['mentor', 'admin'] }
    });
    
    if (mentorUsers.length !== mentors.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected mentors are invalid'
      });
    }
  }

  const updatedGroup = await Group.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
    .populate('students', 'fullName email usn role')
    .populate('mentors', 'fullName email role')
    .populate('createdBy', 'fullName email');

  res.json({
    success: true,
    message: 'Group updated successfully',
    data: { group: updatedGroup }
  });
});

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private/Admin
const deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  await group.deleteOne();

  res.json({
    success: true,
    message: 'Group deleted successfully'
  });
});

// @desc    Get user's groups (for students/mentors)
// @route   GET /api/groups/my-groups
// @access  Private
const getMyGroups = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  let query = {};

  if (userRole === 'student') {
    query.students = userId;
  } else if (userRole === 'mentor') {
    query.mentors = userId;
  } else if (userRole === 'admin') {
    // Admins can see all groups, but this endpoint is for personal groups
    query.$or = [
      { createdBy: userId },
      { mentors: userId }
    ];
  }

  const groups = await Group.find(query)
    .populate('students', 'fullName email usn role')
    .populate('mentors', 'fullName email role')
    .populate('createdBy', 'fullName email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { groups }
  });
});

// @desc    Submit project for group
// @route   POST /api/groups/:id/submit
// @access  Private (Students in the group)
const submitProject = asyncHandler(async (req, res) => {
  const { submissionUrl, submissionText } = req.body;
  const groupId = req.params.id;
  const userId = req.user.id;

  const group = await Group.findById(groupId);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Check if user is a student in this group
  if (!group.students.includes(userId)) {
    return res.status(403).json({
      success: false,
      message: 'You are not a member of this group'
    });
  }

  // Check if user has already submitted
  const existingSubmission = group.submissions.find(
    sub => sub.submittedBy.toString() === userId
  );

  if (existingSubmission) {
    return res.status(400).json({
      success: false,
      message: 'You have already submitted for this project'
    });
  }

  group.submissions.push({
    submittedBy: userId,
    submissionUrl,
    submissionText,
    submittedAt: new Date()
  });

  await group.save();

  const updatedGroup = await Group.findById(groupId)
    .populate('submissions.submittedBy', 'fullName email');

  res.json({
    success: true,
    message: 'Project submitted successfully',
    data: { group: updatedGroup }
  });
});

// @desc    Review submission
// @route   PUT /api/groups/:id/submissions/:submissionId/review
// @access  Private (Mentors of the group or Admin)
const reviewSubmission = asyncHandler(async (req, res) => {
  const { status, feedback, grade } = req.body;
  const { id: groupId, submissionId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const group = await Group.findById(groupId);

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  // Check if user can review (mentor of this group or admin)
  if (userRole !== 'admin' && !group.mentors.includes(userId)) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to review submissions for this group'
    });
  }

  const submission = group.submissions.id(submissionId);

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Submission not found'
    });
  }

  submission.status = status;
  submission.feedback = feedback;
  submission.grade = grade;
  submission.reviewedBy = userId;
  submission.reviewedAt = new Date();

  await group.save();

  const updatedGroup = await Group.findById(groupId)
    .populate('submissions.submittedBy', 'fullName email')
    .populate('submissions.reviewedBy', 'fullName email');

  res.json({
    success: true,
    message: 'Submission reviewed successfully',
    data: { group: updatedGroup }
  });
});

// @desc    Get groups where the current user is a mentor
// @route   GET /api/groups/mentor-groups
// @access  Private/Mentor
const getMentorGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ 
    mentors: req.user.id 
  })
  .populate('students', 'fullName email usn profileImage points completedTasks')
  .populate('mentors', 'fullName email')
  .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: groups
  });
});

// @desc    Get all tasks assigned to students in a specific group
// @route   GET /api/groups/:id/student-tasks
// @access  Private/Mentor
const getGroupStudentTasks = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verify the user is a mentor of this group
  const group = await Group.findById(id);
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  if (!group.mentors.includes(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to view this group\'s tasks'
    });
  }

  // Import Task model
  const Task = require('../models/Task');

  // Get all tasks assigned to students in this group
  const studentIds = group.students;
  
  const tasks = await Task.find({
    'assignedTo.student': { $in: studentIds }
  })
  .populate('assignedTo.student', 'fullName email usn profileImage')
  .select('title description type points dueDate assignedTo')
  .sort({ createdAt: -1 });

  // Flatten the data to show individual student-task assignments
  const studentTasks = [];
  
  tasks.forEach(task => {
    task.assignedTo.forEach(assignment => {
      if (studentIds.includes(assignment.student._id)) {
        studentTasks.push({
          task: {
            _id: task._id,
            title: task.title,
            description: task.description,
            type: task.type,
            points: task.points,
            dueDate: task.dueDate
          },
          student: assignment.student,
          status: assignment.status,
          submittedAt: assignment.submittedAt,
          feedback: assignment.feedback,
          score: assignment.score
        });
      }
    });
  });

  res.status(200).json({
    success: true,
    data: studentTasks
  });
});

module.exports = {
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
};
