import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { MonitorRule } from "@/lib/backend/models/monitorRule";
import { AuditLog } from "@/lib/backend/models/auditLog";

export const dynamic = "force-dynamic";

// GET /api/rules — list all rules
export async function GET() {
  await connectDB();
  const rules = await MonitorRule.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(rules);
}

// POST /api/rules — create a rule
export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { name, targetUrl, workflow, schedule } = await req.json();
    const rule = await MonitorRule.create({ name, targetUrl, workflow, schedule });
    await AuditLog.create({ action: "rule.created", ruleId: rule._id, details: `Rule "${name}" created` });
    return NextResponse.json(rule, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
