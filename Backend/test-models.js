const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testLatestModels() {
    // Latest Gemini models as per Google's documentation
    const models = [
        'gemini-2.0-flash-exp',
        'gemini-1.5-pro',
        'gemini-1.5-flash', 
        'gemini-1.5-flash-8b',
        'gemini-pro'
    ];

    console.log('API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes (first 10 chars: ' + process.env.GEMINI_API_KEY.substring(0, 10) + '...)' : 'No');
    
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ No API key found in .env file');
        return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    for (const modelName of models) {
        try {
            console.log(`\n🧪 Testing model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const result = await model.generateContent("Hello, respond with 'Working!' and the model name");
            const response = await result.response;
            const text = response.text();
            
            console.log(`✅ ${modelName}: ${text.trim()}`);
            break; // Stop at first working model
        } catch (error) {
            console.log(`❌ ${modelName}: ${error.message}`);
            if (error.message.includes('API key not valid')) {
                console.log('🛑 Invalid API key - please get a new one from https://aistudio.google.com/');
                break;
            }
        }
    }
}

testLatestModels();