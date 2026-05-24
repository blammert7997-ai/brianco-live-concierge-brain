import { z } from "zod";
import { setCors } from "../lib/cors.js";
import { supabase } from "../lib/supabase.js";

const ProfileBody = z.object({
  customerId: z.string().min(1),
  firstName: z.string().optional(),
  profileImageUrl: z.string().optional(),
  preferredLanguage: z.string().optional(),
  region: z.string().optional(),
  accessibility: z.record(z.any()).optional(),
  shoppingPreferences: z.record(z.any()).optional()
});

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const input = ProfileBody.parse(req.body);
    const db = supabase();

    await db.from("customer_profiles").upsert({
      id: input.customerId,
      first_name: input.firstName || null,
      profile_image_url: input.profileImageUrl || null,
      preferred_language: input.preferredLanguage || null,
      region: input.region || null,
      updated_at: new Date().toISOString()
    });

    await db.from("customer_preferences").upsert({
      customer_id: input.customerId,
      preferred_language: input.preferredLanguage || null,
      region: input.region || null,
      accessibility: input.accessibility || {},
      shopping_preferences: input.shoppingPreferences || {},
      updated_at: new Date().toISOString()
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
