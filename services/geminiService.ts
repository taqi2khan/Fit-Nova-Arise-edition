import { GoogleGenAI } from "@google/genai";
import { User } from "../types";

const initGenAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateSystemMessage = async (user: User, context: string): Promise<string> => {
  const ai = initGenAI();
  if (!ai) return "SYSTEM OFFLINE: API KEY MISSING";

  try {
    const prompt = `
      Roleplay as 'The System' from a litRPG like Solo Leveling.
      The user is a 'Hunter' named ${user.name}.
      Current Level: ${user.level}. Rank: ${user.rank}.
      Context: ${context}
      
      Generate a short, robotic, yet motivating system notification message (max 2 sentences).
      Do not use markdown. Use [SYSTEM NOTIFICATION] prefix.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "SYSTEM ERROR";
  } catch (error) {
    console.error("System generation failed", error);
    return "SYSTEM CONNECTION UNSTABLE...";
  }
};