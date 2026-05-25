import { setNodeCors } from "../../lib/cors.js";
import { getSupabase } from "../../lib/supabase.js";
export default async function handler(req,res){
  if(setNodeCors(req,res)) return;
  if(req.method!=="POST") return res.status(405).json({ok:false,error:"Method not allowed"});
  try{const body=req.body||{}; if(!body.customerId) return res.status(400).json({ok:false,error:"customerId required"}); const db=getSupabase(); await db.from("customer_profiles").upsert({id:body.customerId,first_name:body.firstName||null,profile_image_url:body.profileImageUrl||null,preferred_language:body.preferredLanguage||null,region:body.region||null,updated_at:new Date().toISOString()}); return res.status(200).json({ok:true});}
  catch(e){return res.status(500).json({ok:false,error:e.message});}
}
