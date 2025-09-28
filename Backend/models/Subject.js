const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  semester: { type: Number, required: true }, // Keep semester field only
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);