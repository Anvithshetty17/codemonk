const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    category, 
    search,
    isActive = true,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = { isActive };
  
  if (category && category !== 'all') {
    query.category = category;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const teams = await Team.find(query)
    .populate('creator', 'fullName email')
    .populate('mentors', 'fullName email')
    .populate('members.user', 'fullName email')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const total = await Team.countDocuments(query);

  res.json({
    success: true,
    data: {
      teams,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate('creator', 'fullName email role')
    .populate('mentors', 'fullName email role')
    .populate('members.user', 'fullName email role areasOfInterest');

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  res.json({
    success: true,
    data: { team }
  });
}));

// @desc    Create new team
// @route   POST /api/teams
// @access  Private (Mentor/Admin only)
router.post('/', auth, requireRole(['mentor', 'admin']), asyncHandler(async (req, res) => {
  const {
    name,
    description,
    maxMembers,
    category,
    tags
  } = req.body;

  const team = await Team.create({
    name,
    description,
    creator: req.user.id,
    mentors: [req.user.id],
    maxMembers,
    category,
    tags
  });

  const populatedTeam = await Team.findById(team._id)
    .populate('creator', 'fullName email')
    .populate('mentors', 'fullName email');

  res.status(201).json({
    success: true,
    data: { team: populatedTeam }
  });
}));

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Creator/Mentor/Admin only)
router.put('/:id', auth, asyncHandler(async (req, res) => {
  let team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is creator, mentor of the team, or admin
  const isCreator = team.creator.toString() === req.user.id;
  const isMentor = team.mentors.some(mentor => mentor.toString() === req.user.id);
  const isAdmin = req.user.role === 'admin';

  if (!isCreator && !isMentor && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this team'
    });
  }

  const {
    name,
    description,
    maxMembers,
    category,
    tags,
    isActive
  } = req.body;

  team = await Team.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      maxMembers,
      category,
      tags,
      isActive
    },
    {
      new: true,
      runValidators: true
    }
  ).populate('creator', 'fullName email')
   .populate('mentors', 'fullName email')
   .populate('members.user', 'fullName email');

  res.json({
    success: true,
    data: { team }
  });
}));

// @desc    Join team
// @route   POST /api/teams/:id/join
// @access  Private (Students only)
router.post('/:id/join', auth, asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  if (!team.isActive) {
    return res.status(400).json({
      success: false,
      message: 'This team is not currently accepting new members'
    });
  }

  // Check if team is full
  if (team.memberCount >= team.maxMembers) {
    return res.status(400).json({
      success: false,
      message: 'Team is full'
    });
  }

  // Check if user is already a member
  const isAlreadyMember = team.members.some(
    member => member.user.toString() === req.user.id && member.status === 'active'
  );

  if (isAlreadyMember) {
    return res.status(400).json({
      success: false,
      message: 'You are already a member of this team'
    });
  }

  // Add user to team
  team.members.push({
    user: req.user.id,
    joinedAt: new Date(),
    status: 'active'
  });

  await team.save();

  const updatedTeam = await Team.findById(team._id)
    .populate('creator', 'fullName email')
    .populate('mentors', 'fullName email')
    .populate('members.user', 'fullName email');

  res.json({
    success: true,
    message: 'Successfully joined the team',
    data: { team: updatedTeam }
  });
}));

// @desc    Leave team
// @route   POST /api/teams/:id/leave
// @access  Private
router.post('/:id/leave', auth, asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Find the member
  const memberIndex = team.members.findIndex(
    member => member.user.toString() === req.user.id && member.status === 'active'
  );

  if (memberIndex === -1) {
    return res.status(400).json({
      success: false,
      message: 'You are not a member of this team'
    });
  }

  // Remove member from team
  team.members[memberIndex].status = 'inactive';
  await team.save();

  res.json({
    success: true,
    message: 'Successfully left the team'
  });
}));

// @desc    Add mentor to team
// @route   POST /api/teams/:id/mentors
// @access  Private (Creator/Admin only)
router.post('/:id/mentors', auth, asyncHandler(async (req, res) => {
  const { mentorId } = req.body;
  const team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is creator or admin
  const isCreator = team.creator.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isCreator && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to add mentors to this team'
    });
  }

  // Check if mentor exists and has mentor/admin role
  const mentor = await User.findById(mentorId);
  if (!mentor || !['mentor', 'admin'].includes(mentor.role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid mentor'
    });
  }

  // Check if already a mentor
  if (team.mentors.includes(mentorId)) {
    return res.status(400).json({
      success: false,
      message: 'User is already a mentor of this team'
    });
  }

  team.mentors.push(mentorId);
  await team.save();

  const updatedTeam = await Team.findById(team._id)
    .populate('creator', 'fullName email')
    .populate('mentors', 'fullName email')
    .populate('members.user', 'fullName email');

  res.json({
    success: true,
    message: 'Mentor added successfully',
    data: { team: updatedTeam }
  });
}));

// @desc    Remove mentor from team
// @route   DELETE /api/teams/:id/mentors/:mentorId
// @access  Private (Creator/Admin only)
router.delete('/:id/mentors/:mentorId', auth, asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is creator or admin
  const isCreator = team.creator.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isCreator && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to remove mentors from this team'
    });
  }

  // Cannot remove the creator
  if (team.creator.toString() === req.params.mentorId) {
    return res.status(400).json({
      success: false,
      message: 'Cannot remove the team creator'
    });
  }

  team.mentors = team.mentors.filter(mentor => mentor.toString() !== req.params.mentorId);
  await team.save();

  res.json({
    success: true,
    message: 'Mentor removed successfully'
  });
}));

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Creator/Admin only)
router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: 'Team not found'
    });
  }

  // Check if user is creator or admin
  const isCreator = team.creator.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isCreator && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this team'
    });
  }

  await Team.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Team deleted successfully'
  });
}));

// @desc    Get user's teams
// @route   GET /api/teams/user/me
// @access  Private
router.get('/user/me', auth, asyncHandler(async (req, res) => {
  const createdTeams = await Team.find({ creator: req.user.id })
    .populate('creator', 'fullName email')
    .populate('mentors', 'fullName email')
    .populate('members.user', 'fullName email');

  const mentoredTeams = await Team.find({ 
    mentors: req.user.id,
    creator: { $ne: req.user.id }
  })
    .populate('creator', 'fullName email')
    .populate('mentors', 'fullName email')
    .populate('members.user', 'fullName email');

  const joinedTeams = await Team.find({ 
    'members.user': req.user.id,
    'members.status': 'active'
  })
    .populate('creator', 'fullName email')
    .populate('mentors', 'fullName email')
    .populate('members.user', 'fullName email');

  res.json({
    success: true,
    data: {
      createdTeams,
      mentoredTeams,
      joinedTeams
    }
  });
}));

module.exports = router;
