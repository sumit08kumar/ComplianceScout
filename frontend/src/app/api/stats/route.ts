import { NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { MonitorRule } from "@/lib/backend/models/monitorRule";
import { RunResult } from "@/lib/backend/models/runResult";

// Force dynamic — never prerender
export const dynamic = "force-dynamic";

// GET /api/stats — dashboard statistics
export async function GET() {
  try {
    await connectDB();
    const [totalRules, totalRuns, totalFindings, recentRuns, scheduledRules] = await Promise.all([
      MonitorRule.countDocuments(),
      RunResult.countDocuments(),
      RunResult.aggregate([{ $unwind: "$findings" }, { $count: "total" }]),
      RunResult.find().sort({ runAt: -1 }).limit(5).lean(),
      MonitorRule.countDocuments({ schedule: { $exists: true, $ne: "" } }),
    ]);

    return NextResponse.json({
      totalRules,
      totalRuns,
      totalFindings: totalFindings[0]?.total ?? 0,
      scheduledRules,
      recentRuns: recentRuns.map((r: any) => ({
        _id: r._id,
        ruleId: r.ruleId,
        runAt: r.runAt,
        findingsCount: r.findings?.length ?? 0,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
