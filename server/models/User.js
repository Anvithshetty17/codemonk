const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        // Accept E.164 format or 10-digit Indian numbers
        return /^\+?[1-9]\d{1,14}$/.test(v) || /^\d{10}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  whatsappNumber: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^\+?[1-9]\d{1,14}$/.test(v) || /^\d{10}$/.test(v);
      },
      message: 'Please enter a valid WhatsApp number'
    }
  },
  areasOfInterest: {
    type: [String],
    default: []
  },
  previousExperience: {
    type: String,
    maxlength: [1000, 'Previous experience cannot exceed 1000 characters']
  },
  codingSkillsRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating cannot exceed 10'],
    required: [true, 'Coding skills rating is required']
  },
  favoriteProgrammingLanguage: {
    type: String,
    required: [true, 'Favorite programming language is required'],
    trim: true,
    maxlength: [100, 'Programming language name cannot exceed 100 characters']
  },
  favoriteLanguageReason: {
    type: String,
    required: [true, 'Reason for favorite language is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  proudProject: {
    type: String,
    required: [true, 'Proud project description is required'],
    trim: true,
    maxlength: [1000, 'Project description cannot exceed 1000 characters']
  },
  debuggingProcess: {
    type: String,
    required: [true, 'Debugging process description is required'],
    trim: true,
    maxlength: [1000, 'Debugging process cannot exceed 1000 characters']
  },
  profileImage: {
    type: String,
    trim: true
  },
  linkedinUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please enter a valid LinkedIn URL starting with http:// or https://'
    }
  },
  githubUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please enter a valid GitHub URL starting with http:// or https://'
    }
  },
  portfolioUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please enter a valid portfolio URL starting with http:// or https://'
    }
  },
  role: {
    type: String,
    enum: ['student', 'mentor', 'admin'],
    default: 'student'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
