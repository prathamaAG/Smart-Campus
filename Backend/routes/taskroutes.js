const express_task = require('express');
const router_task = express_task.Router();
const { getTasks, createTask, deleteTask, updateTaskStatus } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router_task.route('/')
    .get(protect, getTasks)
    .post(protect, createTask);

router_task.route('/:id')
    .delete(protect, deleteTask)
    .put(protect, updateTaskStatus);

module.exports = router_task;