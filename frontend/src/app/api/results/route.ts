import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { RunResult } from "@/lib/backend/models/runResult";

export const dynamic = "force-dynamic";

// GET /api/results — list results, optional ?ruleId= filter
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const filter: Record<string, any> = {};
  if (searchParams.get("ruleId")) filter.ruleId = searchParams.get("ruleId");
  const results = await RunResult.find(filter).sort({ runAt: -1 }).limit(100).lean();
  return NextResponse.json(results);
}
