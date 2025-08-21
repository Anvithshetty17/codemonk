const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter - get all users, not just students
  const filter = {};
  if (req.query.role) {
    filter.role = req.query.role;
  }
  if (req.query.areasOfInterest) {
    filter.areasOfInterest = { $in: [req.query.areasOfInterest] };
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    }
  });
});

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        whatsappNumber: user.whatsappNumber,
        areasOfInterest: user.areasOfInterest,
        previousExperience: user.previousExperience,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});

// @desc    Update user profile
// @route   PATCH /api/users/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone, whatsappNumber, areasOfInterest, previousExperience } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Process areas of interest
  let processedAreasOfInterest = user.areasOfInterest;
  if (areasOfInterest !== undefined) {
    if (typeof areasOfInterest === 'string') {
      processedAreasOfInterest = areasOfInterest.split(',').map(area => area.trim()).filter(area => area);
    } else if (Array.isArray(areasOfInterest)) {
      processedAreasOfInterest = areasOfInterest.filter(area => area && area.trim());
    }
  }

  // Update fields
  if (fullName !== undefined) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;
  if (whatsappNumber !== undefined) user.whatsappNumber = whatsappNumber;
  if (areasOfInterest !== undefined) user.areasOfInterest = processedAreasOfInterest;
  if (previousExperience !== undefined) user.previousExperience = previousExperience;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        whatsappNumber: user.whatsappNumber,
        areasOfInterest: user.areasOfInterest,
        previousExperience: user.previousExperience,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});

// @desc    Change user password
// @route   PATCH /api/users/me/password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Update user role (admin only)
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  // Validate role
  const validRoles = ['student', 'mentor', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role. Must be one of: student, mentor, admin'
    });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent changing own role to non-admin
  if (req.user.id === userId && role !== 'admin') {
    return res.status(400).json({
      success: false,
      message: 'You cannot change your own admin role'
    });
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    message: `User role updated to ${role} successfully`,
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        updatedAt: user.updatedAt
      }
    }
  });
});

module.exports = {
  getUsers,
  getMyProfile,
  updateProfile,
  changePassword,
  updateUserRole
};
