# Brian & Co Forced Node API v1.6

This package forces Vercel to build the API using the explicit @vercel/node builder.

Repo root must contain:
- api/health.js
- vercel.json
- package.json

Vercel settings:
- Framework Preset: Other
- Install Command: echo skip
- Build Command: leave blank if possible, otherwise echo build
- Output Directory: leave blank if possible, otherwise .
- Root Directory: ./

Test:
- /api/health