import { createServerFn } from "@tanstack/react-start";
import { getGeminiInstance } from "./geminiService";

export const optimizeRoute = createServerFn({ method: "POST" })
  .inputValidator((d: { pickup?: string; quantity: number; total_price: number }) => d)
  .handler(async ({ data }) => {
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
        contents: prompt,
      });

      const text = response.text || "{}";
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const result = JSON.parse(cleaned);

      return {
        eta_hours: result.eta_hours || Math.floor(Math.random() * 24) + 6,
        cost_estimate: result.cost_estimate || Math.floor(Math.random() * 1000) + 200,
        tip: result.tip || "Combine with other local pickups to save fuel.",
      };
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error("AI Route Opt Error:", error?.message || err);
      // Fallback
      return {
        eta_hours: Math.floor(Math.random() * 24) + 6,
        cost_estimate: Math.floor(Math.random() * 1000) + 200,
        tip: "Avoid peak traffic in the afternoon.",
      };
    }
  });
