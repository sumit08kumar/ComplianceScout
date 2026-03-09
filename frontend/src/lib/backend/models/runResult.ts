import mongoose, { Schema, Document } from "mongoose";

export interface IRunFinding {
  type: string;
  summary: string;
  url?: string;
  effectiveDate?: string;
}

export interface IRunResult extends Document {
  ruleId: mongoose.Types.ObjectId;
  runAt: Date;
  findings: IRunFinding[];
  rawSnapshot?: string;
}

const RunFindingSchema = new Schema<IRunFinding>({
  type: String,
  summary: String,
  url: String,
  effectiveDate: String,
});

const RunResultSchema = new Schema<IRunResult>({
  ruleId: { type: Schema.Types.ObjectId, required: true, ref: "MonitorRule" },
  runAt: { type: Date, default: Date.now },
  findings: { type: [RunFindingSchema], default: [] },
  rawSnapshot: String,
});

export const RunResult =
  mongoose.models.RunResult || mongoose.model<IRunResult>("RunResult", RunResultSchema);
