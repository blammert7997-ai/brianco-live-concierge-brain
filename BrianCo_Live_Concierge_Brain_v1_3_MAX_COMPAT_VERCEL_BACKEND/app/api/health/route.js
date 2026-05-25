import { corsHeaders, optionsResponse } from "../../../lib/cors.js";
export async function OPTIONS(){return optionsResponse()}
export async function GET(){return Response.json({ok:true,service:"Brian & Co Live Concierge Brain",version:"1.3.0",route:"app/api/health"}, {headers:corsHeaders()})}
