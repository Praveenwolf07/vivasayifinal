import { c as createServerRpc } from "./createServerRpc-BKc-oisr.mjs";
import { g as getGeminiInstance } from "./geminiService-B0P6Ma45.mjs";
import { c as createServerFn } from "./index.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const suggestBid_createServerFn_handler = createServerRpc({
  id: "df43cfb8f55559d221a55fd494aa95e48c27f4611abe9e2d3e13a61da1e76c1b",
  name: "suggestBid",
  filename: "src/server/suggest-bid.ts"
}, (opts) => suggestBid.__executeServer(opts));
const suggestBid = createServerFn({
  method: "POST"
}).inputValidator((d) => d).handler(suggestBid_createServerFn_handler, async ({
  data
}) => {
  try {
    const ai = getGeminiInstance();
    const prompt = `You are a marketplace pricing AI.
Analyze this product:
Name: ${data.product.name}
Category: ${data.product.category}
Location: ${data.product.location}
Quality: ${data.product.quality_grade}
Listed Price: ₹${data.product.price_per_unit}/unit
Demand Score: ${data.product.demand_score || "Unknown"}

Suggest a competitive bid price for a buyer. Provide the response as a JSON object with these exact keys:
"suggested_price" (number),
"reasoning" (short string explaining why).
Do not include markdown blocks, just the raw JSON.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    const text = response.text || "{}";
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleaned);
    return {
      suggested_price: result.suggested_price || Math.floor(data.product.price_per_unit * 0.95),
      reasoning: result.reasoning || "Standard 5% discount for a starting bid."
    };
  } catch (err) {
    console.error("AI Suggest Bid Error:", err);
    return {
      suggested_price: Math.floor(data.product.price_per_unit * 0.95),
      reasoning: "Standard 5% discount estimate."
    };
  }
});
export {
  suggestBid_createServerFn_handler
};
