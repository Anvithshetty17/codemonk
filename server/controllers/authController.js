const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken, setTokenCookie, clearTokenCookie } = require('../utils/tokenUtils');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { 
    fullName, 
    email, 
    password, 
    phone, 
    whatsappNumber, 
    areasOfInterest, 
    previousExperience,
    codingSkillsRating,
    favoriteProgrammingLanguage,
    favoriteLanguageReason,
    proudProject,
    debuggingProcess
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Process areas of interest
  let processedAreasOfInterest = [];
  if (typeof areasOfInterest === 'string') {
    processedAreasOfInterest = areasOfInterest.split(',').map(area => area.trim()).filter(area => area);
  } else if (Array.isArray(areasOfInterest)) {
    processedAreasOfInterest = areasOfInterest.filter(area => area && area.trim());
  }

  // Create user
  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    whatsappNumber,
    areasOfInterest: processedAreasOfInterest,
    previousExperience,
    codingSkillsRating: parseInt(codingSkillsRating),
    favoriteProgrammingLanguage,
    favoriteLanguageReason,
    proudProject,
    debuggingProcess
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful! Please log in to continue.',
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        whatsappNumber: user.whatsappNumber,
        areasOfInterest: user.areasOfInterest,
        previousExperience: user.previousExperience,
        codingSkillsRating: user.codingSkillsRating,
        favoriteProgrammingLanguage: user.favoriteProgrammingLanguage,
        favoriteLanguageReason: user.favoriteLanguageReason,
        proudProject: user.proudProject,
        debuggingProcess: user.debuggingProcess,
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

  // Generate token and set cookie
  const token = generateToken(user._id);
  setTokenCookie(res, token);

  res.json({
    success: true,
    message: 'Login successful',
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
        createdAt: user.createdAt
      }
    }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
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

module.exports = {
  register,
  login,
  getMe,
  logout
};
