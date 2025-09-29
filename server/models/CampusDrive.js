const mongoose = require('mongoose');

const campusDriveSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  jobDescription: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true
  },
  dateOfFirstRound: {
    type: Date,
    required: [true, 'Date of first round is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Mass Recruitment', 'Dream Company', 'Super Dream Company'],
    trim: true
  },
  package: {
    type: String,
    required: [true, 'Package information is required'],
    trim: true
  },
  studyMaterialLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty string
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Study material link must be a valid URL'
    }
  },
  companyWebsite: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty string
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Company website must be a valid URL'
    }
  },
  additionalNotes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
campusDriveSchema.index({ dateOfFirstRound: 1, isActive: 1, priority: -1 });
campusDriveSchema.index({ category: 1, isActive: 1 });
campusDriveSchema.index({ companyName: 1 });

module.exports = mongoose.model('CampusDrive', campusDriveSchema);
