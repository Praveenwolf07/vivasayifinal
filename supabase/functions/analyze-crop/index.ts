import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { name, category, location, quality_grade, price, quantity } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are an agricultural market analyst for Indian farmers. Be concise and practical.",
          },
          {
            role: "user",
            content: `Analyze this crop listing:\nCrop: ${name}\nCategory: ${category}\nLocation: ${location}\nQuality: ${quality_grade}\nAsking price: ₹${price}/unit\nQuantity: ${quantity}\n\nReturn demand score (0-100), recommended price range, best selling window, and a brief harvest tip.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze",
              parameters: {
                type: "object",
                properties: {
                  demand_score: { type: "integer", minimum: 0, maximum: 100 },
                  price_range: { type: "string" },
                  best_selling_window: { type: "string" },
                  harvest_tip: { type: "string" },
                },
                required: ["demand_score", "price_range", "best_selling_window", "harvest_tip"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429)
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (resp.status === 402)
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      throw new Error(`AI gateway error ${resp.status}`);
    }
    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : {};
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-crop error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
