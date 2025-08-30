const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Faculty', 'Student'], required: true },
  status: {
    type: String,
    enum: ['pending', 'active'],
    default: function() {
      // Only Faculty should be pending by default
      if (this.role === 'Faculty') return 'pending';
      return 'active';
    }
  },
  semester: { type: Number, required: function() { return this.role === 'Student'; } },
  division: { type: String, required: function() { return this.role === 'Student'; } },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }] // For Faculty
}, { timestamps: true });

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);