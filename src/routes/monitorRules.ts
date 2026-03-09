 import { Router, Request, Response } from "express";
import { MonitorRule } from "../models/monitorRule";
import { RunResult } from "../models/runResult";
import { AuditLog } from "../models/auditLog";
import { runTinyFishAgent } from "../agents/tinyfishAgent";
import { scheduleRule, unscheduleRule } from "../scheduler";

const router = Router();

// ---------- CRUD for rules ----------

// Create a monitor rule
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, targetUrl, workflow, schedule } = req.body;
    const rule = await MonitorRule.create({ name, targetUrl, workflow, schedule });

    await AuditLog.create({ action: "rule.created", ruleId: rule._id, details: `Rule "${name}" created` });

    // Auto-schedule if cron expression provided
    if (schedule) {
      try {
        scheduleRule(String(rule._id), schedule);
        await AuditLog.create({ action: "rule.scheduled", ruleId: rule._id, details: `Scheduled with cron "${schedule}"` });
      } catch (err) {
        console.warn("Scheduling failed:", (err as Error).message);
      }
    }

    res.status(201).json(rule);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// List all rules
router.get("/", async (_req: Request, res: Response) => {
  try {
    const rules = await MonitorRule.find().sort({ createdAt: -1 }).lean();
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Get single rule
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const rule = await MonitorRule.findById(req.params.id).lean();
    if (!rule) return res.status(404).json({ error: "Rule not found" });
    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Delete a rule
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const rule = await MonitorRule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ error: "Rule not found" });

    unscheduleRule(req.params.id);
    await AuditLog.create({ action: "rule.deleted", ruleId: rule._id, details: `Rule "${rule.name}" deleted` });

    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Update rule schedule
router.patch("/:id/schedule", async (req: Request, res: Response) => {
  try {
    const { schedule } = req.body;
    const rule = await MonitorRule.findByIdAndUpdate(req.params.id, { schedule }, { new: true });
    if (!rule) return res.status(404).json({ error: "Rule not found" });

    if (schedule) {
      scheduleRule(String(rule._id), schedule);
      await AuditLog.create({ action: "rule.scheduled", ruleId: rule._id, details: `Schedule updated to "${schedule}"` });
    } else {
      unscheduleRule(String(rule._id));
      await AuditLog.create({ action: "rule.unscheduled", ruleId: rule._id, details: "Schedule removed" });
    }

    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ---------- Trigger a run ----------

router.post("/:id/run", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await AuditLog.create({ action: "run.started", ruleId: id, details: "Manual run triggered" });

    const runResult = await runTinyFishAgent(id);

    await AuditLog.create({
      action: "run.completed",
      ruleId: id,
      runResultId: runResult._id,
      details: `Run completed – ${runResult.findings?.length ?? 0} findings`,
    });

    res.json(runResult);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ---------- Results for a specific rule ----------

router.get("/:id/results", async (req: Request, res: Response) => {
  try {
    const results = await RunResult.find({ ruleId: req.params.id }).sort({ runAt: -1 }).lean();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
