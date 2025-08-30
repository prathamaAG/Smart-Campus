const geminiClient = require('../utils/gemini-client');
const documentGenerator = require('../utils/doc-generator');
const path = require('path');

// @desc    Process assignment file with AI enhancement
// @route   POST /api/solver/upload
// @access  Private/Student
exports.processAssignment = async (req, res) => {
    console.log('=== ASSIGNMENT PROCESSOR STARTED ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    try {
        const { paperType, paperTitle } = req.body;
        const file = req.file;

        console.log('Request received:', { paperType, paperTitle, file: file ? file.originalname : 'none' });

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        if (!paperTitle || !paperType) {
            return res.status(400).json({ error: 'Paper title and type are required.' });
        }

        console.log('Processing assignment:', { 
            filename: file.originalname, 
            paperType, 
            paperTitle,
            fileSize: file.size 
        });

        // Step 1: Extract text from uploaded document
        let extractedText;
        try {
            extractedText = await documentGenerator.extractTextFromDocx(file.buffer);
            console.log('Text extracted successfully, length:', extractedText.length);
        } catch (extractError) {
            console.error('Text extraction error:', extractError);
            return res.status(400).json({ error: 'Failed to read the document. Please ensure it\'s a valid .doc or .docx file.' });
        }

        // Step 2: Enhance content using Gemini AI
        let enhancedContent;
        try {
            enhancedContent = await geminiClient.enhanceDocument(
                extractedText, 
                paperType, 
                paperTitle
            );
            console.log('Content enhanced successfully, length:', enhancedContent.length);
        } catch (aiError) {
            console.error('AI enhancement error:', aiError);
            return res.status(500).json({ error: 'Failed to enhance the document with AI. Please try again later.' });
        }

        // Step 3: Create new enhanced document
        let enhancedBuffer;
        try {
            enhancedBuffer = await documentGenerator.createEnhancedDocument(enhancedContent);
            console.log('Enhanced document created successfully');
        } catch (docError) {
            console.error('Document creation error:', docError);
            return res.status(500).json({ error: 'Failed to create the enhanced document.' });
        }

        // Step 4: Save the enhanced document
        const timestamp = Date.now();
        const filename = `enhanced_${timestamp}_${paperTitle.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
        try {
            await documentGenerator.saveDocument(enhancedBuffer, filename);
            console.log('Document saved successfully:', filename);
        } catch (saveError) {
            console.error('File save error:', saveError);
            return res.status(500).json({ error: 'Failed to save the enhanced document.' });
        }
        
        // Step 5: Format the solution for display
        const formattedSolution = `
### **${paperTitle}**
---
${enhancedContent}
`;
        // Step 6: Return both solution and download URL
        const downloadUrl = `/solver/download/${filename}`;

        res.json({
            message: 'Assignment processed successfully!',
            solution: formattedSolution,
            download_url: downloadUrl,
            filename: filename
        });

    } catch (error) {
        console.error('Unexpected error processing assignment:', error);
        res.status(500).json({ 
            error: 'An unexpected error occurred. Please try again.' 
        });
    }
};

// @desc    Download processed assignment
// @route   GET /api/solver/download/:filename
// @access  Private/Student
exports.downloadAssignment = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../uploads', filename);

        res.download(filePath, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(404).json({ error: 'File not found.' });
            }
        });
    } catch (error) {
        console.error('Error in download:', error);
        res.status(500).json({ error: 'Server error during download.' });
    }
};
