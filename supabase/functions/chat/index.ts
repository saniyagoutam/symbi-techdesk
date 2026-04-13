import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const campushelp_API_KEY = Deno.env.get("campushelp_API_KEY");
    if (!campushelp_API_KEY) throw new Error("campushelp_API_KEY is not configured");

    // Fetch document context from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: docs } = await supabase
      .from("document_texts")
      .select("filename, content")
      .order("created_at", { ascending: true });

    console.log("Documents found:", docs?.length || 0);
    
    let documentContext = "";
    if (docs && docs.length > 0) {
      console.log("Document filenames:", docs.map(d => d.filename).join(", "));
      const docTexts = docs
        .map((d: any) => `--- Document: ${d.filename} ---\n${d.content}`)
        .join("\n\n");
      // Limit context to ~30k chars to stay within token limits
      const trimmed = docTexts.length > 30000 ? docTexts.slice(0, 30000) + "\n[...truncated]" : docTexts;
      documentContext = `\n\nYou have access to the following uploaded university documents. Use their content to answer questions accurately. Always cite which document your answer comes from when applicable.\n\n${trimmed}`;
      console.log("Total document context length:", trimmed.length);
    } else {
      console.log("No documents found in database");
    }

    const systemPrompt = `You are the official Symbi Techdesk AI Assistant. You ONLY answer questions based on the uploaded university documents provided below. 

STRICT RULES:
- ONLY use information from the uploaded documents to answer questions.
- If the answer is NOT found in the documents, say: "I'm sorry, I don't have information about that in my current documents. Please contact Symbi Techdesk directly for assistance."
- NEVER make up or guess answers. NEVER use general knowledge.
- Always cite which document your answer comes from.
- Be friendly, professional, and concise.
- Format responses with markdown when helpful.${documentContext}`;


    const response = await fetch(
      "https://ai.gateway.campushelp.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${campushelp_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
