const Assignment = require('../models/Assignment');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// @desc    Submit assignment solution
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
const submitAssignment = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const studentId = req.user._id;
        const fileUrl = req.file ? `/uploads/submissions/${req.file.filename}` : null;
        const originalFileName = req.file ? req.file.originalname : null;

        if (!fileUrl) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check if student already submitted
        const existingSubmission = assignment.submissions.find(
            sub => sub.student.toString() === studentId.toString()
        );

        if (existingSubmission) {
            // Update existing submission
            existingSubmission.fileUrl = fileUrl;
            existingSubmission.originalFileName = originalFileName;
            existingSubmission.submittedAt = new Date();
        } else {
            // Create new submission
            assignment.submissions.push({
                student: studentId,
                fileUrl: fileUrl,
                originalFileName: originalFileName,
                submittedAt: new Date()
            });
        }

        await assignment.save();
        
        const populatedAssignment = await Assignment.findById(assignmentId)
            .populate('submissions.student', 'name email')
            .populate('faculty', 'name')
            .populate('subject', 'name code');

        res.json({ 
            message: 'Assignment submitted successfully',
            assignment: populatedAssignment
        });
    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Grade student submission
// @route   PUT /api/assignments/:assignmentId/submissions/:submissionId/grade
// @access  Private/Faculty
const gradeSubmission = async (req, res) => {
    try {
        const { assignmentId, submissionId } = req.params;
        const { grade, remarks, maxMarks } = req.body;
        const facultyId = req.user._id;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Check if faculty owns this assignment
        if (assignment.faculty.toString() !== facultyId.toString()) {
            return res.status(403).json({ message: 'Not authorized to grade this assignment' });
        }

        const submission = assignment.submissions.id(submissionId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Update submission with grade
        submission.grade = grade;
        submission.remarks = remarks;
        submission.maxMarks = maxMarks || assignment.maxMarks || 100;
        submission.gradedAt = new Date();
        submission.gradedBy = facultyId;

        await assignment.save();

        const populatedAssignment = await Assignment.findById(assignmentId)
            .populate('submissions.student', 'name email')
            .populate('submissions.gradedBy', 'name')
            .populate('faculty', 'name')
            .populate('subject', 'name code');

        res.json({
            message: 'Submission graded successfully',
            assignment: populatedAssignment
        });
    } catch (error) {
        console.error('Error grading submission:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get student submissions for faculty
// @route   GET /api/faculty/submissions
// @access  Private/Faculty
const getFacultySubmissions = async (req, res) => {
    try {
        const facultyId = req.user._id;
        
        const assignments = await Assignment.find({ faculty: facultyId })
            .populate('submissions.student', 'name email semester')
            .populate('subject', 'name code')
            .sort({ createdAt: -1 });

        // Filter assignments that have submissions
        const assignmentsWithSubmissions = assignments.filter(
            assignment => assignment.submissions.length > 0
        );

        res.json(assignmentsWithSubmissions);
    } catch (error) {
        console.error('Error fetching faculty submissions:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Download student submission
// @route   GET /api/submissions/download/:assignmentId/:submissionId
// @access  Private/Faculty
const downloadSubmission = async (req, res) => {
    try {
        const { assignmentId, submissionId } = req.params;
        
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const submission = assignment.submissions.id(submissionId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const filePath = path.join(__dirname, '..', submission.fileUrl);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Get original file extension from stored file
        const originalExtension = path.extname(submission.fileUrl);
        
        // Use original filename if available, otherwise construct with proper extension
        let downloadFileName = submission.originalFileName || `submission_${submissionId}${originalExtension}`;
        
        // Ensure it has the correct extension
        if (!downloadFileName.toLowerCase().endsWith('.docx') && !downloadFileName.toLowerCase().endsWith('.doc')) {
            const nameWithoutExt = downloadFileName.replace(/\.[^/.]+$/, "");
            downloadFileName = `${nameWithoutExt}${originalExtension || '.docx'}`;
        }

        // Set proper content type
        let contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        if (originalExtension === '.doc') {
            contentType = 'application/msword';
        }

        // Set headers for proper download
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
        res.setHeader('Content-Transfer-Encoding', 'binary');
        res.setHeader('Cache-Control', 'no-cache');

        // Stream the file directly
        const fileStream = fs.createReadStream(filePath);
        fileStream.on('error', (error) => {
            console.error('File stream error:', error);
            res.status(500).json({ message: 'Error reading file' });
        });
        
        fileStream.pipe(res);

    } catch (error) {
        console.error('Error downloading submission:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    submitAssignment,
    gradeSubmission,
    getFacultySubmissions,
    downloadSubmission
};