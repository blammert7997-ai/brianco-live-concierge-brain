import { corsHeaders, optionsResponse } from "../../../lib/cors.js";
import { getSupabase } from "../../../lib/supabase.js";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const db = getSupabase();
    const [events, turns, profiles, approvals] = await Promise.all([
      db.from("analytics_events").select("*", { count: "exact", head: true }),
      db.from("conversation_turns").select("*", { count: "exact", head: true }),
      db.from("customer_profiles").select("*", { count: "exact", head: true }),
      db.from("founder_approvals").select("*", { count: "exact", head: true }).eq("status", "pending")
    ]);

    return Response.json({
      ok: true,
      dashboard: {
        analyticsEvents: events.count || 0,
        conversationTurns: turns.count || 0,
        customerProfiles: profiles.count || 0,
        pendingApprovals: approvals.count || 0,
        nextBestActions: [
          "Connect Shopify theme BRIANCO_API_BASE",
          "Create digital membership products",
          "Enable customer accounts",
          "Enable Shopify Markets",
          "Enable financing providers"
        ]
      }
    }, { headers: corsHeaders() });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500, headers: corsHeaders() });
  }
}
