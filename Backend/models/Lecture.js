const mongoose = require('mongoose');

const LectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  semester: { type: Number, required: true }, // Keep semester, make it required
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  venue: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('Lecture', LectureSchema);