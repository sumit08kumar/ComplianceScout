import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  action: string;              // e.g. "rule.created", "rule.deleted", "run.started", "run.completed"
  ruleId?: mongoose.Types.ObjectId;
  runResultId?: mongoose.Types.ObjectId;
  details?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true, index: true },
  ruleId: { type: Schema.Types.ObjectId, ref: "MonitorRule" },
  runResultId: { type: Schema.Types.ObjectId, ref: "RunResult" },
  details: String,
  timestamp: { type: Date, default: Date.now, index: true },
});

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
