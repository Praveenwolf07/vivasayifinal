import { GoogleGenAI } from "@google/genai";

// DO NOT cache a broken instance — reset if key changes or was invalid.
let aiInstance: GoogleGenAI | null = null;
let cachedKey: string | null = null;

export function getGeminiInstance(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY?.trim();

  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to your .env file or deployment secrets.",
    );
  }

  // Basic sanity-check: Gemini API keys start with "AIza"
  if (!key.startsWith("AIza")) {
    throw new Error(
      `GEMINI_API_KEY appears invalid (expected format starts with "AIza..."). ` +
        `Verify your key at https://aistudio.google.com/app/apikey`,
    );
  }

  // Rebuild instance if key has changed (supports hot-reload & key rotation)
  if (!aiInstance || cachedKey !== key) {
    aiInstance = new GoogleGenAI({ apiKey: key });
    cachedKey = key;
  }

  return aiInstance;
}

/**
 * Resets the cached Gemini instance.
 * Call this if you suspect the key has been rotated or is invalid.
 */
export function resetGeminiInstance(): void {
  aiInstance = null;
  cachedKey = null;
}
