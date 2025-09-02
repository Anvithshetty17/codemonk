const User = require('../models/User');
const OTP = require('../models/OTP');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../utils/tokenUtils');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { 
    fullName, 
    usn,
    email, 
    password, 
    phone, 
    whatsappNumber,
    section,
    verificationToken
  } = req.body;

  // Check if email verification is provided
  if (!verificationToken) {
    return res.status(400).json({
      success: false,
      message: 'Email verification required. Please verify your email first.'
    });
  }

  // Check if there's a verified OTP for this email
  const verifiedOTP = await OTP.findOne({
    email: email.toLowerCase(),
    purpose: 'registration',
    isUsed: true
  });

  if (!verifiedOTP) {
    return res.status(400).json({
      success: false,
      message: 'Email not verified. Please verify your email first.'
    });
  }

  // Check if user already exists by email
  const existingUserByEmail = await User.findOne({ email });
  if (existingUserByEmail) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Check if user already exists by USN
  const existingUserByUSN = await User.findOne({ usn: usn.toUpperCase() });
  if (existingUserByUSN) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this USN'
    });
  }

  // Create user
  const user = await User.create({
    fullName,
    usn: usn.toUpperCase(),
    email,
    password,
    phone,
    whatsappNumber,
    section: section.toUpperCase(),
    role: 'student' // Explicitly set role to student for new registrations
  });

  // Clean up used OTP
  await OTP.deleteMany({
    email: email.toLowerCase(),
    purpose: 'registration'
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful! Please log in to continue.',
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        usn: user.usn,
        email: user.email,
        phone: user.phone,
        whatsappNumber: user.whatsappNumber,
        role: user.role,
        createdAt: user.createdAt
      }
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Generate JWT token
  const token = generateToken(user._id);
  
  // Set HTTP-only cookie
  setTokenCookie(res, token);

  res.json({
    success: true,
    message: 'Login successful',
    token, // Also send token in response for localStorage storage
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        usn: user.usn,
        email: user.email,
        phone: user.phone,
        whatsappNumber: user.whatsappNumber,
        profileImage: user.profileImage,
        linkedinUrl: user.linkedinUrl,
        githubUrl: user.githubUrl,
        portfolioUrl: user.portfolioUrl,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        usn: user.usn,
        email: user.email,
        phone: user.phone,
        whatsappNumber: user.whatsappNumber,
        profileImage: user.profileImage,
        linkedinUrl: user.linkedinUrl,
        githubUrl: user.githubUrl,
        portfolioUrl: user.portfolioUrl,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // If USN is being updated, check if it's already taken by another user
  if (req.body.usn && req.body.usn.toUpperCase() !== user.usn) {
    const existingUser = await User.findOne({ 
      usn: req.body.usn.toUpperCase(),
      _id: { $ne: user._id }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'USN is already taken by another user'
      });
    }
  }

  // Update allowed fields
  const allowedUpdates = ['fullName', 'usn', 'phone', 'whatsappNumber', 'linkedinUrl', 'githubUrl', 'portfolioUrl'];
  allowedUpdates.forEach(update => {
    if (req.body[update] !== undefined) {
      if (update === 'usn') {
        user[update] = req.body[update].toUpperCase();
      } else {
        user[update] = req.body[update];
      }
    }
  });

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        usn: user.usn,
        email: user.email,
        phone: user.phone,
        whatsappNumber: user.whatsappNumber,
        profileImage: user.profileImage,
        linkedinUrl: user.linkedinUrl,
        githubUrl: user.githubUrl,
        portfolioUrl: user.portfolioUrl,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile
};
