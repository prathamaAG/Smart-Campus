const { GoogleGenerativeAI } = require("@google/generative-ai");

class QuestionGenerator {
    constructor() {
        this.genAI = null;
        this.model = null;
        this.workingModelName = null;
    }

    async initializeModel() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Gemini API key not configured");
        }

        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        const modelNames = [
            'gemini-2.5-pro',
            'gemini-2.5-flash',
            'gemini-1.5-pro-latest',
            'gemini-1.5-flash-latest',
            'gemini-pro',
            'gemini-1.0-pro',
        ];

        for (const modelName of modelNames) {
            try {
                console.log(`Trying to initialize ${modelName}...`);
                this.model = this.genAI.getGenerativeModel({ model: modelName });
                
                // Test the model
                const testResult = await this.model.generateContent("Test");
                await testResult.response.text();
                
                this.workingModelName = modelName;
                console.log(`✅ Successfully initialized ${modelName}`);
                return;
            } catch (error) {
                console.log(`❌ ${modelName} failed:`, error.message);
            }
        }
        
        throw new Error("No working Gemini model could be initialized");
    }

    async generateQuestions(studentSolutionContent, assignmentTitle, subject) {
        if (!this.model) {
            await this.initializeModel();
        }

        const prompt = `
Role: Act as an experienced academic examiner and question designer.

Task: Based on the student's solution provided below, generate exactly 3 evaluation questions of varying difficulty levels to test the student's understanding during an oral examination.

Context: 
- Assignment Title: ${assignmentTitle}
- Subject: ${subject}
- The questions should be based on the concepts, methods, and solutions the student has provided
- Questions should test depth of understanding, not just memorization

Instructions:
1. Generate exactly 3 questions:
   - Question 1: EASY - Basic concept understanding
   - Question 2: MODERATE - Application and analysis  
   - Question 3: MODERATE - Critical thinking or extension

2. For each question, provide:
   - The question text
   - Difficulty level
   - Expected key points the student should cover
   - Estimated time for answer (2-5 minutes)

3. Questions should be:
   - Directly related to the content in the student's solution
   - Open-ended to allow for discussion
   - Suitable for oral examination
   - Progressive in difficulty

4. Format the response as JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "question text",
      "difficulty": "Easy|Moderate",
      "expectedKeyPoints": ["point1", "point2", "point3"],
      "estimatedTime": "3 minutes",
      "rationale": "why this question tests understanding"
    }
  ]
}

Student's Solution Content:
${studentSolutionContent}

Generate the questions now:`;

        try {
            console.log('Generating questions with Gemini AI...');
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Try to extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const questionsData = JSON.parse(jsonMatch[0]);
                return questionsData.questions;
            } else {
                // Fallback: parse text manually
                return this.parseQuestionsFromText(text);
            }
        } catch (error) {
            console.error('Error generating questions:', error);
            throw new Error('Failed to generate questions from student solution');
        }
    }

    parseQuestionsFromText(text) {
        // Fallback parser if JSON parsing fails
        const questions = [];
        const lines = text.split('\n');
        let currentQuestion = null;

        for (let line of lines) {
            line = line.trim();
            if (line.toLowerCase().includes('question 1') || 
                line.toLowerCase().includes('question 2') || 
                line.toLowerCase().includes('question 3')) {
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }
                currentQuestion = {
                    id: questions.length + 1,
                    question: line,
                    difficulty: line.toLowerCase().includes('easy') ? 'Easy' : 'Moderate',
                    expectedKeyPoints: [],
                    estimatedTime: '3 minutes',
                    rationale: 'Tests understanding of key concepts'
                };
            } else if (currentQuestion && line.length > 0) {
                if (!currentQuestion.question.includes(line)) {
                    currentQuestion.question += ' ' + line;
                }
            }
        }

        if (currentQuestion) {
            questions.push(currentQuestion);
        }

        return questions.slice(0, 3); // Ensure only 3 questions
    }
}

module.exports = new QuestionGenerator();