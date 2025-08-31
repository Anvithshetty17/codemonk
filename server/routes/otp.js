const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const {
  sendOTP,
  verifyOTP,
  resendOTP
} = require('../controllers/otpController');

// Validation for OTP requests
const otpValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
];

const verifyOTPValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
];

// Routes
router.post('/send-otp', otpValidation, handleValidationErrors, sendOTP);
router.post('/verify-otp', verifyOTPValidation, handleValidationErrors, verifyOTP);
router.post('/resend-otp', otpValidation, handleValidationErrors, resendOTP);

module.exports = router;
