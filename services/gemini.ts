
import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAssistantResponse(history: Message[], latestPrompt: string): Promise<string> {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are Nova, a helpful and concise voice assistant. Your responses should be conversational, clear, and relatively brief for easy text-to-speech output. Avoid overly complex markdown. Keep it friendly.",
      },
    });

    // We only send a subset of history if it's too long, but for a minimal app we'll send it all
    // Note: In a production app, you'd map history to the Gemini format.
    // For this prototype, we'll just send the current message to keep it snappy.
    const response = await chat.sendMessage({ message: latestPrompt });
    return response.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error while thinking. Please try again.";
  }
}
