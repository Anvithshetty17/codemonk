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
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  category: {
    type: String,
    enum: [
      'Programming',
      'Research',
      'Design',
      'Testing',
      'Documentation',
      'Presentation',
      'Project',
      'Other'
    ],
    default: 'Programming'
  },
  requirements: [{
    type: String,
    trim: true
  }],
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['link', 'document', 'video', 'tutorial', 'other'],
      default: 'link'
    }
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
      required: true
    },
    attachments: [{
      name: String,
      url: String,
      type: String
    }],
    status: {
      type: String,
      enum: ['submitted', 'reviewed', 'approved', 'rejected', 'resubmit'],
      default: 'submitted'
    },
    feedback: {
      comment: String,
      rating: {
        type: Number,
        min: 1,
        max: 10
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reviewedAt: Date
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for submission count
taskSchema.virtual('submissionCount').get(function() {
  return this.submissions.length;
});

// Virtual for pending submissions
taskSchema.virtual('pendingSubmissions').get(function() {
  return this.submissions.filter(sub => sub.status === 'submitted').length;
});

// Virtual for approved submissions
taskSchema.virtual('approvedSubmissions').get(function() {
  return this.submissions.filter(sub => sub.status === 'approved').length;
});

// Virtual to check if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueDate && this.status !== 'completed';
});

// Ensure virtual fields are serialized
taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
