const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { auth, adminAuth } = require('../middleware/auth');
const {
  announcementValidation,
  handleValidationErrors
} = require('../middleware/validation');

router.get('/', auth, getAnnouncements);
router.post('/', adminAuth, announcementValidation, handleValidationErrors, createAnnouncement);
router.put('/:id', adminAuth, announcementValidation, handleValidationErrors, updateAnnouncement);
router.delete('/:id', adminAuth, deleteAnnouncement);

module.exports = router;
