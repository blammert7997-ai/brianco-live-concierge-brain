export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": process.env.BRIANCO_ALLOWED_ORIGIN || "https://www.briannco.com",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}
export function setNodeCors(req,res){
  const h=corsHeaders();
  Object.entries(h).forEach(([k,v])=>res.setHeader(k,v));
  if(req.method==="OPTIONS"){res.status(204).end();return true}
  return false;
}
export function optionsResponse(){return new Response(null,{status:204,headers:corsHeaders()})}
