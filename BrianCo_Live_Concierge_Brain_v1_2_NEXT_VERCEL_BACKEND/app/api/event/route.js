import { corsHeaders, optionsResponse } from "../../../lib/cors.js";
import { getSupabase } from "../../../lib/supabase.js";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req) {
  try {
    const body = await req.json();
    const db = getSupabase();
    await db.from("analytics_events").insert({
      customer_id: body.customerId || null,
      session_id: body.sessionId || null,
      event_type: body.eventType || "event",
      payload: body.payload || {}
    });
    return Response.json({ ok: true }, { headers: corsHeaders() });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500, headers: corsHeaders() });
  }
}
