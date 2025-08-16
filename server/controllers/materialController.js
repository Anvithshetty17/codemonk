const Material = require('../models/Material');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all study materials
// @route   GET /api/materials
// @access  Private
const getMaterials = asyncHandler(async (req, res) => {
  const materials = await Material.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      materials
    }
  });
});

// @desc    Create new study material
// @route   POST /api/materials
// @access  Private/Admin
const createMaterial = asyncHandler(async (req, res) => {
  const { title, description, link } = req.body;

  const material = await Material.create({
    title,
    description,
    link
  });

  res.status(201).json({
    success: true,
    message: 'Study material created successfully',
    data: {
      material
    }
  });
});

// @desc    Update study material
// @route   PUT /api/materials/:id
// @access  Private/Admin
const updateMaterial = asyncHandler(async (req, res) => {
  const { title, description, link } = req.body;

  let material = await Material.findById(req.params.id);

  if (!material) {
    return res.status(404).json({
      success: false,
      message: 'Study material not found'
    });
  }

  material = await Material.findByIdAndUpdate(
    req.params.id,
    {
      title,
      description,
      link
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.json({
    success: true,
    message: 'Study material updated successfully',
    data: {
      material
    }
  });
});

// @desc    Delete study material
// @route   DELETE /api/materials/:id
// @access  Private/Admin
const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await Material.findById(req.params.id);

  if (!material) {
    return res.status(404).json({
      success: false,
      message: 'Study material not found'
    });
  }

  await Material.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Study material deleted successfully'
  });
});

module.exports = {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial
};
