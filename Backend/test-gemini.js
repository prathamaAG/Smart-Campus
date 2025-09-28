const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGemini() {
    try {
        console.log('Testing Gemini API...');
        console.log('API Key (first 10 chars):', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'NOT SET');
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent("Hello, can you respond with 'API is working'?");
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ Gemini API is working!');
        console.log('Response:', text);
        
    } catch (error) {
        console.error('❌ Gemini API test failed:');
        console.error('Error:', error.message);
        console.error('Status:', error.status);
        
        if (error.status === 400) {
            console.log('💡 Suggestion: Check if your API key is valid and has the correct permissions');
        } else if (error.status === 404) {
            console.log('💡 Suggestion: The model name might be incorrect. Try "gemini-1.5-flash" or "gemini-1.5-pro"');
        }
    }
}

testGemini();