import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db";
import monitorRoutes from "./routes/monitorRules";
import resultsRoutes from "./routes/results";
import auditLogRoutes from "./routes/auditLogs";
import statsRoutes from "./routes/stats";
import { initScheduler } from "./scheduler";

dotenv.config();

const PORT = process.env.PORT || 4000;

async function main() {
  await connectDB();

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use("/api/rules", monitorRoutes);
  app.use("/api/results", resultsRoutes);
  app.use("/api/audit-logs", auditLogRoutes);
  app.use("/api/stats", statsRoutes);

  app.get("/", (_req, res) => res.send("ComplianceScout backend running"));

  // Start cron scheduler for rules that have a schedule field
  await initScheduler();

  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
