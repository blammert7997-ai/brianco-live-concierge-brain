import { setNodeCors } from "../../lib/cors.js";
import { getSupabase } from "../../lib/supabase.js";
export default async function handler(req,res){
  if(setNodeCors(req,res)) return;
  try{const db=getSupabase(); const [events,turns,profiles]=await Promise.all([db.from("analytics_events").select("*",{count:"exact",head:true}),db.from("conversation_turns").select("*",{count:"exact",head:true}),db.from("customer_profiles").select("*",{count:"exact",head:true})]); return res.status(200).json({ok:true,dashboard:{analyticsEvents:events.count||0,conversationTurns:turns.count||0,customerProfiles:profiles.count||0}});}
  catch(e){return res.status(500).json({ok:false,error:e.message});}
}
