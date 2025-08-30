const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

class DocumentGenerator {
    async extractTextFromDocx(buffer) {
        try {
            const result = await mammoth.extractRawText({ buffer: buffer });
            return result.value || "No text could be extracted from the document.";
        } catch (error) {
            console.error('Error extracting text from docx:', error);
            throw new Error('Failed to extract text from document');
        }
    }

    async createEnhancedDocument(enhancedContent) {
        try {
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: this.createContent(enhancedContent),
                }],
            });

            const buffer = await Packer.toBuffer(doc);
            return buffer;
        } catch (error) {
            console.error('Error creating enhanced document:', error);
            throw new Error('Failed to create enhanced document');
        }
    }

    createContent(text) {
        const paragraphs = [];
        const lines = text.split('\n');

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                // Bold and centered for headings
                const headingText = trimmedLine.substring(2, trimmedLine.length - 2);
                paragraphs.push(new Paragraph({
                    children: [new TextRun({ text: headingText, bold: true })],
                    heading: HeadingLevel.HEADING_1,
                    alignment: 'center'
                }));
            } else if (trimmedLine.startsWith('*') && trimmedLine.endsWith('*')) {
                // Bold for subheadings
                const subHeadingText = trimmedLine.substring(1, trimmedLine.length - 1);
                paragraphs.push(new Paragraph({
                    children: [new TextRun({ text: subHeadingText, bold: true })],
                    heading: HeadingLevel.HEADING_2,
                }));
            } else if (trimmedLine.startsWith('```python')) {
                // Code blocks
                const codeLines = [];
                let i = lines.indexOf(line) + 1;
                while (i < lines.length && !lines[i].startsWith('```')) {
                    codeLines.push(lines[i]);
                    i++;
                }
                const codeText = codeLines.join('\n');
                paragraphs.push(new Paragraph({
                    children: [new TextRun({ text: codeText, font: { name: 'Courier New' } })],
                    style: "code"
                }));
                // Skip lines already processed
                lines.splice(lines.indexOf(line), codeLines.length + 1);
            }
            else {
                // Regular paragraphs
                paragraphs.push(new Paragraph({
                    children: [new TextRun(trimmedLine)],
                }));
            }
        });

        return paragraphs;
    }

    createParagraphsFromText(text) {
        const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
        return paragraphs.map(paragraphText => 
            new Paragraph({
                children: [
                    new TextRun({
                        text: paragraphText.trim(),
                    }),
                ],
            })
        );
    }

    async saveDocument(buffer, filename) {
        try {
            const uploadDir = path.join(__dirname, '../uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, filename);
            fs.writeFileSync(filePath, buffer);
            return filePath;
        } catch (error) {
            console.error('Error saving document:', error);
            throw new Error('Failed to save document');
        }
    }
}

module.exports = new DocumentGenerator();
