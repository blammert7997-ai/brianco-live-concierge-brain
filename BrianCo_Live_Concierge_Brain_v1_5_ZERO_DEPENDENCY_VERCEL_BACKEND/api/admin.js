
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
  try {
    const events = await supabaseFetch("analytics_events?select=id", { method: "GET", headers: { "Prefer": "" } });
    const turns = await supabaseFetch("conversation_turns?select=id", { method: "GET", headers: { "Prefer": "" } });
    const profiles = await supabaseFetch("customer_profiles?select=id", { method: "GET", headers: { "Prefer": "" } });
    res.status(200).json({
      ok: true,
      dashboard: {
        analyticsEvents: Array.isArray(events) ? events.length : 0,
        conversationTurns: Array.isArray(turns) ? turns.length : 0,
        customerProfiles: Array.isArray(profiles) ? profiles.length : 0,
        nextBestActions: [
          "Connect Shopify theme BRIANCO_API_BASE",
          "Create digital membership products",
          "Enable customer accounts",
          "Enable Shopify Markets",
          "Enable financing providers"
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
