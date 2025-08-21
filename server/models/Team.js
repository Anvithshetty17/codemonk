const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  }],
  maxMembers: {
    type: Number,
    default: 10,
    min: 1,
    max: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: [
      'Web Development',
      'Mobile Development', 
      'Data Science',
      'Machine Learning',
      'AI',
      'Cybersecurity',
      'DevOps',
      'UI/UX Design',
      'Game Development',
      'Other'
    ],
    default: 'Other'
  },
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
teamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members.filter(member => member.status === 'active').length;
});

// Virtual for available spots
teamSchema.virtual('availableSpots').get(function() {
  return this.maxMembers - this.memberCount;
});

// Ensure virtual fields are serialized
teamSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Team', teamSchema);
