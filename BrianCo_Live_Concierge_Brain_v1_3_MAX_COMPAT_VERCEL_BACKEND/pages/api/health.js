import { setNodeCors } from "../../lib/cors.js";
export default function handler(req,res){
  if(setNodeCors(req,res)) return;
  res.status(200).json({ok:true,service:"Brian & Co Live Concierge Brain",version:"1.3.0",route:"pages/api/health"});
}
