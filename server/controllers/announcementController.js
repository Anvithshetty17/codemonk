const Announcement = require('../models/Announcement');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      announcements
    }
  });
});

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, body } = req.body;

  const announcement = await Announcement.create({
    title,
    body
  });

  res.status(201).json({
    success: true,
    message: 'Announcement created successfully',
    data: {
      announcement
    }
  });
});

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private/Admin
const updateAnnouncement = asyncHandler(async (req, res) => {
  const { title, body } = req.body;

  let announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    {
      title,
      body
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.json({
    success: true,
    message: 'Announcement updated successfully',
    data: {
      announcement
    }
  });
});

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: 'Announcement not found'
    });
  }

  await Announcement.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Announcement deleted successfully'
  });
});

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};
