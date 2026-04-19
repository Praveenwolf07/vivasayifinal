import { c as createServerRpc } from "./createServerRpc-BKc-oisr.mjs";
import { g as getGeminiInstance } from "./geminiService-B0P6Ma45.mjs";
import { c as createServerFn } from "./index.mjs";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const optimizeRoute_createServerFn_handler = createServerRpc({
  id: "5f6ede81e6b4161f5dc8d79643623309e6247a09cb1e0e9403067fc7541ac911",
  name: "optimizeRoute",
  filename: "src/server/optimize-route.ts"
}, (opts) => optimizeRoute.__executeServer(opts));
const optimizeRoute = createServerFn({
  method: "POST"
}).inputValidator((d) => d).handler(optimizeRoute_createServerFn_handler, async ({
  data
}) => {
  try {
    const ai = getGeminiInstance();
    const prompt = `You are an AI logistics assistant for a farmer-to-buyer marketplace.
Given this order:
Pickup Location: ${data.pickup || "Unknown"}
Quantity: ${data.quantity} units
Total Price: ₹${data.total_price}

Provide an optimized routing estimate as a JSON object with these exact exact keys:
"eta_hours" (number), "cost_estimate" (number), "tip" (short string advice for the transporter).
Do not include markdown blocks, just the raw JSON.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    const text = response.text || "{}";
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleaned);
    return {
      eta_hours: result.eta_hours || Math.floor(Math.random() * 24) + 6,
      cost_estimate: result.cost_estimate || Math.floor(Math.random() * 1e3) + 200,
      tip: result.tip || "Combine with other local pickups to save fuel."
    };
  } catch (err) {
    const error = err;
    console.error("AI Route Opt Error:", error?.message || err);
    return {
      eta_hours: Math.floor(Math.random() * 24) + 6,
      cost_estimate: Math.floor(Math.random() * 1e3) + 200,
      tip: "Avoid peak traffic in the afternoon."
    };
  }
});
export {
  optimizeRoute_createServerFn_handler
};
