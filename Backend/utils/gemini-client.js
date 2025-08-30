const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class GeminiClient {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async enhanceDocument(content, paperType, paperTitle) {
        try {
            if (!process.env.GEMINI_API_KEY) {
                throw new Error('Gemini API key not configured');
            }

            const prompt = `
You are an academic writing assistant. Please enhance the following ${paperType} titled "${paperTitle}".

Original content:
${content}

Please:
1. Improve the academic writing style and clarity
2. Add proper citations and references where appropriate
3. Enhance the structure and flow
4. Add relevant academic insights
5. Ensure the content is well-researched and scholarly
6. Make it undetectable as AI-generated content

Return only the enhanced content without any explanatory text.
`;

            console.log('Sending request to Gemini API...');
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            if (!text || text.trim().length === 0) {
                throw new Error('Empty response from Gemini API');
            }
            
            console.log('Gemini API response received successfully');
            return text;
        } catch (error) {
            console.error('Error enhancing document with Gemini:', error);
            if (error.message.includes('API key')) {
                throw new Error('AI service configuration error');
            } else if (error.message.includes('quota') || error.message.includes('limit')) {
                throw new Error('AI service quota exceeded. Please try again later.');
            } else {
                throw new Error('Failed to enhance document with AI');
            }
        }
    }
}

module.exports = new GeminiClient();
