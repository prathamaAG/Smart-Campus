const mammoth = require("mammoth");
const fs = require('fs');
const path = require('path');

class DocumentExtractor {
    async extractText(filePath) {
        const extension = path.extname(filePath).toLowerCase();
        
        try {
            if (extension === '.docx') {
                return await this.extractFromDocx(filePath);
            } else if (extension === '.doc') {
                return await this.extractFromDocx(filePath);
            } else if (extension === '.pdf') {
                return await this.extractFromPdf(filePath);
            } else {
                throw new Error(`Unsupported file format: ${extension}`);
            }
        } catch (error) {
            console.error('Error extracting text from document:', error);
            throw new Error('Failed to extract text from document');
        }
    }

    async extractFromDocx(filePath) {
        const buffer = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    }

    async extractFromPdf(filePath) {
        throw new Error('PDF extraction not implemented yet. Please use DOCX files.');
    }
}

module.exports = new DocumentExtractor();