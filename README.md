# ComplianceScout (prototype)

Minimal backend scaffold for the ComplianceScout TinyFish agent demo.

What this provides
- Express + TypeScript backend
- MongoDB (Mongoose) models for monitoring rules and run results
- TinyFish agent wrapper with a realistic mock implementation and placeholder for real API calls
- REST endpoints to create/list rules and trigger an agent run

Getting started
1. Copy `.env.example` to `.env` and set `MONGODB_URI` (e.g. `mongodb://localhost:27017/compliancescout`).
2. Install dependencies:

```bash
npm install
```

3. Start dev server:

```bash
npm run dev
```

API endpoints
- POST /api/rules  -> create a monitor rule
- GET  /api/rules  -> list rules
- POST /api/rules/:id/run -> trigger a run for a rule (saves results into MongoDB)

Notes
- Real TinyFish API integration is not implemented because credentials and API contract were not provided; the agent module includes a placeholder where you can plug in real TinyFish calls. When `TINYFISH_API_KEY` is unset, the agent will run a mock workflow and return sample results so you can test the pipeline.

Next steps
- Add scheduling (cron/Bull) for periodic rule execution
- Add file storage (S3) for downloaded PDFs and snapshots
- Build the Next.js dashboard to configure and view results

If you want, I can now:
- Run `npm install` and start the dev server here (I will need permission to run commands), or
- Implement scheduling or a simple frontend next.
