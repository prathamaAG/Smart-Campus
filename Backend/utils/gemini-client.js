const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiClient {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("Gemini API key not found in environment variables");
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = null; // Will be initialized on first use
      this.workingModelName = null;
      console.log(
        "Gemini client created. Model will be initialized on first request."
      );
    } catch (error) {
      console.error("Failed to create Gemini client:", error);
    }
  }

  async initializeModel() {
    if (this.model) {
      return; // Already initialized
    }

    console.log("Initializing and finding a working Gemini model...");

    // New, corrected model list with your requested models prioritized.
    const modelsToTry = [
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-1.5-pro-latest",
      "gemini-1.5-flash-latest",
      "gemini-pro",
      "gemini-1.0-pro",
    ];

    try {
      for (const modelName of modelsToTry) {
        try {
          console.log(`Attempting to get model: ${modelName}`);
          const model = this.genAI.getGenerativeModel({ model: modelName });
          // Perform a lightweight check to see if the model is accessible
          await model.countTokens("test");
          this.model = model;
          this.workingModelName = modelName;
          console.log(
            `✅ Successfully initialized working model: ${modelName}`
          );
          return; // Exit after finding the first working model
        } catch (e) {
          console.log(`- Model ${modelName} is not available, trying next...`);
        }
      }

      // If the loop completes without finding a model
      throw new Error(
        "None of the tried models are available for your API key."
      );
    } catch (error) {
      console.error("Could not initialize any Gemini model:", error);
      throw new Error(
        "Failed to find a working AI model. Please check your API key and Google Cloud project settings."
      );
    }
  }

  async enhanceDocument(content, paperType, paperTitle) {
    // Initialize model if not already done
    if (!this.model) {
      await this.initializeModel();
    }

    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (!process.env.GEMINI_API_KEY) {
          throw new Error("Gemini API key not configured");
        }

        if (!this.model) {
          throw new Error("No working Gemini model could be initialized.");
        }

        const prompt = this.createPromptByType(content, paperType, paperTitle);

        console.log(
          `Sending request to Gemini API (attempt ${attempt}/${maxRetries}) for: ${paperType}`
        );
        console.log(`Using model: ${this.workingModelName}`);

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text || text.trim().length === 0) {
          throw new Error("Empty response from Gemini API");
        }

        console.log(
          "Gemini API response received successfully, length:",
          text.length
        );
        return text;
      } catch (error) {
        lastError = error;
        console.error(
          `Attempt ${attempt}/${maxRetries} failed:`,
          error.message
        );

        if (error.message.includes("API key not valid")) {
          throw new Error(
            "Invalid API key. Please get a new API key from https://aistudio.google.com/"
          );
        }

        if (error.status === 503 && attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(
            `Service unavailable. Waiting ${waitTime}ms before retry...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }

        // Don't retry on other persistent errors
        break;
      }
    }

    // Handle final error after all retries
    console.error("All attempts failed. Last error:", lastError);

    if (lastError.message.includes("API key")) {
      throw new Error(
        "Invalid API key. Please check your API key and project settings."
      );
    } else if (lastError.message.includes("quota")) {
      throw new Error("API quota exceeded. Please try again later.");
    } else if (lastError.status === 503) {
      throw new Error(
        "AI service is temporarily overloaded. Please try again in a few minutes."
      );
    } else if (lastError.status === 404) {
      throw new Error(
        `The model ${this.workingModelName} was not found. It might be a regional issue.`
      );
    } else {
      throw new Error(
        "Failed to get a response from the AI service after multiple attempts."
      );
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  createPromptByType(content, paperType, paperTitle) {
    const baseInstructions = `
Role (Persona): Act as an expert academic tutor and comprehensive assignment solver.
Task: Analyze the provided ${paperType.toLowerCase()} content and generate a comprehensive, precise, and educational solution.
Context: The output must serve as a complete, self-contained solution document that promotes student learning and understanding, adhering strictly to high academic and pedagogical standards.
Expectation (Format/Output): The entire response must be a structured, single document containing only the solution and explanations, formatted clearly using markdown for headings, bold text, lists, and formulas. Do not include any introductory phrases, closing remarks, or meta-commentary about the solving process.

--- INSTRUCTIONS FOR SOLUTION GENERATION ---

1. Solution Detail (Comprehensive & Precise):
   - Answer every question, problem, or task completely and accurately.
   - For mathematical or technical problems, show all step-by-step working and reasoning.
   - Provide detailed, educational explanations for theoretical or conceptual questions.
   - Include relevant examples, case studies, or practical applications where applicable to reinforce learning.

2. Key Pedagogical Elements:
    Integrate explanations of relevant theories, formulas, key concepts, principles, or laws immediately preceding or following the respective solution sections.
    Provide additional valuable insights related to the topic of the assignment.

3. Strict Structure and Formatting :
   - Use clear headings (e.g., H2/H3 syntax) for the assignment title and each question/section.
   - For headings, use numbers (1., 2., 3.) or plain text
   - For lists, use bullet points (•) or numbers
   - Do not use markdown symbols like **, ##, ###, or # for formatting
   - Number the answers corresponding to the questions/tasks.
   - Use bold for major headings and important technical terms.
   - Use italics for emphasis.
   - Use numbered lists for sequential steps or procedures.
   - Use bullet points with dots (•) for features, characteristics, or multiple list items.
   - Format all formulas and complex equations clearly using LaTeX (e.g., $$...$$ or $...$ format for clarity).
   - If the assignment is an essay, provide a full, structured essay (Introduction, Body, Conclusion) under a clear heading.
   - If the content contains multiple-choice questions, provide the correct answer clearly.

4. Academic Integrity:
   - Ensure all information is factually correct and presented with academic depth.
   - Maintain the highest level of educational value in every part of the response.

5. Final Output Rule:
   - The final output must be only the structured assignment solution, ready to be presented in a document.
   - Do not generate any file path, system instruction, or external commentary in the output.
`;

    let specificInstructions = "";

    switch (paperType.toLowerCase()) {
      case "assignment":
        specificInstructions = `
 ASSIGNMENT SOLUTION FORMAT:
- Title:  ${paperTitle} (Times New Roman, black text)
- For each question:
  - Question [Number]: [Restate the question]
  - Solution: [Step-by-step solution]
  - Explanation: [Educational reasoning]
`;
        break;

      case "question paper":
        specificInstructions = `
 QUESTION PAPER SOLUTION FORMAT:
- Title:  ${paperTitle} - Complete Solutions (Times New Roman, black text)
- For each question:
  - Question [Number]: [Restate the question]
  - Answer: [Direct, precise answer]
  - Solution Steps: [Detailed working]
`;
        break;

      case "research paper":
        specificInstructions = `
 RESEARCH PAPER FORMAT:
- Title:  ${paperTitle} (Times New Roman, black text)
- Abstract: [Enhanced summary]
- Introduction: [Improved background]
- Methodology: [Detailed approach]
- Results & Analysis: [Key insights]
- Conclusion: [Well-supported conclusions]
`;
        break;

      case "case study":
        specificInstructions = `
 CASE STUDY FORMAT:
- Title:  ${paperTitle} (Times New Roman, black text)
- Problem Statement: [Clear identification of issues]
- Analysis: [Detailed examination]
- Solutions/Recommendations: [Practical solutions]
- Conclusion:[Key learnings]
`;
        break;

      case "project report":
        specificInstructions = `
 PROJECT REPORT FORMAT:
- Title: ${paperTitle} (Times New Roman, black text)
- Project Overview: [Description and scope]
- Methodology:[Approach and tools]
- Implementation:[Development process]
- Results:[Outcomes and achievements]
- Conclusion: [Project success and lessons learned]
`;
        break;

      default:
        specificInstructions = `
 DOCUMENT SOLUTION FORMAT:
- Title:  ${paperTitle} (Times New Roman, black text)
- Provide comprehensive solutions systematically
- Show detailed working and explanations
`;
    }

    return `${baseInstructions}\n${specificInstructions}\n\n**Original ${paperType} Content to Solve:**\n\n${content}`;
  }
}

module.exports = new GeminiClient();
