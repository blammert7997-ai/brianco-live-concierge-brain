import { z } from "zod";
import { setCors } from "../lib/cors.js";
import { supabase } from "../lib/supabase.js";
import { openai, model } from "../lib/openai.js";
import { brianCoSystemPrompt } from "../lib/prompt.js";

const ChatBody = z.object({
  sessionId: z.string().min(1),
  customerId: z.string().optional(),
  message: z.string().min(1),
  locale: z.string().optional(),
  region: z.string().optional(),
  page: z.string().optional()
});

async function loadMemory(db, input) {
  const memory = { profile: null, preferences: null, recent: [] };
  if (input.customerId) {
    const { data: profile } = await db.from("customer_profiles").select("*").eq("id", input.customerId).maybeSingle();
    const { data: pref } = await db.from("customer_preferences").select("*").eq("customer_id", input.customerId).maybeSingle();
    memory.profile = profile || null;
    memory.preferences = pref || null;
  }
  const { data: turns } = await db
    .from("conversation_turns")
    .select("user_message, assistant_message")
    .eq("session_id", input.sessionId)
    .order("created_at", { ascending: false })
    .limit(6);
  memory.recent = (turns || []).reverse();
  return memory;
}

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const input = ChatBody.parse(req.body);
    const db = supabase();
    const ai = openai();
    const memory = await loadMemory(db, input);

    await db.from("analytics_events").insert({
      customer_id: input.customerId || null,
      session_id: input.sessionId,
      event_type: "chat_message",
      payload: { locale: input.locale, region: input.region, page: input.page }
    });

    const messages = [
      { role: "system", content: brianCoSystemPrompt({ memory, locale: input.locale, region: input.region, page: input.page }) },
      ...memory.recent.flatMap(t => [
        { role: "user", content: t.user_message },
        { role: "assistant", content: t.assistant_message }
      ]),
      { role: "user", content: input.message }
    ];

    const completion = await ai.chat.completions.create({
      model,
      messages,
      temperature: 0.55
    });

    const reply = completion.choices?.[0]?.message?.content || "I’m here to help with Brian & Co.";

    await db.from("conversation_turns").insert({
      customer_id: input.customerId || null,
      session_id: input.sessionId,
      user_message: input.message,
      assistant_message: reply,
      locale: input.locale || null,
      region: input.region || null
    });

    res.status(200).json({ ok: true, reply });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
