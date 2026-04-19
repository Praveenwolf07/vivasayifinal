import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { product } = await req.json();
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
            content: "You help buyers place fair, competitive bids on Indian agricultural produce.",
          },
          {
            role: "user",
            content: `Suggest a fair bid price for:\n${JSON.stringify(product)}\n\nReturn a single suggested bid price (₹/unit) and one short reason.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest",
              parameters: {
                type: "object",
                properties: { suggested_price: { type: "number" }, reasoning: { type: "string" } },
                required: ["suggested_price", "reasoning"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429)
        return new Response(JSON.stringify({ error: "Rate limit" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (resp.status === 402)
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      throw new Error(`AI ${resp.status}`);
    }
    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    return new Response(args ?? "{}", {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("suggest-bid error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
