const geminiClient = require('../utils/gemini-client');
const documentGenerator = require('../utils/doc-generator');
const path = require('path');

// @desc    Process assignment file with AI enhancement
// @route   POST /api/solver/upload
// @access  Private/Student
exports.processAssignment = async (req, res) => {
    console.log('=== AI ASSIGNMENT SOLVER STARTED ===');
    console.log('Request method:', req.method);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file ? req.file.originalname : 'none');
    
    try {
        const { paperType, paperTitle } = req.body;
        const file = req.file;

        console.log('Processing request:', { paperType, paperTitle, file: file ? file.originalname : 'none' });

        // Validation
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded. Please select a document to process.' });
        }

        if (!paperTitle || !paperType) {
            return res.status(400).json({ error: 'Paper title and document type are required.' });
        }

        console.log('Processing document:', { 
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
            
            if (!extractedText || extractedText.trim().length < 10) {
                return res.status(400).json({ 
                    error: 'The document appears to be empty or contains very little text. Please upload a document with content.' 
                });
            }
        } catch (extractError) {
            console.error('Text extraction error:', extractError);
            return res.status(400).json({ 
                error: 'Failed to read the document. Please ensure it\'s a valid .doc or .docx file with readable content.' 
            });
        }

        // Step 2: Generate AI solution
        let aiSolution;
        try {
            console.log('Attempting to generate AI solution with Gemini...');
            aiSolution = await geminiClient.enhanceDocument(
                extractedText, 
                paperType, 
                paperTitle
            );
            console.log('✅ Gemini AI solution generated successfully, length:', aiSolution.length);
        } catch (geminiError) {
            console.error('❌ Gemini AI failed:', geminiError.message);
            
            // Fixed the variable name from aiError to geminiError
            let errorMessage = 'Failed to generate AI solution. ';
            if (geminiError.message.includes('API key')) {
                errorMessage += 'Please check API configuration.';
            } else if (geminiError.message.includes('quota')) {
                errorMessage += 'API quota exceeded. Please try again later.';
            } else if (geminiError.message.includes('model not available') || geminiError.message.includes('404')) {
                errorMessage += 'AI service temporarily unavailable. Please try again later.';
            } else if (geminiError.message.includes('503') || geminiError.message.includes('overloaded')) {
                errorMessage += 'AI service is overloaded. Please try again in 2-3 minutes.';
            } else {
                errorMessage += 'Please try again or contact support.';
            }
            
            return res.status(500).json({ error: errorMessage });
        }

        // Step 3: Create enhanced document
        let enhancedBuffer;
        try {
            enhancedBuffer = await documentGenerator.createEnhancedDocument(aiSolution);
            console.log('Enhanced document created successfully');
        } catch (docError) {
            console.error('Document creation error:', docError);
            return res.status(500).json({ 
                error: 'Failed to create the solution document. The AI solution was generated but document creation failed.' 
            });
        }

        // Step 4: Save the solution document
        const timestamp = Date.now();
        const cleanTitle = paperTitle.replace(/[^a-zA-Z0-9]/g, '_');
        const cleanType = paperType.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${cleanType}_${cleanTitle}_Solution_${timestamp}.docx`;
        
        try {
            await documentGenerator.saveDocument(enhancedBuffer, filename);
            console.log('Document saved successfully:', filename);
        } catch (saveError) {
            console.error('File save error:', saveError);
            return res.status(500).json({ 
                error: 'Failed to save the solution document to server.' 
            });
        }

        // Step 5: Format the solution for display
        const formattedSolution = `# ${paperTitle} - AI Solution\n\n${aiSolution}`;
        
        // Step 6: Return response
        const downloadUrl = `/solver/download/${filename}`;

        res.json({
            message: `${paperType} processed successfully!`,
            solution: formattedSolution,
            download_url: downloadUrl,
            filename: filename,
            document_type: paperType,
            processing_time: `${Date.now() - timestamp}ms`
        });

    } catch (error) {
        console.error('Unexpected error in assignment solver:', error);
        res.status(500).json({ 
            error: 'An unexpected error occurred while processing your document. Please try again.' 
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

        console.log('Download requested for:', filename);
        console.log('File path:', filePath);

        // Check if file exists
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
            console.log('File not found:', filePath);
            return res.status(404).json({ error: 'Solution file not found. It may have been deleted or expired.' });
        }

        // Set proper headers for download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        res.download(filePath, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Error downloading the solution file.' });
                }
            } else {
                console.log('File downloaded successfully:', filename);
            }
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download the solution file.' });
    }
};
