const express = require('express');
const router = express.Router();
const {
  getUsers,
  getMyProfile,
  updateProfile,
  changePassword,
  updateUserRole
} = require('../controllers/userController');
const { auth, adminAuth, mentorAuth } = require('../middleware/auth');
const {
  updateProfileValidation,
  changePasswordValidation,
  updateRoleValidation,
  handleValidationErrors
} = require('../middleware/validation');

router.get('/', adminAuth, getUsers);
router.get('/me', auth, getMyProfile);
router.patch('/me', auth, updateProfileValidation, handleValidationErrors, updateProfile);
router.patch('/me/password', auth, changePasswordValidation, handleValidationErrors, changePassword);
router.patch('/:id/role', adminAuth, updateRoleValidation, handleValidationErrors, updateUserRole);

module.exports = router;
