
function setCors(req, res) {
  const origin = process.env.BRIANCO_ALLOWED_ORIGIN || "https://www.briannco.com";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

async function supabaseFetch(path, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase error ${response.status}: ${text}`);
  try { return text ? JSON.parse(text) : null; } catch { return text; }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => data += chunk);
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  try {
    const body = await readBody(req);
    if (!body.customerId) return res.status(400).json({ ok: false, error: "customerId required" });

    await supabaseFetch("customer_profiles", {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        id: body.customerId,
        first_name: body.firstName || null,
        profile_image_url: body.profileImageUrl || null,
        preferred_language: body.preferredLanguage || null,
        region: body.region || null,
        updated_at: new Date().toISOString()
      })
    });

    await supabaseFetch("customer_preferences", {
      method: "POST",
      headers: { "Prefer": "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({
        customer_id: body.customerId,
        preferred_language: body.preferredLanguage || null,
        region: body.region || null,
        accessibility: body.accessibility || {},
        shopping_preferences: body.shoppingPreferences || {},
        updated_at: new Date().toISOString()
      })
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
