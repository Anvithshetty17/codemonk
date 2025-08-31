const express = require('express');
const router = express.Router();
const {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  uploadImage
} = require('../controllers/memberController');
const { adminAuth } = require('../middleware/auth');
const {
  memberValidation,
  handleValidationErrors
} = require('../middleware/validation');
const upload = require('../middleware/upload');

router.get('/', getMembers);
router.post('/upload-image', adminAuth, upload.single('image'), uploadImage);
router.post('/', adminAuth, memberValidation, handleValidationErrors, createMember);
router.put('/:id', adminAuth, memberValidation, handleValidationErrors, updateMember);
router.delete('/:id', adminAuth, deleteMember);

module.exports = router;
