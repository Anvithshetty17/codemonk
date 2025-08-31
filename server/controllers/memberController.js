const Member = require('../models/Member');
const asyncHandler = require('../utils/asyncHandler');
const path = require('path');
const fs = require('fs');

// @desc    Get all team members
// @route   GET /api/members
// @access  Public
const getMembers = asyncHandler(async (req, res) => {
  const members = await Member.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      members
    }
  });
});

// @desc    Create new team member
// @route   POST /api/members
// @access  Private/Admin
const createMember = asyncHandler(async (req, res) => {
  const { name, role, description, email, image, socialLinks } = req.body;

  const member = await Member.create({
    name,
    role,
    description,
    email,
    image,
    socialLinks: socialLinks || {}
  });

  res.status(201).json({
    success: true,
    message: 'Team member created successfully',
    data: {
      member
    }
  });
});

// @desc    Update team member
// @route   PUT /api/members/:id
// @access  Private/Admin
const updateMember = asyncHandler(async (req, res) => {
  const { name, role, description, email, image, socialLinks } = req.body;

  let member = await Member.findById(req.params.id);

  if (!member) {
    return res.status(404).json({
      success: false,
      message: 'Team member not found'
    });
  }

  member = await Member.findByIdAndUpdate(
    req.params.id,
    {
      name,
      role,
      description,
      email,
      image,
      socialLinks: socialLinks || {}
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.json({
    success: true,
    message: 'Team member updated successfully',
    data: {
      member
    }
  });
});

// @desc    Upload team member image
// @route   POST /api/members/upload-image
// @access  Private/Admin
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file uploaded'
    });
  }

  // Return the filename that can be used to reference the image
  const imageUrl = req.file.filename;

  res.json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      imageUrl
    }
  });
});

// @desc    Delete team member
// @route   DELETE /api/members/:id
// @access  Private/Admin
const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (!member) {
    return res.status(404).json({
      success: false,
      message: 'Team member not found'
    });
  }

  await Member.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Team member deleted successfully'
  });
});

module.exports = {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  uploadImage
};
