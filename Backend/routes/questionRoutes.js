const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const questionGenerator = require('../utils/question-generator');
const Assignment = require('../models/Assignment');
const documentExtractor = require('../utils/document-extractor');
const path = require('path');
const fs = require('fs');

// @desc    Generate questions from student submission
// @route   POST /api/questions/generate/:assignmentId/:submissionId
// @access  Private/Faculty
router.post('/generate/:assignmentId/:submissionId', protect, authorize('Faculty'), async (req, res) => {
    try {
        const { assignmentId, submissionId } = req.params;
        
        const assignment = await Assignment.findById(assignmentId)
            .populate('subject', 'name')
            .populate('submissions.student', 'name');
            
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        const submission = assignment.submissions.id(submissionId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Read and extract content from student's submission file
        const filePath = path.join(__dirname, '..', submission.fileUrl);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Submission file not found' });
        }

        // Extract text content from the file
        let extractedContent = '';
        try {
            extractedContent = await documentExtractor.extractText(filePath);
        } catch (error) {
            console.error('Error extracting text:', error);
            return res.status(500).json({ message: 'Failed to read submission content' });
        }

        // Generate questions using AI
        const questions = await questionGenerator.generateQuestions(
            extractedContent,
            assignment.title,
            assignment.subject.name
        );

        res.json({
            questions,
            studentName: submission.student.name,
            assignmentTitle: assignment.title,
            subject: assignment.subject.name
        });

    } catch (error) {
        console.error('Error generating questions:', error);
        res.status(500).json({ 
            message: 'Failed to generate questions', 
            error: error.message 
        });
    }
});

module.exports = router;