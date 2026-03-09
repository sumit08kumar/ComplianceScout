import { Router, Request, Response } from "express";
import { RunResult } from "../models/runResult";

const router = Router();

// List all results (newest first), with optional ?ruleId= filter
router.get("/", async (req: Request, res: Response) => {
  try {
    const filter: Record<string, any> = {};
    if (req.query.ruleId) filter.ruleId = req.query.ruleId;
    const results = await RunResult.find(filter).sort({ runAt: -1 }).limit(100).lean();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Get single result
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await RunResult.findById(req.params.id).lean();
    if (!result) return res.status(404).json({ error: "Result not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
