const { body, validationResult } = require('express-validator');

const registerValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('phone')
    .matches(/^(\+?[1-9]\d{1,14}|\d{10})$/)
    .withMessage('Please enter a valid phone number'),
  
  body('whatsappNumber')
    .optional()
    .matches(/^(\+?[1-9]\d{1,14}|\d{10})$/)
    .withMessage('Please enter a valid WhatsApp number'),
  
  body('areasOfInterest')
    .custom((value) => {
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return false;
    })
    .withMessage('Please provide at least one area of interest'),
  
  body('previousExperience')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Previous experience cannot exceed 1000 characters'),
  
  body('codingSkillsRating')
    .isInt({ min: 1, max: 10 })
    .withMessage('Coding skills rating must be a number between 1 and 10'),
  
  body('favoriteProgrammingLanguage')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Favorite programming language is required and must not exceed 100 characters'),
  
  body('favoriteLanguageReason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason for favorite language must be between 10 and 500 characters'),
  
  body('proudProject')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Project description must be between 20 and 1000 characters'),
  
  body('debuggingProcess')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Debugging process description must be between 20 and 1000 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('phone')
    .optional()
    .matches(/^(\+?[1-9]\d{1,14}|\d{10})$/)
    .withMessage('Please enter a valid phone number'),
  
  body('whatsappNumber')
    .optional()
    .matches(/^(\+?[1-9]\d{1,14}|\d{10})$/)
    .withMessage('Please enter a valid WhatsApp number'),
  
  body('areasOfInterest')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return false;
    })
    .withMessage('Please provide at least one area of interest'),
  
  body('previousExperience')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Previous experience cannot exceed 1000 characters')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

const memberValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('image')
    .isURL()
    .withMessage('Please enter a valid image URL'),
  
  body('links.linkedin')
    .optional()
    .isURL()
    .withMessage('Please enter a valid LinkedIn URL'),
  
  body('links.github')
    .optional()
    .isURL()
    .withMessage('Please enter a valid GitHub URL'),
  
  body('links.website')
    .optional()
    .isURL()
    .withMessage('Please enter a valid website URL')
];

const materialValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('link')
    .isURL()
    .withMessage('Please enter a valid URL')
];
const announcementValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  
  body('body')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Body must be between 10 and 2000 characters')
];

const updateRoleValidation = [
  body('role')
    .isIn(['student', 'mentor', 'admin'])
    .withMessage('Role must be one of: student, mentor, admin')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  memberValidation,
  materialValidation,
  announcementValidation,
  updateRoleValidation,
  handleValidationErrors
};
