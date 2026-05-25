# Brian & Co Live Concierge Brain v1.1

This is the next-stage backend activation package for the live v5.3 Shopify theme.

## What this activates
- Live AI concierge route
- Persistent Supabase memory
- Conversation storage
- Analytics events
- Customer profile/preference storage
- Admin dashboard summary
- Founder approval table foundation
- Shopify digital product creation checklist
- Theme backend connection snippet

## Deploy
1. Create a Vercel project.
2. Upload this package or connect it to a Git repo.
3. Add environment variables from `.env.example`.
4. Run `supabase/schema.sql` in Supabase.
5. Deploy.
6. Test `/api/health`.
7. In Shopify, set `window.BRIANCO_API_BASE` to your deployed URL.

## Shopify connection
Use `shopify/connect-theme-to-backend.liquid` and replace:
`https://YOUR-VERCEL-DEPLOYMENT.vercel.app`
Brian & Co Live Concierge Brain Backend
## Safety
Do not put real API keys in Shopify theme files.
Use environment variables in Vercel.
Founder approval gates remain required for risky changes.
