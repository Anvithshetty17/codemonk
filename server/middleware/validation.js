const { body, validationResult } = require('express-validator');

const registerValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('usn')
    .trim()
    .custom((value) => {
      // USN formats: NU25MCA, NU24MCA, NNM24MC, NNM25MC + 2-3 digits (1-180)
      const usnRegex = /^(NU25MCA|NU24MCA|NNM24MC|NNM25MC)(\d{1,3})$/i;
      if (!usnRegex.test(value)) {
        throw new Error('USN must be in format NU25MCA, NU24MCA, NNM24MC, or NNM25MC followed by a number');
      }
      const number = parseInt(value.match(/\d+$/)[0]);
      if (number < 1 || number > 180) {
        throw new Error('USN number must be between 1 and 180');
      }
      return true;
    }),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit phone number'),
  
  body('whatsappNumber')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit WhatsApp number'),
    
  body('verificationToken')
    .notEmpty()
    .withMessage('Email verification required')
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
  
  body('usn')
    .optional()
    .trim()
    .custom((value) => {
      if (value) {
        // USN formats: NU25MCA, NU24MCA, NNM24MC, NNM25MC + 2-3 digits (1-180)
        const usnRegex = /^(NU25MCA|NU24MCA|NNM24MC|NNM25MC)(\d{1,3})$/i;
        if (!usnRegex.test(value)) {
          throw new Error('USN must be in format NU25MCA, NU24MCA, NNM24MC, or NNM25MC followed by a number');
        }
        const number = parseInt(value.match(/\d+$/)[0]);
        if (number < 1 || number > 180) {
          throw new Error('USN number must be between 1 and 180');
        }
      }
      return true;
    }),
  
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit phone number'),
  
  body('whatsappNumber')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit WhatsApp number')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const memberValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('role')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Role cannot exceed 50 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  
  body('image')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        // Check if it's a URL (starts with http/https) or just a filename
        if (value.startsWith('http://') || value.startsWith('https://')) {
          try {
            new URL(value);
            return true;
          } catch {
            throw new Error('Please enter a valid image URL');
          }
        } else {
          // It's a filename from upload, just check if it's not empty
          return value.trim().length > 0;
        }
      }
      return true;
    }),
  
  body('socialLinks.linkedin')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        if (!/^https?:\/\/(www\.)?linkedin\.com\//.test(value)) {
          throw new Error('Please enter a valid LinkedIn URL');
        }
      }
      return true;
    }),
  
  body('socialLinks.github')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        if (!/^https?:\/\/(www\.)?github\.com\//.test(value)) {
          throw new Error('Please enter a valid GitHub URL');
        }
      }
      return true;
    }),
  
  body('socialLinks.twitter')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        if (!/^https?:\/\/(www\.)?twitter\.com\//.test(value)) {
          throw new Error('Please enter a valid Twitter URL');
        }
      }
      return true;
    }),
  
  body('socialLinks.portfolio')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        try {
          new URL(value);
          return true;
        } catch {
          throw new Error('Please enter a valid portfolio URL');
        }
      }
      return true;
    }),
  
  body('socialLinks.email')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new Error('Please enter a valid email address');
        }
      }
      return true;
    })
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
