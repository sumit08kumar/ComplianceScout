import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/backend/db";
import { RunResult } from "@/lib/backend/models/runResult";

// GET /api/results/[id] — single result
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const result = await RunResult.findById(params.id).lean();
  if (!result) return NextResponse.json({ error: "Result not found" }, { status: 404 });
  return NextResponse.json(result);
}
