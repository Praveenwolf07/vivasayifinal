import { createServerFn } from "@tanstack/react-start";
import { getGeminiInstance } from "./geminiService";

export const analyzeCrop = createServerFn({ method: "POST" })
  .inputValidator(
    (d: {
      name: string;
      category: string;
      location: string;
      quality_grade: string;
      price: number;
      quantity: number;
    }) => d,
  )
  .handler(async ({ data }) => {
    try {
      const ai = getGeminiInstance();

      const prompt = `You are an AI agricultural market analyst.
Analyze this crop listing:
Name: ${data.name}
Category: ${data.category}
Location: ${data.location}
Quality: ${data.quality_grade}
Listed Price: ₹${data.price}/unit
Quantity: ${data.quantity}

Provide market insights as a JSON object with these exact keys:
"demand_score" (number from 0-100), 
"price_recommendation" (string, e.g. "₹45-50/kg"), 
"best_selling_window" (string, e.g. "Next 2 weeks"), 
"market_trend" (string, e.g. "High demand in your state").
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
        demand_score: result.demand_score || 65,
        price_recommendation: result.price_recommendation || "Market rate",
        best_selling_window: result.best_selling_window || "Immediate",
        market_trend: result.market_trend || "Stable",
      };
    } catch (err: unknown) {
      console.error("AI Analyze Crop Error:", err);
      // Fallback
      return {
        demand_score: 50,
        price_recommendation: `₹${data.price}/unit`,
        best_selling_window: "Within 1 week",
        market_trend: "Check insights later",
      };
    }
  });
