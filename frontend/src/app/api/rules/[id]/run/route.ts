import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { AuditLog } from "@/lib/backend/models/auditLog";
import { runTinyFishAgent } from "@/lib/backend/tinyfishAgent";

// POST /api/rules/[id]/run — trigger a rule run
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const { id } = params;
    await AuditLog.create({ action: "run.started", ruleId: id, details: "Manual run triggered" });
    const runResult = await runTinyFishAgent(id);
    await AuditLog.create({
      action: "run.completed",
      ruleId: id,
      runResultId: runResult._id,
      details: `Run completed – ${runResult.findings?.length ?? 0} findings`,
    });
    return NextResponse.json(runResult);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
