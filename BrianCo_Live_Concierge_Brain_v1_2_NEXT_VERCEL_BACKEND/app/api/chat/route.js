import { corsHeaders, optionsResponse } from "../../../lib/cors.js";
import { getSupabase } from "../../../lib/supabase.js";
import { getOpenAI, OPENAI_MODEL } from "../../../lib/openai.js";
import { buildSystemPrompt } from "../../../lib/prompt.js";

export async function OPTIONS() {
  return optionsResponse();
}

async function loadMemory(db, body) {
  const memory = { profile: null, preferences: null, recent: [] };

  if (body.customerId) {
    const { data: profile } = await db.from("customer_profiles").select("*").eq("id", body.customerId).maybeSingle();
    const { data: preferences } = await db.from("customer_preferences").select("*").eq("customer_id", body.customerId).maybeSingle();
    memory.profile = profile || null;
    memory.preferences = preferences || null;
  }

  if (body.sessionId) {
    const { data: turns } = await db
      .from("conversation_turns")
      .select("user_message, assistant_message")
      .eq("session_id", body.sessionId)
      .order("created_at", { ascending: false })
      .limit(6);
    memory.recent = (turns || []).reverse();
  }

  return memory;
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.message || !body.sessionId) {
      return Response.json({ ok: false, error: "message and sessionId are required" }, { status: 400, headers: corsHeaders() });
    }

    const db = getSupabase();
    const ai = getOpenAI();
    const memory = await loadMemory(db, body);

    const messages = [
      { role: "system", content: buildSystemPrompt({ memory, locale: body.locale, region: body.region, page: body.page }) },
      ...memory.recent.flatMap(t => [
        { role: "user", content: t.user_message },
        { role: "assistant", content: t.assistant_message }
      ]),
      { role: "user", content: body.message }
    ];

    const completion = await ai.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      temperature: 0.55
    });

    const reply = completion.choices?.[0]?.message?.content || "I’m here to help with Brian & Co.";

    await db.from("conversation_turns").insert({
      customer_id: body.customerId || null,
      session_id: body.sessionId,
      user_message: body.message,
      assistant_message: reply,
      locale: body.locale || null,
      region: body.region || null
    });

    await db.from("analytics_events").insert({
      customer_id: body.customerId || null,
      session_id: body.sessionId,
      event_type: "chat_reply",
      payload: { replyLength: reply.length, page: body.page || null }
    });

    return Response.json({ ok: true, reply }, { headers: corsHeaders() });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500, headers: corsHeaders() });
  }
}
