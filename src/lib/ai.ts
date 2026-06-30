import { GoogleGenAI } from "@google/genai";

export async function summarizeIssue(title: string, body: string | null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "AI Summary skipped (No API key).";
  
  const ai = new GoogleGenAI({ apiKey });
  const MODEL_NAME = process.env.GEMINI_MODEL_NAME || 'gemini-2.5-flash';
  
  try {
    const prompt = `Summarize the following GitHub issue in 2-3 concise sentences. Focus on the core problem or request. \n\nTitle: ${title}\nBody: ${body || 'No description provided.'}`;
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("AI summarization failed:", error);
    return "AI summarization failed due to an error.";
  }
}
