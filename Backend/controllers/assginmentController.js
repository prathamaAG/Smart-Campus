const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Subject = require('../models/Subject');
const path = require('path');
const fs = require('fs');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private/Faculty
exports.createAssignment = async (req, res) => {
    try {
        const { title, subject, description, content, assignmentType, dueDate, semester } = req.body;
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

        console.log('Creating assignment with file URL:', fileUrl); // Debug log

        const assignment = new Assignment({
            title,
            subject,
            description,
            content: assignmentType === 'text' ? content : undefined,
            assignmentType: assignmentType || (req.file ? 'file' : 'text'),
            dueDate,
            semester: parseInt(semester),
            faculty: req.user._id,
            fileUrl
        });

        const createdAssignment = await assignment.save();
        const populatedAssignment = await Assignment.findById(createdAssignment._id)
            .populate('faculty', 'name')
            .populate('subject', 'name code');
            
        console.log('Assignment created with fileUrl:', populatedAssignment.fileUrl); // Debug log
        res.status(201).json(populatedAssignment);
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get assignments
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = async (req, res) => {
    try {
        let query = {};
        const user = req.user;

        console.log('User requesting assignments:', {
            id: user._id,
            role: user.role,
            semester: user.semester
        });

        if (user.role === 'Student') {
            query = { 
                semester: user.semester
            };
            console.log('Student assignment query:', query);
        } else if (user.role === 'Faculty') {
            query = { faculty: user._id };
            console.log('Faculty assignment query:', query);
        }

        const assignments = await Assignment.find(query)
            .populate('faculty', 'name')
            .populate('subject', 'name code')
            .sort({ createdAt: -1 });
            
        console.log('Found assignments:', assignments.length);
        
        // Fix file URLs for client consumption
        const assignmentsWithFixedUrls = assignments.map(assignment => {
            const assignmentObj = assignment.toObject();
            if (assignmentObj.fileUrl && !assignmentObj.fileUrl.startsWith('http')) {
                // Ensure the file URL is properly formatted
                assignmentObj.fileUrl = assignmentObj.fileUrl.startsWith('/uploads/') 
                    ? assignmentObj.fileUrl 
                    : `/uploads/${assignmentObj.fileUrl}`;
            }
            return assignmentObj;
        });
        
        res.json(assignmentsWithFixedUrls);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('faculty', 'name email')
            .populate('subject', 'name code');

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        res.json(assignment);
    } catch (error) {
        console.error('Error fetching assignment:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Download assignment file
// @route   GET /api/assignments/download/:id
// @access  Private
exports.downloadAssignmentFile = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (!assignment.fileUrl || assignment.assignmentType !== 'file') {
            return res.status(400).json({ message: 'No file available for this assignment' });
        }

        const filePath = path.join(__dirname, '..', assignment.fileUrl);
        console.log('Attempting to download file from:', filePath);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(filePath, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).json({ message: 'Error downloading file' });
            }
        });
    } catch (error) {
        console.error('Error in download route:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Faculty
exports.deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check if user owns this assignment
        if (assignment.faculty.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await assignment.deleteOne();
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};