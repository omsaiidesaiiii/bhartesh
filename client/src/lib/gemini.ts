import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateCareerRoadmap(goal: string) {
  if (!API_KEY) {
    throw new Error("Gemini API Key not found. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env file.");
  }

  // Use Gemini 2.5 Flash if available, otherwise 1.5-flash as fallback
  // The user specifically asked for "2.5 flash"
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", // Using the 2.5 flash model as requested
    generationConfig: {
        responseMimeType: "application/json",
    }
  });

  const prompt = `Act as an expert career counselor. Provide a comprehensive, step-by-step career roadmap for a student who wants to become a "${goal}". 
  The roadmap should be highly detailed, including:
  1. A clear title and encouraging description.
  2. Technical milestones (languages, frameworks, tools).
  3. Soft skills required.
  4. Reliable online resources for each step (include names and placeholder URLs like 'https://roadmap.sh' or 'https://coursera.org', etc.).
  5. Estimated time to reach proficiency.

  Format the response STRICTLY as a JSON object with this structure:
  {
    "title": "Roadmap to becoming a [Career Goal]",
    "description": "...",
    "estimatedTime": "...",
    "phases": [
      {
        "name": "Phase 1: Foundation",
        "items": [
          {
            "title": "...",
            "description": "...",
            "resources": [
              { "name": "...", "url": "..." }
            ]
          }
        ]
      }
    ]
  }`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
