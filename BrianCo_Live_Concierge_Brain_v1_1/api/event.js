import { z } from "zod";
import { setCors } from "../lib/cors.js";
import { supabase } from "../lib/supabase.js";

const EventBody = z.object({
  sessionId: z.string().optional(),
  customerId: z.string().optional(),
  eventType: z.string().min(1),
  payload: z.record(z.any()).default({})
});

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  try {
    const input = EventBody.parse(req.body);
    const db = supabase();
    await db.from("analytics_events").insert({
      customer_id: input.customerId || null,
      session_id: input.sessionId || null,
      event_type: input.eventType,
      payload: input.payload
    });
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
