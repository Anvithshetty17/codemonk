const express = require('express');
const router = express.Router();
const {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial
} = require('../controllers/materialController');
const { auth, adminAuth } = require('../middleware/auth');
const {
  materialValidation,
  handleValidationErrors
} = require('../middleware/validation');

router.get('/', auth, getMaterials);
router.post('/', adminAuth, materialValidation, handleValidationErrors, createMaterial);
router.put('/:id', adminAuth, materialValidation, handleValidationErrors, updateMaterial);
router.delete('/:id', adminAuth, deleteMaterial);

module.exports = router;
