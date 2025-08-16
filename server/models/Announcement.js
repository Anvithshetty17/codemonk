const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  body: {
    type: String,
    required: [true, 'Body is required'],
    trim: true,
    maxlength: [2000, 'Body cannot exceed 2000 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
