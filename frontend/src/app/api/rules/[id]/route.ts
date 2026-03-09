import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { MonitorRule } from "@/lib/backend/models/monitorRule";
import { AuditLog } from "@/lib/backend/models/auditLog";

// GET /api/rules/[id] — get single rule
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const rule = await MonitorRule.findById(params.id).lean();
  if (!rule) return NextResponse.json({ error: "Rule not found" }, { status: 404 });
  return NextResponse.json(rule);
}

// DELETE /api/rules/[id] — delete rule
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const rule = await MonitorRule.findByIdAndDelete(params.id);
  if (!rule) return NextResponse.json({ error: "Rule not found" }, { status: 404 });
  await AuditLog.create({ action: "rule.deleted", ruleId: rule._id, details: `Rule "${rule.name}" deleted` });
  return NextResponse.json({ message: "Deleted", id: params.id });
}

// PATCH /api/rules/[id] — update schedule
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const { schedule } = await req.json();
  const rule = await MonitorRule.findByIdAndUpdate(params.id, { schedule }, { new: true });
  if (!rule) return NextResponse.json({ error: "Rule not found" }, { status: 404 });
  await AuditLog.create({
    action: schedule ? "rule.scheduled" : "rule.unscheduled",
    ruleId: rule._id,
    details: schedule ? `Schedule updated to "${schedule}"` : "Schedule removed",
  });
  return NextResponse.json(rule);
}
