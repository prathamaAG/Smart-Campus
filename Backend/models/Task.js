const mongoose_task = require('mongoose');

const TaskSchema = new mongoose_task.Schema({
  user: {
    type: mongoose_task.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],
    default: 'To Do',
  },
}, { timestamps: true });

module.exports = mongoose_task.model('Task', TaskSchema);

