import { GoogleGenAI } from "@google/genai";
import { JADE_COLLECTION } from "../constants";

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai && process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const generateMuseumResponse = async (
  currentJadeId: string,
  userQuery: string,
  history: { role: string; text: string }[]
) => {
  const client = getAI();
  if (!client) {
    return "Please configure your API_KEY to speak with the curator.";
  }

  const jade = JADE_COLLECTION.find((j) => j.id === currentJadeId);
  const context = `
    You are an expert Jade Museum Curator at a prestigious digital museum.
    The user is currently looking at: ${jade?.name} (${jade?.chineseName}).
    Period: ${jade?.period}.
    Description: ${jade?.description}.
    
    Answer the user's question about this artifact or jade culture in general.
    Keep your response concise (under 80 words), elegant, and educational.
    If the question is unrelated to the museum, politely steer it back to the jade.
  `;

  try {
    const chat = client.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: context,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: userQuery });
    return result.text || "I apologize, but I cannot answer that question at the moment.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "My apologies, I am momentarily distracted by the beauty of this stone. Could you repeat that?";
  }
};