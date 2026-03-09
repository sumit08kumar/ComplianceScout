import { Router, Request, Response } from "express";
import { AuditLog } from "../models/auditLog";

const router = Router();

// List audit logs (newest first), with optional ?action= and ?ruleId= filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const filter: Record<string, any> = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.ruleId) filter.ruleId = req.query.ruleId;
    const logs = await AuditLog.find(filter).sort({ timestamp: -1 }).limit(200).lean();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
