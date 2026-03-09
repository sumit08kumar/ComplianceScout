Next steps and notes after scaffold

- Install dependencies: `npm install`
- If you want type definitions added automatically, run: `npm i -D @types/node @types/express @types/mongoose`
- To run the dev server: `npm run dev` (requires a running MongoDB instance pointed by MONGODB_URI)
- To test an agent run:
  1. POST a rule to /api/rules with body: { name, targetUrl, workflow: [{ action: 'navigate', selector: '#something' }, ...] }
  2. POST /api/rules/:id/run
  3. Check MongoDB `runresults` collection for stored results

Assumptions made
- TinyFish API contract & credentials not provided, so the agent module contains a placeholder HTTP request and a full-featured mock run when TINYFISH_API_KEY is not set.
- Using MongoDB (Mongoose) as requested instead of PostgreSQL from the original spec.

If you'd like, I can now:
- Run `npm install` and start the dev server here (I will need permission), or
- Implement scheduling (node-cron) and a simple UI next.
