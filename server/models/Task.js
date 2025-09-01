const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: [2000, 'Task description cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['Coding', 'Reading', 'Project', 'Quiz', 'Assignment', 'Research'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [1, 'Points must be at least 1'],
    max: [1000, 'Points cannot exceed 1000']
  },
  content: {
    // For coding tasks
    problemStatement: {
      type: String,
      trim: true
    },
    inputFormat: {
      type: String,
      trim: true
    },
    outputFormat: {
      type: String,
      trim: true
    },
    constraints: {
      type: String,
      trim: true
    },
    examples: [{
      input: String,
      output: String,
      explanation: String
    }],
    // For reading tasks
    readingMaterial: {
      type: String,
      trim: true
    },
    questions: [{
      question: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['multiple-choice', 'short-answer', 'essay'],
        default: 'short-answer'
      },
      options: [String], // For multiple choice
      correctAnswer: String // For auto-grading
    }],
    // Common fields
    resources: [{
      title: String,
      url: String,
      type: {
        type: String,
        enum: ['Documentation', 'Video', 'Article', 'Tutorial', 'Other'],
        default: 'Other'
      }
    }]
  },
  assignedTo: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['Assigned', 'In Progress', 'Submitted', 'Completed', 'Overdue'],
      default: 'Assigned'
    },
    startedAt: Date,
    submittedAt: Date,
    completedAt: Date,
    submission: {
      code: String, // For coding tasks
      answers: [String], // For reading/quiz tasks
      files: [String], // File paths for uploaded files
      notes: String,
      submissionUrl: String // For project submissions
    },
    feedback: {
      type: String,
      trim: true
    },
    grade: {
      type: Number,
      min: 0,
      max: 100
    },
    pointsAwarded: {
      type: Number,
      default: 0
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  estimatedTime: {
    type: Number, // in minutes
    min: 1
  }
}, {
  timestamps: true
});

// Virtual for total assigned count
taskSchema.virtual('totalAssigned').get(function() {
  return this.assignedTo.length;
});

// Virtual for completed count
taskSchema.virtual('completedCount').get(function() {
  return this.assignedTo.filter(assignment => assignment.status === 'Completed').length;
});

// Virtual for completion rate
taskSchema.virtual('completionRate').get(function() {
  if (this.assignedTo.length === 0) return 0;
  return (this.completedCount / this.assignedTo.length) * 100;
});

// Virtual for average points awarded
taskSchema.virtual('averagePoints').get(function() {
  const completedTasks = this.assignedTo.filter(assignment => assignment.status === 'Completed');
  if (completedTasks.length === 0) return 0;
  const totalPoints = completedTasks.reduce((sum, assignment) => sum + assignment.pointsAwarded, 0);
  return totalPoints / completedTasks.length;
});

// Index for efficient queries
taskSchema.index({ 'assignedTo.student': 1, 'assignedTo.status': 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ type: 1, difficulty: 1 });

// Include virtuals when converting to JSON
taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
