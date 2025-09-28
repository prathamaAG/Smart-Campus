const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String }, // For text-based assignments
  assignmentType: { 
    type: String, 
    enum: ['text', 'file'], 
    default: 'text' 
  },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  semester: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  fileUrl: { type: String }, // URL to the uploaded assignment file, optional
}, { timestamps: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);