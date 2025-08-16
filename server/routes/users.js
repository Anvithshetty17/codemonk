const express = require('express');
const router = express.Router();
const {
  getUsers,
  getMyProfile,
  updateProfile,
  changePassword
} = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');
const {
  updateProfileValidation,
  changePasswordValidation,
  handleValidationErrors
} = require('../middleware/validation');

router.get('/', adminAuth, getUsers);
router.get('/me', auth, getMyProfile);
router.patch('/me', auth, updateProfileValidation, handleValidationErrors, updateProfile);
router.patch('/me/password', auth, changePasswordValidation, handleValidationErrors, changePassword);

module.exports = router;
