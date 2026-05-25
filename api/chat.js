
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

async function openAiChat(messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {"Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json"},
    body: JSON.stringify({ model, messages, temperature: 0.55 })
  });
  const json = await response.json();
  if (!response.ok) throw new Error(`OpenAI error ${response.status}: ${JSON.stringify(json)}`);
  return json.choices?.[0]?.message?.content || "I’m here to help with Brian & Co.";
}

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  try {
    const body = await readBody(req);
    if (!body.message || !body.sessionId) {
      return res.status(400).json({ ok: false, error: "message and sessionId required" });
    }

    let recent = [];
    try {
      recent = await supabaseFetch(`conversation_turns?session_id=eq.${encodeURIComponent(body.sessionId)}&select=user_message,assistant_message&order=created_at.desc&limit=6`, {
        method: "GET",
        headers: { "Prefer": "" }
      });
      recent = (recent || []).reverse();
    } catch (e) { recent = []; }

    const system = `You are Brian & Co Concierge AI.
Use Brian & Co's refined, modern luxury tone.
Be accessible, localized, concise, helpful, and transparent that you are AI.
Never claim sentience.
Recommend memberships, digital access, accessibility support, account/profile setup, or curated shopping when relevant.
Respect Brian's founder approval gates.
Do not finalize legal, tax, medical, financial, or policy claims.
Locale: ${body.locale || "unknown"}
Region: ${body.region || "unknown"}
Page: ${body.page || "unknown"}`;

    const messages = [
      { role: "system", content: system },
      ...recent.flatMap(t => [{role:"user", content:t.user_message}, {role:"assistant", content:t.assistant_message}]),
      { role: "user", content: body.message }
    ];

    const reply = await openAiChat(messages);

    await supabaseFetch("conversation_turns", {
      method: "POST",
      body: JSON.stringify({
        customer_id: body.customerId || null,
        session_id: body.sessionId,
        user_message: body.message,
        assistant_message: reply,
        locale: body.locale || null,
        region: body.region || null
      })
    });

    await supabaseFetch("analytics_events", {
      method: "POST",
      body: JSON.stringify({
        customer_id: body.customerId || null,
        session_id: body.sessionId,
        event_type: "chat_reply",
        payload: { replyLength: reply.length, page: body.page || null }
      })
    });

    res.status(200).json({ ok: true, reply });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}
