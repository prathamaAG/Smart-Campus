const fs = require('fs');
const { Document, Packer, Paragraph, TextRun } = require('docx');

async function createTestDocument() {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Test Assignment Document",
                            bold: true,
                            size: 28,
                        }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "This is a test document for the Assignment Solver AI feature. "
                        }),
                        new TextRun({
                            text: "It contains some sample text that can be enhanced by the AI system."
                        })
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "The purpose of this document is to test the file upload and processing functionality."
                        })
                    ],
                }),
            ],
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync('./test-document.docx', buffer);
    console.log('Test document created: test-document.docx');
}

createTestDocument().catch(console.error);
