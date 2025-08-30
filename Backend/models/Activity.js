const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['user_registered', 'faculty_approved', 'lecture_scheduled', 'assignment_created'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
