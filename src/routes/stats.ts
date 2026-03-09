import { Router, Request, Response } from "express";
import { MonitorRule } from "../models/monitorRule";
import { RunResult } from "../models/runResult";
import { AuditLog } from "../models/auditLog";
import { listScheduled } from "../scheduler";

const router = Router();

// Dashboard statistics
router.get("/", async (_req: Request, res: Response) => {
  try {
    const [totalRules, totalRuns, totalFindings, recentRuns] = await Promise.all([
      MonitorRule.countDocuments(),
      RunResult.countDocuments(),
      RunResult.aggregate([{ $unwind: "$findings" }, { $count: "total" }]),
      RunResult.find().sort({ runAt: -1 }).limit(5).lean(),
    ]);

    const scheduled = listScheduled();

    res.json({
      totalRules,
      totalRuns,
      totalFindings: totalFindings[0]?.total ?? 0,
      scheduledRules: scheduled.length,
      recentRuns: recentRuns.map((r) => ({
        _id: r._id,
        ruleId: r.ruleId,
        runAt: r.runAt,
        findingsCount: r.findings?.length ?? 0,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
