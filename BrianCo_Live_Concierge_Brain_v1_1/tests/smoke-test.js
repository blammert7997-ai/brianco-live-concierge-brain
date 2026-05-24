console.log("Brian & Co Live Concierge Brain package smoke test");
const required = [
  "api/chat.js",
  "api/event.js",
  "api/profile.js",
  "api/admin.js",
  "api/health.js",
  "supabase/schema.sql",
  ".env.example",
  "vercel.json"
];
import fs from "fs";
let ok = true;
for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error("Missing", file);
    ok = false;
  }
}
if (!ok) process.exit(1);
console.log("Package files present.");
