import { setNodeCors } from "../../lib/cors.js";
import { getSupabase } from "../../lib/supabase.js";
export default async function handler(req,res){
  if(setNodeCors(req,res)) return;
  if(req.method!=="POST") return res.status(405).json({ok:false,error:"Method not allowed"});
  try{const db=getSupabase(); await db.from("analytics_events").insert({customer_id:req.body.customerId||null,session_id:req.body.sessionId||null,event_type:req.body.eventType||"event",payload:req.body.payload||{}}); return res.status(200).json({ok:true});}
  catch(e){return res.status(500).json({ok:false,error:e.message});}
}
