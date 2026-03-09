import cron, { ScheduledTask } from "node-cron";
import { MonitorRule } from "./models/monitorRule";
import { AuditLog } from "./models/auditLog";
import { runTinyFishAgent } from "./agents/tinyfishAgent";

// Map of ruleId -> ScheduledTask for active cron jobs
const activeTasks = new Map<string, ScheduledTask>();

/**
 * Start a cron schedule for a given rule.
 * If the rule already has an active task it is stopped first.
 */
export function scheduleRule(ruleId: string, cronExpr: string) {
  // Stop existing task if any
  unscheduleRule(ruleId);

  if (!cron.validate(cronExpr)) {
    throw new Error(`Invalid cron expression: ${cronExpr}`);
  }

  const task = cron.schedule(cronExpr, async () => {
    console.log(`[scheduler] Running rule ${ruleId} (cron: ${cronExpr})`);
    try {
      const result = await runTinyFishAgent(ruleId);
      await AuditLog.create({
        action: "run.scheduled",
        ruleId,
        runResultId: result._id,
        details: `Scheduled run completed – ${result.findings?.length ?? 0} findings`,
      });
    } catch (err) {
      console.error(`[scheduler] Error running rule ${ruleId}:`, (err as Error).message);
      await AuditLog.create({
        action: "run.scheduled.error",
        ruleId,
        details: (err as Error).message,
      });
    }
  });

  activeTasks.set(ruleId, task);
  console.log(`[scheduler] Rule ${ruleId} scheduled with cron "${cronExpr}"`);
}

/**
 * Stop the cron task for a rule.
 */
export function unscheduleRule(ruleId: string) {
  const existing = activeTasks.get(ruleId);
  if (existing) {
    existing.stop();
    activeTasks.delete(ruleId);
    console.log(`[scheduler] Rule ${ruleId} unscheduled`);
  }
}

/**
 * On startup, load all rules that have a schedule field and activate their cron jobs.
 */
export async function initScheduler() {
  const rules = await MonitorRule.find({ schedule: { $exists: true, $ne: "" } }).lean();
  let count = 0;
  for (const rule of rules) {
    if (rule.schedule && cron.validate(rule.schedule)) {
      scheduleRule(String(rule._id), rule.schedule);
      count++;
    }
  }
  console.log(`[scheduler] Initialised ${count} scheduled rule(s)`);
}

/**
 * Return a summary of active scheduled tasks.
 */
export function listScheduled(): { ruleId: string }[] {
  return Array.from(activeTasks.keys()).map((ruleId) => ({ ruleId }));
}
