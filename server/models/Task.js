const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [3000, 'Instructions cannot exceed 3000 characters']
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [1, 'Points must be at least 1'],
    max: [1000, 'Points cannot exceed 1000']
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  assignedToSections: [{
    type: String,
    enum: ['A', 'B', 'C'],
    required: true
  }],
  type: {
    type: String,
    enum: ['coding', 'assignment', 'project', 'quiz', 'research', 'other'],
    default: 'assignment'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    mimeType: String,
    size: Number
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    attachments: [{
      filename: String,
      originalName: String,
      path: String,
      mimeType: String,
      size: Number
    }],
    status: {
      type: String,
      enum: ['submitted', 'reviewed', 'approved', 'rejected'],
      default: 'submitted'
    },
    feedback: {
      type: String,
      trim: true
    },
    pointsAwarded: {
      type: Number,
      min: 0,
      default: 0
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
taskSchema.index({ assignedToSections: 1, deadline: 1, status: 1 });
taskSchema.index({ createdBy: 1, createdAt: -1 });
taskSchema.index({ 'submissions.student': 1 });

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  return new Date() > this.deadline && this.status === 'published';
});

// Virtual for submission count
taskSchema.virtual('submissionCount').get(function() {
  return this.submissions.length;
});

// Method to check if student can submit
taskSchema.methods.canStudentSubmit = function(studentId) {
  const existingSubmission = this.submissions.find(
    sub => sub.student.toString() === studentId.toString()
  );
  return !existingSubmission && !this.isOverdue && this.status === 'published';
};

// Method to get submission by student
taskSchema.methods.getSubmissionByStudent = function(studentId) {
  return this.submissions.find(
    sub => sub.student.toString() === studentId.toString()
  );
};

// Static method to get tasks for a specific section
taskSchema.statics.getTasksForSection = function(section) {
  return this.find({
    assignedToSections: section,
    status: 'published',
    isActive: true
  }).populate('createdBy', 'fullName role')
    .populate('submissions.student', 'fullName usn section')
    .populate('submissions.reviewedBy', 'fullName role');
};

// Include virtuals when converting to JSON
taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
