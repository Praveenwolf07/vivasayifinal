import { createServerFn } from "@tanstack/react-start";
import { getGeminiInstance } from "./geminiService";

export const suggestBid = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      product: {
        name: string;
        category: string;
        price_per_unit: number;
        location: string;
        quality_grade: string;
        demand_score: number | null;
      };
    }) => d,
  )
  .handler(async ({ data }) => {
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
        contents: prompt,
      });

      const text = response.text || "{}";
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const result = JSON.parse(cleaned);

      return {
        suggested_price: result.suggested_price || Math.floor(data.product.price_per_unit * 0.95),
        reasoning: result.reasoning || "Standard 5% discount for a starting bid.",
      };
    } catch (err: unknown) {
      console.error("AI Suggest Bid Error:", err);
      // Fallback
      return {
        suggested_price: Math.floor(data.product.price_per_unit * 0.95),
        reasoning: "Standard 5% discount estimate.",
      };
    }
  });
