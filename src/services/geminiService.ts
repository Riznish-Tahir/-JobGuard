import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function verifyCompanyLegitimacy(companyName: string, website: string, details: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing. Please add it to your secrets.");
  }

  const prompt = `
    Analyze the following company for potential hiring scams or recruitment fraud.
    Company Name: ${companyName}
    Website: ${website}
    Additional Details: ${details}

    Based on your knowledge of common job scams (e.g., identity theft, fake checks, advance fee fraud), provide:
    1. A legitimacy score from 0 (Definite Scam) to 100 (Seems Legit).
    2. A brief analysis of red flags (if any).
    3. Recommendations for the job seeker.

    Return the output in the following JSON format:
    {
      "score": number,
      "analysis": "string",
      "redFlags": ["string"],
      "recommendations": ["string"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Verification Error:", error);
    throw error;
  }
}
