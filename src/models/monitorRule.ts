import mongoose, { Schema, Document } from "mongoose";

export interface IWorkflowStep {
  action: string;
  selector?: string;
  value?: string;
  maxPages?: number;
}

export interface IMonitorRule extends Document {
  name: string;
  targetUrl: string;
  workflow: IWorkflowStep[];
  schedule?: string; // cron expression (optional)
  createdAt: Date;
}

const WorkflowStepSchema = new Schema<IWorkflowStep>({
  action: { type: String, required: true },
  selector: String,
  value: String,
  maxPages: Number,
});

const MonitorRuleSchema = new Schema<IMonitorRule>({
  name: { type: String, required: true },
  targetUrl: { type: String, required: true },
  workflow: { type: [WorkflowStepSchema], required: true },
  schedule: String,
  createdAt: { type: Date, default: Date.now },
});

export const MonitorRule = mongoose.model<IMonitorRule>("MonitorRule", MonitorRuleSchema);
