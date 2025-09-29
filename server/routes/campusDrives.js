const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const CampusDrive = require('../models/CampusDrive');
const { body, validationResult } = require('express-validator');

// Validation rules
const campusDriveValidation = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  
  body('jobDescription')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Job description must be between 10 and 2000 characters'),
  
  body('dateOfFirstRound')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Date of first round cannot be in the past');
      }
      return true;
    }),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Mass Recruitment', 'Dream Company', 'Super Dream Company'])
    .withMessage('Invalid category'),
  
  body('package')
    .trim()
    .notEmpty()
    .withMessage('Package information is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Package information must be between 3 and 100 characters'),
  
  body('studyMaterialLink')
    .optional()
    .isURL()
    .withMessage('Study material link must be a valid URL'),
  
  body('companyWebsite')
    .optional()
    .isURL()
    .withMessage('Company website must be a valid URL'),
  
  body('additionalNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Additional notes must not exceed 1000 characters'),
  
  body('priority')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('Priority must be between 0 and 10')
];

// @desc    Get all campus drives (public)
// @route   GET /api/campus-drives
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, active = 'true', sort = 'dateOfFirstRound' } = req.query;
    
    // Build query
    const query = {};
    if (active === 'true') query.isActive = true;
    if (category && category !== 'all') query.category = category;
    
    // Build sort options
    let sortOptions = {};
    switch (sort) {
      case 'dateOfFirstRound':
        sortOptions = { dateOfFirstRound: 1, priority: -1 };
        break;
      case 'priority':
        sortOptions = { priority: -1, dateOfFirstRound: 1 };
        break;
      case 'companyName':
        sortOptions = { companyName: 1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { dateOfFirstRound: 1, priority: -1 };
    }
    
    const campusDrives = await CampusDrive.find(query)
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .lean();
    
    res.json({
      success: true,
      count: campusDrives.length,
      data: campusDrives
    });
  } catch (error) {
    console.error('Error fetching campus drives:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campus drives'
    });
  }
});

// @desc    Get campus drive categories
// @route   GET /api/campus-drives/categories
// @access  Public
router.get('/categories', (req, res) => {
  const categories = [
    'Mass Recruitment',
    'Dream Company',
    'Super Dream Company'
  ];
  
  res.json({
    success: true,
    data: categories
  });
});

// @desc    Get single campus drive
// @route   GET /api/campus-drives/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const campusDrive = await CampusDrive.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!campusDrive) {
      return res.status(404).json({
        success: false,
        message: 'Campus drive not found'
      });
    }
    
    res.json({
      success: true,
      data: campusDrive
    });
  } catch (error) {
    console.error('Error fetching campus drive:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campus drive'
    });
  }
});

// @desc    Create new campus drive
// @route   POST /api/campus-drives
// @access  Private/Admin
router.post('/', adminAuth, campusDriveValidation, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const campusDriveData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const campusDrive = await CampusDrive.create(campusDriveData);
    
    await campusDrive.populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Campus drive created successfully',
      data: campusDrive
    });
  } catch (error) {
    console.error('Error creating campus drive:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating campus drive'
    });
  }
});

// @desc    Update campus drive
// @route   PUT /api/campus-drives/:id
// @access  Private/Admin
router.put('/:id', adminAuth, campusDriveValidation, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const campusDrive = await CampusDrive.findById(req.params.id);
    
    if (!campusDrive) {
      return res.status(404).json({
        success: false,
        message: 'Campus drive not found'
      });
    }
    
    const updatedCampusDrive = await CampusDrive.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'name email');
    
    res.json({
      success: true,
      message: 'Campus drive updated successfully',
      data: updatedCampusDrive
    });
  } catch (error) {
    console.error('Error updating campus drive:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating campus drive'
    });
  }
});

// @desc    Delete campus drive
// @route   DELETE /api/campus-drives/:id
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const campusDrive = await CampusDrive.findById(req.params.id);
    
    if (!campusDrive) {
      return res.status(404).json({
        success: false,
        message: 'Campus drive not found'
      });
    }
    
    await CampusDrive.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Campus drive deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting campus drive:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting campus drive'
    });
  }
});

// @desc    Toggle campus drive status
// @route   PATCH /api/campus-drives/:id/toggle-status
// @access  Private/Admin
router.patch('/:id/toggle-status', adminAuth, async (req, res) => {
  try {
    const campusDrive = await CampusDrive.findById(req.params.id);
    
    if (!campusDrive) {
      return res.status(404).json({
        success: false,
        message: 'Campus drive not found'
      });
    }
    
    campusDrive.isActive = !campusDrive.isActive;
    await campusDrive.save();
    
    await campusDrive.populate('createdBy', 'name email');
    
    res.json({
      success: true,
      message: `Campus drive ${campusDrive.isActive ? 'activated' : 'deactivated'} successfully`,
      data: campusDrive
    });
  } catch (error) {
    console.error('Error toggling campus drive status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating campus drive status'
    });
  }
});

module.exports = router;
