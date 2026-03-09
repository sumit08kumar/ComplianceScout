import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { AuditLog } from "@/lib/backend/models/auditLog";

export const dynamic = "force-dynamic";

// GET /api/audit-logs — list audit logs with optional ?action= and ?ruleId= filters
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const filter: Record<string, any> = {};
  if (searchParams.get("action")) filter.action = searchParams.get("action");
  if (searchParams.get("ruleId")) filter.ruleId = searchParams.get("ruleId");
  const logs = await AuditLog.find(filter).sort({ timestamp: -1 }).limit(200).lean();
  return NextResponse.json(logs);
}
