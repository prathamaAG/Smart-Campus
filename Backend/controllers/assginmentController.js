const Assignment = require('../models/Assignment');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private/Faculty
exports.createAssignment = async (req, res) => {
    const { title, subject, description, dueDate } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const assignment = new Assignment({
        title,
        subject,
        description,
        dueDate,
        faculty: req.user._id,
        fileUrl
    });

    const createdAssignment = await assignment.save();
    res.status(201).json(createdAssignment);
};

// @desc    Get assignments
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res) => {
    let query = {};
    const user = req.user;

    if (user.role === 'Student') {
        query = { semester: user.semester, division: user.division };
    } else if (user.role === 'Faculty') {
        query = { faculty: user._id };
    }

    const assignments = await Assignment.find(query).populate('faculty', 'name').populate('subject', 'name code');
    res.json(assignments);
};