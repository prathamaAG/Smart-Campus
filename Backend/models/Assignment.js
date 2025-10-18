const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  originalFileName: { type: String }, // Add this field to store original filename
  submittedAt: { type: Date, default: Date.now },
  grade: { type: Number },
  maxMarks: { type: Number, default: 100 },
  remarks: { type: String },
  gradedAt: { type: Date },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String },
  assignmentType: { 
    type: String, 
    enum: ['text', 'file'], 
    default: 'text' 
  },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  semester: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  fileUrl: { type: String },
  maxMarks: { type: Number, default: 100 },
  submissions: [SubmissionSchema], // This is the key addition
}, { timestamps: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);