
import { GoogleGenAI, Type } from "@google/genai";
import { User, Quest, SystemState } from "../types";
import { isHighRank, isMidRank } from "../rankUtils";

const initGenAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// --- FALLBACK DATA FOR OFFLINE MODE ---

const FALLBACK_MESSAGES = [
  "[SYSTEM NOTICE] External server connection lost. Local protocols engaged.",
  "[SYSTEM NOTICE] Quota limit reached. Switching to offline training mode.",
  "[SYSTEM NOTICE] High network traffic detected. Standby for reconnection.",
  "[SYSTEM NOTICE] Connection unstable. Focus on physical drills."
];

const FALLBACK_QUESTS: Record<string, Partial<Quest>[]> = {
  [SystemState.NORMAL]: [
      {
          title: "BASIC CONDITIONING (OFFLINE)",
          description: "Network unavailable. Maintain basic physical readiness.",
          difficulty: 'E',
          type: 'DAILY',
          xpReward: 100,
          objectives: [
              { text: "Push-ups", total: 20, current: 0 },
              { text: "Squats", total: 30, current: 0 },
              { text: "Plank (sec)", total: 45, current: 0 }
          ],
          statRewards: { strength: 1, endurance: 1 }
      },
      {
          title: "CARDIO DRILL (OFFLINE)",
          description: "Standard endurance test.",
          difficulty: 'D',
          type: 'SUDDEN',
          xpReward: 120,
          objectives: [
              { text: "Jumping Jacks", total: 50, current: 0 },
              { text: "High Knees", total: 40, current: 0 }
          ],
          statRewards: { agility: 1, stamina: 1 }
      }
  ],
  [SystemState.OVERLOAD]: [
      {
          title: "MANDATORY REST (OFFLINE)",
          description: "System overload detected. Recover energy immediately.",
          difficulty: 'E',
          type: 'SUDDEN',
          xpReward: 50,
          objectives: [
              { text: "Deep Breathing (min)", total: 5, current: 0 },
              { text: "Drink Water (ml)", total: 500, current: 0 }
          ],
          penalty: "Fatigue accumulation will double.",
          statRewards: { fatigue_level: -10 } as any
      }
  ],
  [SystemState.AWAKENING]: [
      {
          title: "LIMIT BREAKER (OFFLINE)",
          description: "Connection severed but your power is overflowing. Push beyond limits.",
          difficulty: 'A',
          type: 'STORY',
          xpReward: 500,
          objectives: [
              { text: "Max Push-ups", total: 100, current: 0 },
              { text: "Max Squats", total: 100, current: 0 },
              { text: "Run (km)", total: 5, current: 0 }
          ],
          statRewards: { strength: 3, agility: 3, power_index: 10 }
      }
  ]
};

const getFallbackQuest = (user: User): Partial<Quest> => {
  const pool = FALLBACK_QUESTS[user.system_state] || FALLBACK_QUESTS[SystemState.NORMAL];
  const template = pool[Math.floor(Math.random() * pool.length)];
  
  // Add slight randomness to prevent stale IDs/XP
  return {
      ...template,
      title: `${template.title} #${Math.floor(Math.random() * 100)}`,
      xpReward: (template.xpReward || 100) + Math.floor(user.level * 2),
      objectives: template.objectives?.map(obj => ({
          ...obj,
          total: Math.floor(obj.total * (1 + (user.level * 0.05))) // Scale slightly with level
      }))
  };
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
  } catch (error: any) {
    console.warn("System generation failed", error);
    // Handle Quota/Rate Limit Errors
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota') || error.message?.includes('quota')) {
        return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
    }
    return "SYSTEM CONNECTION UNSTABLE...";
  }
};

export const generateQuest = async (user: User): Promise<Partial<Quest> | null> => {
  const ai = initGenAI();
  if (!ai) {
      console.warn("API Key missing, returning fallback quest");
      return getFallbackQuest(user);
  }

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

  } catch (error: any) {
    console.error("Quest generation failed", error);
    // Handle Quota/Rate Limit Errors by returning fallback
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota') || error.message?.includes('quota')) {
        return getFallbackQuest(user);
    }
    return null;
  }
};

export const generateHunterProfileImage = async (user: User, customDetails?: string): Promise<string | null> => {
  const ai = initGenAI();
  if (!ai) return null;

  try {
    const highRank = isHighRank(user.rank);
    const midRank = isMidRank(user.rank);

    let baseAppearance = "";
    if (highRank) {
        baseAppearance = "Legendary hunter, glowing magical aura, confident and menacing expression, intricate glowing futuristic armor, god-tier power radiating, glowing eyes.";
    } else if (midRank) {
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

  } catch (error: any) {
    console.error("Image generation failed", error);
    // Images are optional, so we return null on 429 without fallback
    return null;
  }
};
