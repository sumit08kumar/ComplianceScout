import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { RunResult } from "@/lib/backend/models/runResult";

// GET /api/rules/[id]/results — results for a specific rule
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const results = await RunResult.find({ ruleId: params.id }).sort({ runAt: -1 }).lean();
  return NextResponse.json(results);
}
