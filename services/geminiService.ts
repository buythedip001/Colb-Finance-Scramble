import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateHint = async (word: string, difficulty: Difficulty = 'MEDIUM'): Promise<string> => {
  const ai = getAiClient();
  
  // Deterministic fallback hint based on difficulty
  let fallbackHint = `It starts with "${word.charAt(0)}" and has ${word.length} letters.`;
  if (difficulty === 'EASY') {
     fallbackHint = `Starts with ${word.charAt(0)}, ends with ${word.charAt(word.length-1)}.`;
  } else if (difficulty === 'HARD') {
     fallbackHint = `A word with ${word.length} letters.`;
  }

  if (!ai) return fallbackHint;

  let promptContext = "";
  if (difficulty === 'EASY') {
      promptContext = "Give a clear, simple definition or synonym. It should be easy for a beginner to guess.";
  } else if (difficulty === 'HARD') {
      promptContext = "Give a cryptic, abstract, or witty riddle. It should be challenging and require deep knowledge.";
  } else {
      promptContext = "Give a clever, standard crossword-style clue. Not too obvious, but solvable.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a hint for the word "${word}" related to Crypto, Finance, or Bees. 
      ${promptContext}
      Max 15 words. Do not contain the word "${word}" itself.`,
    });
    
    const text = response.text?.trim();
    // Return AI text if available, otherwise use fallback
    return text && text.length > 0 ? text : fallbackHint;
  } catch (error) {
    console.error("Failed to generate hint:", error);
    return fallbackHint;
  }
};

export const generateNewWords = async (count: number = 5, categories: string[] = [], difficultyDescription: string = 'standard'): Promise<string[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  const topicString = categories.length > 0 
    ? categories.join(', ') 
    : "Decentralized Finance (DeFi) or Beekeeping/Honey";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a list of ${count} unique single-word nouns related to: ${topicString}. 
      The words should be ${difficultyDescription}.
      Return ONLY a JSON array of uppercase strings. No markdown formatting.
      Example: ["YIELD", "HIVE", "TOKEN"]`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) return [];

    // Clean up if markdown code blocks are present despite instructions
    const jsonStr = text.replace(/^```json\s*|\s*```$/g, '').trim();
    const words = JSON.parse(jsonStr);
    return Array.isArray(words) ? words : [];
  } catch (error) {
    console.error("Failed to generate words:", error);
    return [];
  }
};