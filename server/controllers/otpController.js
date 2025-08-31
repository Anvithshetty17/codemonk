const crypto = require('crypto');
const OTP = require('../models/OTP');
const User = require('../models/User');
const { sendOTPEmail } = require('../utils/emailService');
const asyncHandler = require('../utils/asyncHandler');

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// @desc    Send OTP for email verification
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = asyncHandler(async (req, res) => {
  const { email, name } = req.body;

  // Check if email is already registered
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email is already registered'
    });
  }

  // Generate new OTP
  const otp = generateOTP();

  // Delete any existing OTPs for this email and purpose
  await OTP.deleteMany({ 
    email: email.toLowerCase(), 
    purpose: 'registration' 
  });

  // Create new OTP record
  await OTP.create({
    email: email.toLowerCase(),
    otp: otp,
    purpose: 'registration'
  });

  // Send OTP email
  const emailResult = await sendOTPEmail(email, otp, name);
  
  if (emailResult.success) {
    res.json({
      success: true,
      message: 'OTP sent successfully to your email address'
    });
  } else {
    // Delete the OTP if email sending failed
    await OTP.deleteMany({ 
      email: email.toLowerCase(), 
      purpose: 'registration' 
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Find the OTP record
  const otpRecord = await OTP.findOne({
    email: email.toLowerCase(),
    purpose: 'registration',
    isUsed: false
  });

  if (!otpRecord) {
    return res.status(400).json({
      success: false,
      message: 'OTP not found or has expired. Please request a new one.'
    });
  }

  // Check attempts limit
  if (otpRecord.attempts >= 3) {
    await OTP.deleteOne({ _id: otpRecord._id });
    return res.status(400).json({
      success: false,
      message: 'Too many failed attempts. Please request a new OTP.'
    });
  }

  // Verify OTP
  if (otpRecord.otp !== otp) {
    // Increment attempts
    otpRecord.attempts += 1;
    await otpRecord.save();
    
    return res.status(400).json({
      success: false,
      message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.`
    });
  }

  // Mark OTP as used
  otpRecord.isUsed = true;
  await otpRecord.save();

  res.json({
    success: true,
    message: 'Email verified successfully',
    data: {
      emailVerified: true,
      verificationToken: crypto.randomBytes(32).toString('hex') // Token for registration
    }
  });
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = asyncHandler(async (req, res) => {
  const { email, name } = req.body;

  // Check if email is already registered
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email is already registered'
    });
  }

  // Check if there's a recent OTP (rate limiting - prevent spam)
  const recentOTP = await OTP.findOne({
    email: email.toLowerCase(),
    purpose: 'registration',
    createdAt: { $gte: new Date(Date.now() - 60000) } // Within last minute
  });

  if (recentOTP) {
    return res.status(400).json({
      success: false,
      message: 'Please wait at least 1 minute before requesting another OTP'
    });
  }

  // Generate new OTP
  const otp = generateOTP();

  // Delete existing OTPs for this email
  await OTP.deleteMany({ 
    email: email.toLowerCase(), 
    purpose: 'registration' 
  });

  // Create new OTP record
  await OTP.create({
    email: email.toLowerCase(),
    otp: otp,
    purpose: 'registration'
  });

  // Send OTP email
  const emailResult = await sendOTPEmail(email, otp, name);
  
  if (emailResult.success) {
    res.json({
      success: true,
      message: 'New OTP sent successfully to your email address'
    });
  } else {
    await OTP.deleteMany({ 
      email: email.toLowerCase(), 
      purpose: 'registration' 
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
});

module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP
};
