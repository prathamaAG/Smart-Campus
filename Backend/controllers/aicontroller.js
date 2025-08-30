

// Polyfill fetch, Headers, Request, Response for OpenAI SDK (CommonJS, node-fetch v2)
const fetch = require('node-fetch');
globalThis.fetch = fetch;
globalThis.Headers = fetch.Headers;
globalThis.Request = fetch.Request;
globalThis.Response = fetch.Response;


// Polyfill Blob for OpenAI SDK (node-fetch v2 does not provide Blob)
if (typeof globalThis.Blob === 'undefined') {
    globalThis.Blob = require('buffer').Blob;
}

// Polyfill FormData for OpenAI SDK (node-fetch v2 does not provide FormData)
if (typeof globalThis.FormData === 'undefined') {
    globalThis.FormData = require('formdata-node').FormData;
}

const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

exports.getAIChatResponse = async (req, res) => {
    const { history, prompt } = req.body;

    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: "OpenAI API key is not configured on the server." });
    }

    // Transform the chat history to the format OpenAI expects
    const messages = history.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.text
    }));
    messages.push({ role: "user", content: prompt });

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
        });

        const botResponse = completion.choices[0]?.message?.content || "Sorry, I couldn't get a response.";
        
        res.json({ responseText: botResponse });

    } catch (error) {
        console.error("Failed to call OpenAI API:", error);
        res.status(500).json({ message: "Failed to get a response from the AI service." });
    }
};