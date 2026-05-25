import { corsHeaders, optionsResponse } from "../../../lib/cors.js";
import { getSupabase } from "../../../lib/supabase.js";

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.customerId) {
      return Response.json({ ok: false, error: "customerId required" }, { status: 400, headers: corsHeaders() });
    }

    const db = getSupabase();

    await db.from("customer_profiles").upsert({
      id: body.customerId,
      first_name: body.firstName || null,
      profile_image_url: body.profileImageUrl || null,
      preferred_language: body.preferredLanguage || null,
      region: body.region || null,
      updated_at: new Date().toISOString()
    });

    await db.from("customer_preferences").upsert({
      customer_id: body.customerId,
      preferred_language: body.preferredLanguage || null,
      region: body.region || null,
      accessibility: body.accessibility || {},
      shopping_preferences: body.shoppingPreferences || {},
      updated_at: new Date().toISOString()
    });

    return Response.json({ ok: true }, { headers: corsHeaders() });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500, headers: corsHeaders() });
  }
}
