const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function(studentId) {
        const user = await mongoose.model('User').findById(studentId);
        return user && user.role === 'student';
      },
      message: 'Only students can be added to a group'
    }
  }],
  mentors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function(mentorId) {
        const user = await mongoose.model('User').findById(mentorId);
        return user && (user.role === 'mentor' || user.role === 'admin');
      },
      message: 'Only mentors or admins can be assigned as mentors'
    }
  }],
  project: {
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Project title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Project description cannot exceed 2000 characters']
    },
    requirements: [{
      type: String,
      trim: true
    }],
    technologies: [{
      type: String,
      trim: true
    }],
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate'
    },
    submissionDate: {
      type: Date
    },
    submissionFormat: {
      type: String,
      enum: ['GitHub Repository', 'ZIP File', 'Live Demo', 'Document'],
      default: 'GitHub Repository'
    },
    resources: [{
      title: {
        type: String,
        trim: true
      },
      url: {
        type: String,
        trim: true
      },
      type: {
        type: String,
        enum: ['Documentation', 'Tutorial', 'Video', 'Article', 'Other'],
        default: 'Other'
      }
    }]
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'On Hold', 'Cancelled'],
    default: 'Active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submissions: [{
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    submissionUrl: {
      type: String,
      trim: true
    },
    submissionText: {
      type: String,
      trim: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Approved', 'Needs Revision'],
      default: 'Submitted'
    },
    feedback: {
      type: String,
      trim: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    grade: {
      type: Number,
      min: 0,
      max: 100
    }
  }]
}, {
  timestamps: true
});

// Virtual for student count
groupSchema.virtual('studentCount').get(function() {
  return this.students.length;
});

// Virtual for mentor count
groupSchema.virtual('mentorCount').get(function() {
  return this.mentors.length;
});

// Virtual for checking if project is overdue
groupSchema.virtual('isOverdue').get(function() {
  if (!this.project.submissionDate) return false;
  return new Date() > this.project.submissionDate;
});

// Virtual for days remaining
groupSchema.virtual('daysRemaining').get(function() {
  if (!this.project.submissionDate) return null;
  const today = new Date();
  const submissionDate = new Date(this.project.submissionDate);
  const diffTime = submissionDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Include virtuals when converting to JSON
groupSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Group', groupSchema);
