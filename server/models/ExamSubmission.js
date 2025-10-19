const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true
  },
  selectedOption: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'Not Answered', null],
    default: null
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
});

const examSubmissionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  
  usn: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  
  examType: {
    type: String,
    enum: ['quiz', 'video'],
    required: true
  },
  
  // For quiz submissions
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  
  // For video submissions
  watchTime: {
    type: Number,
    default: 0 // in seconds
  },
  totalVideoDuration: {
    type: Number,
    default: 0 // in seconds
  },
  completionPercentage: {
    type: Number,
    default: 0
  },
  
  timeTaken: {
    type: Number, // in minutes
    required: true
  },
  
  startedAt: {
    type: Date,
    required: true
  },
  
  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  autoSubmitted: {
    type: Boolean,
    default: false // true if auto-submitted due to tab change or timeout
  },
  
  autoSubmitReason: {
    type: String,
    enum: ['timeout', 'tab_change', 'manual'],
    default: 'manual'
  },
  
  isCompleted: {
    type: Boolean,
    default: true
  }
});

// Create compound index to prevent duplicate submissions
examSubmissionSchema.index({ exam: 1, usn: 1 }, { unique: true });

const ExamSubmission = mongoose.model('ExamSubmission', examSubmissionSchema);

module.exports = ExamSubmission;
