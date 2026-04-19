import { c as createServerRpc } from "./createServerRpc-BKc-oisr.mjs";
import { g as getGeminiInstance } from "./geminiService-B0P6Ma45.mjs";
import { c as createServerFn } from "./index.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const soilAdvisor_createServerFn_handler = createServerRpc({
  id: "8faeefcc39bbf1ae70eb1b36b28d74a8b4e3a54fe3bacdfd8ec999086f0f7e77",
  name: "soilAdvisor",
  filename: "src/server/soil-advisor.ts"
}, (opts) => soilAdvisor.__executeServer(opts));
const soilAdvisor = createServerFn({
  method: "POST"
}).inputValidator((d) => d).handler(soilAdvisor_createServerFn_handler, async ({
  data
}) => {
  try {
    if (data.ph === 0) {
      return {
        advice: "It looks like the pH value is either 0 or was left blank. Please enter a valid pH value (typically between 3 and 10) for accurate soil analysis and crop recommendations."
      };
    }
    if (data.ph < 0 || data.ph > 14) {
      return {
        advice: "The provided pH value is outside the possible range (0-14). Please enter a valid pH reading to get accurate AI advice."
      };
    }
    const ai = getGeminiInstance();
    let prompt = `You are a soil & crop agronomist. Given:
pH: ${data.ph}, Moisture: ${data.moisture}%, N: ${data.nitrogen}, P: ${data.phosphorus}, K: ${data.potassium} mg/kg
Notes: ${data.notes || "none"}

Give a 4-bullet response: 1) overall soil verdict, 2) 3 best-fit crops, 3) fertilizer/amendment tips, 4) one risk to watch. Be concise (max 120 words total).`;
    if (data.ph < 4 || data.ph > 9) {
      prompt += `
Be sure to mention that the given pH scenario (${data.ph}) is quite extreme and emphasize corrective measures.`;
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    const advice = response.text ?? "No advice generated.";
    return {
      advice
    };
  } catch (err) {
    console.error("\n================ GEMINI API ERROR ================");
    console.error("Gemini API Error:", err);
    console.error("==================================================\n");
    return {
      advice: "We're currently having trouble connecting to our AI advice service. Please try again in a moment."
    };
  }
});
export {
  soilAdvisor_createServerFn_handler
};
