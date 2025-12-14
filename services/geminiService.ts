
import { GoogleGenAI, Type } from "@google/genai";
import { User, Quest } from "../types";

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

export const generateQuest = async (user: User): Promise<Partial<Quest> | null> => {
  const ai = initGenAI();
  if (!ai) return null;

  try {
    // Construct a prompt that analyzes user stats
    const statsContext = `
      Strength: ${user.stats.strength}, 
      Agility: ${user.stats.agility}, 
      Endurance: ${user.stats.endurance}, 
      Vitality: ${user.stats.vitality},
      Fatigue: ${user.stats.fatigue_level}
    `;

    const prompt = `
      Generate a dynamic fitness RPG quest for a Level ${user.level} Hunter.
      Analyze the stats: [${statsContext}].
      If a stat is low, suggest training for it. If fatigue is high, suggest recovery.
      
      The quest type should be 'SUDDEN' (urgent/random) or 'STORY' (progression).
      The difficulty should generally match their Rank (${user.rank}), but occasionally be harder.
      The output must be valid JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ['E', 'D', 'C', 'B', 'A', 'S'] },
            type: { type: Type.STRING, enum: ['DAILY', 'STORY', 'SUDDEN'] },
            xpReward: { type: Type.NUMBER },
            penalty: { type: Type.STRING, nullable: true },
            objectives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  total: { type: Type.NUMBER },
                  unit: { type: Type.STRING, nullable: true }
                },
                required: ["text", "total"]
              }
            },
            statRewards: {
              type: Type.OBJECT,
              properties: {
                strength: { type: Type.NUMBER, nullable: true },
                agility: { type: Type.NUMBER, nullable: true },
                endurance: { type: Type.NUMBER, nullable: true },
                vitality: { type: Type.NUMBER, nullable: true },
                intelligence: { type: Type.NUMBER, nullable: true },
                focus: { type: Type.NUMBER, nullable: true },
                flexibility: { type: Type.NUMBER, nullable: true },
                stamina: { type: Type.NUMBER, nullable: true }
              }
            }
          },
          required: ["title", "description", "difficulty", "type", "xpReward", "objectives"]
        }
      }
    });

    if (response.text) {
       return JSON.parse(response.text) as Partial<Quest>;
    }
    return null;

  } catch (error) {
    console.error("Quest generation failed", error);
    return null;
  }
};

export const generateHunterProfileImage = async (user: User, customDetails?: string): Promise<string | null> => {
  const ai = initGenAI();
  if (!ai) return null;

  try {
    const isHighRank = user.rank.includes('S') || user.rank.includes('National');
    const isMidRank = user.rank.includes('A') || user.rank.includes('B');
    
    let baseAppearance = "";
    if (isHighRank) {
        baseAppearance = "Legendary hunter, glowing magical aura, confident and menacing expression, intricate glowing futuristic armor, god-tier power radiating, glowing eyes.";
    } else if (isMidRank) {
        baseAppearance = "Experienced hunter, solid combat gear, focused expression, holding a weapon, subtle magical aura.";
    } else {
        baseAppearance = "Novice hunter, wearing a simple track suit or basic light armor, determined but rookie appearance, sweating slightly.";
    }

    // Combine base rank appearance with user custom details
    const appearancePrompt = customDetails 
        ? `User Specifications: "${customDetails}". Base archetype: ${baseAppearance}`
        : baseAppearance;

    const prompt = `
      Generate a high-quality anime style portrait for an ID Card.
      Character Name: ${user.name}.
      Role: ${user.job_class}.
      Appearance Description: ${appearancePrompt}
      Art Style: Solo Leveling manhwa style, high contrast, cool lighting, digital art, sharp lines. 
      Background: Abstract dark digital pattern.
      Format: Passport photo style, head and shoulders.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
          imageConfig: {
              aspectRatio: "3:4"
          }
      }
    });

    // Extract image from response parts
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            }
        }
    }
    
    return null;

  } catch (error) {
    console.error("Image generation failed", error);
    return null;
  }
};
