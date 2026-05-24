import { setCors } from "../lib/cors.js";

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  res.status(200).json({
    ok: true,
    service: "Brian & Co Live Concierge Brain",
    version: "1.1.0",
    modules: ["chat", "memory", "analytics", "profile", "admin"]
  });
}
