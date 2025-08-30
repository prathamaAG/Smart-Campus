const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  semester: { type: Number, required: true },
  division: { type: String, required: true },
  dueDate: { type: Date, required: true },
  fileUrl: { type: String }, // URL to the uploaded assignment file, now optional
}, { timestamps: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);