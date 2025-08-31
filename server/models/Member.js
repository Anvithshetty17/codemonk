const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  role: {
    type: String,
    trim: true,
    maxlength: [50, 'Role cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  email: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  image: {
    type: String,
    trim: true
  },
  socialLinks: {
    linkedin: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/(www\.)?linkedin\.com\//.test(v);
        },
        message: 'Please enter a valid LinkedIn URL'
      }
    },
    github: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/(www\.)?github\.com\//.test(v);
        },
        message: 'Please enter a valid GitHub URL'
      }
    },
    twitter: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/(www\.)?twitter\.com\//.test(v);
        },
        message: 'Please enter a valid Twitter URL'
      }
    },
    portfolio: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\//.test(v);
        },
        message: 'Please enter a valid website URL'
      }
    },
    email: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Member', memberSchema);
