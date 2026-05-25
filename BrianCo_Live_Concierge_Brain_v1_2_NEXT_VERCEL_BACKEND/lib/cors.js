export function corsHeaders() {
  const origin = process.env.BRIANCO_ALLOWED_ORIGIN || "https://www.briannco.com";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

export function optionsResponse() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
