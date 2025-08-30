const Task = require('../models/Task');

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: 'Task text is required' });
    }
    const task = new Task({
        user: req.user.id,
        text: text,
    });
    const createdTask = await task.save();
    res.status(201).json(createdTask);
};

// @desc    Update a task's status
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        task.status = status;
        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(400).json({ message: 'Could not update task' });
    }
};


// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Ensure the user owns the task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Task.findByIdAndDelete(req.params.id);

        res.json({ message: 'Task removed' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(400).json({ message: 'Could not delete task' }); // Changed to 400 for client error
    }
};
