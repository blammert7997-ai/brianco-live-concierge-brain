import { setNodeCors } from "../../lib/cors.js";
import { getSupabase } from "../../lib/supabase.js";
import { getOpenAI, OPENAI_MODEL } from "../../lib/openai.js";
import { buildSystemPrompt } from "../../lib/prompt.js";
export default async function handler(req,res){
  if(setNodeCors(req,res)) return;
  if(req.method!=="POST") return res.status(405).json({ok:false,error:"Method not allowed"});
  try{
    const body=req.body||{};
    if(!body.message||!body.sessionId) return res.status(400).json({ok:false,error:"message and sessionId required"});
    const db=getSupabase(); const ai=getOpenAI();
    const {data:turns}=await db.from("conversation_turns").select("user_message,assistant_message").eq("session_id",body.sessionId).order("created_at",{ascending:false}).limit(6);
    const recent=(turns||[]).reverse();
    const messages=[{role:"system",content:buildSystemPrompt({memory:{recent},locale:body.locale,region:body.region,page:body.page})},...recent.flatMap(t=>[{role:"user",content:t.user_message},{role:"assistant",content:t.assistant_message}]),{role:"user",content:body.message}];
    const completion=await ai.chat.completions.create({model:OPENAI_MODEL,messages,temperature:.55});
    const reply=completion.choices?.[0]?.message?.content||"I’m here to help with Brian & Co.";
    await db.from("conversation_turns").insert({customer_id:body.customerId||null,session_id:body.sessionId,user_message:body.message,assistant_message:reply,locale:body.locale||null,region:body.region||null});
    await db.from("analytics_events").insert({customer_id:body.customerId||null,session_id:body.sessionId,event_type:"chat_reply",payload:{replyLength:reply.length,page:body.page||null}});
    return res.status(200).json({ok:true,reply});
  }catch(e){return res.status(500).json({ok:false,error:e.message});}
}
