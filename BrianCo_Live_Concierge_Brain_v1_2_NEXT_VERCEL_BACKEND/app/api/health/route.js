import { corsHeaders, optionsResponse } from "../../../lib/cors.js";

export async function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  return Response.json({
    ok: true,
    service: "Brian & Co Live Concierge Brain",
    version: "1.2.0",
    framework: "Next.js App Router",
    routes: ["/api/health", "/api/chat", "/api/event", "/api/profile", "/api/admin"]
  }, { headers: corsHeaders() });
}
