const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
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

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            if (trimmedLine === '') {
                // Skip empty lines but add spacing
                return;
            }

            // Main title (# Title)
            if (trimmedLine.startsWith('# ')) {
                const titleText = trimmedLine.substring(2).trim();
                paragraphs.push(new Paragraph({
                    children: [new TextRun({ 
                        text: titleText, 
                        bold: true, 
                        size: 32,
                        font: { name: 'Times New Roman' },
                        color: '000000' // Black color
                    })],
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }));
            }
            // H2 headings (## Heading)
            else if (trimmedLine.startsWith('## ')) {
                const headingText = trimmedLine.substring(3).trim();
                paragraphs.push(new Paragraph({
                    children: [new TextRun({ 
                        text: headingText, 
                        bold: true, 
                        size: 28,
                        font: { name: 'Times New Roman' },
                        color: '000000' // Black color
                    })],
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 300, after: 200 }
                }));
            }
            // H3 headings (### Heading)
            else if (trimmedLine.startsWith('### ')) {
                const headingText = trimmedLine.substring(4).trim();
                paragraphs.push(new Paragraph({
                    children: [new TextRun({ 
                        text: headingText, 
                        bold: true, 
                        size: 24,
                        font: { name: 'Times New Roman' },
                        color: '000000' // Black color
                    })],
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 150 }
                }));
            }
            // Bold text (**text**)
            else if (trimmedLine.includes('**')) {
                const textRuns = this.parseBoldText(trimmedLine);
                paragraphs.push(new Paragraph({
                    children: textRuns,
                    spacing: { after: 150 }
                }));
            }
            // List items (- item or * item)
            else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                const listText = trimmedLine.substring(2).trim();
                paragraphs.push(new Paragraph({
                    children: [
                        new TextRun({ text: '• ', bold: true }),
                        new TextRun({ text: listText })
                    ],
                    indent: { left: 400 },
                    spacing: { after: 100 }
                }));
            }
            // Numbered list items (1. item)
            else if (/^\d+\.\s/.test(trimmedLine)) {
                const listText = trimmedLine.substring(trimmedLine.indexOf('.') + 1).trim();
                const number = trimmedLine.substring(0, trimmedLine.indexOf('.') + 1);
                paragraphs.push(new Paragraph({
                    children: [
                        new TextRun({ text: number + ' ', bold: true }),
                        new TextRun({ text: listText })
                    ],
                    indent: { left: 400 },
                    spacing: { after: 100 }
                }));
            }
            // Code blocks (```code```)
            else if (trimmedLine.startsWith('```') && trimmedLine.endsWith('```')) {
                const codeText = trimmedLine.substring(3, trimmedLine.length - 3);
                paragraphs.push(new Paragraph({
                    children: [new TextRun({ 
                        text: codeText, 
                        font: { name: 'Courier New' },
                        size: 20 
                    })],
                    shading: { fill: 'f5f5f5' },
                    spacing: { before: 100, after: 100 }
                }));
            }
            // Regular paragraphs
            else {
                const textRuns = this.parseBoldText(trimmedLine);
                paragraphs.push(new Paragraph({
                    children: textRuns,
                    spacing: { after: 150 }
                }));
            }
        });

        return paragraphs;
    }

    parseBoldText(text) {
        const textRuns = [];
        const parts = text.split('**');
        
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                // Regular text
                if (parts[i].trim()) {
                    textRuns.push(new TextRun({ 
                        text: parts[i],
                        font: { name: 'Times New Roman' },
                        color: '000000' // Black color
                    }));
                }
            } else {
                // Bold text
                if (parts[i].trim()) {
                    textRuns.push(new TextRun({ 
                        text: parts[i], 
                        bold: true,
                        font: { name: 'Times New Roman' },
                        color: '000000' // Black color
                    }));
                }
            }
        }
        
        // If no bold text found, just return the original text
        if (textRuns.length === 0) {
            textRuns.push(new TextRun({ 
                text: text,
                font: { name: 'Times New Roman' },
                color: '000000' // Black color
            }));
        }
        
        return textRuns;
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
                spacing: { after: 150 }
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
