import { setCors } from "../lib/cors.js";
import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  try {
    const db = supabase();
    const [events, turns, profiles, approvals] = await Promise.all([
      db.from("analytics_events").select("*", { count: "exact", head: true }),
      db.from("conversation_turns").select("*", { count: "exact", head: true }),
      db.from("customer_profiles").select("*", { count: "exact", head: true }),
      db.from("founder_approvals").select("*", { count: "exact", head: true }).eq("status", "pending")
    ]);
    res.status(200).json({
      ok: true,
      dashboard: {
        analyticsEvents: events.count || 0,
        conversationTurns: turns.count || 0,
        customerProfiles: profiles.count || 0,
        pendingApprovals: approvals.count || 0,
        nextBestActions: [
          "Create Shopify digital membership products",
          "Enable Shopify customer accounts",
          "Connect BRIANCO_API_BASE in the live theme",
          "Enable Shopify Markets",
          "Add financing provider accounts",
          "Review analytics events after traffic"
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
