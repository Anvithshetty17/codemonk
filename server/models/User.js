const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  usn: {
    type: String,
    required: [true, 'USN is required'],
    unique: true,
    uppercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        // USN formats: NU25MCA, NU24MCA, NNM24MC, NNM25MC + 2-3 digits (1-180)
        const usnRegex = /^(NU25MCA|NU24MCA|NNM24MC|NNM25MC)(\d{1,3})$/i;
        if (!usnRegex.test(v)) {
          return false;
        }
        const number = parseInt(v.match(/\d+$/)[0]);
        return number >= 1 && number <= 180;
      },
      message: 'USN must be in format NU25MCA, NU24MCA, NNM24MC, or NNM25MC followed by a number between 1-180 (e.g., NU25MCA001, NNM24MC015)'
    }
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
    minlength: [6, 'Password must be at least 6 characters long']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        // Accept 10-digit Indian numbers starting with 6-9
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Please enter a valid 10-digit phone number'
    }
  },
  whatsappNumber: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Please enter a valid 10-digit WhatsApp number'
    }
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
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  completedTasks: {
    type: Number,
    default: 0,
    min: 0
  },
  rank: {
    type: Number,
    default: null
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

// Method to compare password
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
