const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  handleValidationErrors
} = require('../middleware/validation');

router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.get('/me', auth, getMe);
router.post('/logout', auth, logout);

module.exports = router;
