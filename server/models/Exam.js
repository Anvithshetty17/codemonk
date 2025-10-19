const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  optionA: {
    type: String,
    required: true
  },
  optionB: {
    type: String,
    required: true
  },
  optionC: {
    type: String,
    required: true
  },
  optionD: {
    type: String,
    required: true
  },
  correctOption: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: true
  }
});

const examSchema = new mongoose.Schema({
  examName: {
    type: String,
    required: true,
    trim: true
  },
  examCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  examType: {
    type: String,
    enum: ['quiz', 'video'],
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1 // duration in minutes
  },
  // For quiz type
  questions: [questionSchema],
  
  // For video type
  videoLink: {
    type: String,
    required: function() {
      return this.examType === 'video';
    }
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
examSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
