"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface LogEntry {
  _id: string;
  action: string;
  ruleId?: string;
  runResultId?: string;
  details?: string;
  timestamp: string;
}

const actionColors: Record<string, string> = {
  "rule.created": "bg-blue-100 text-blue-800",
  "rule.deleted": "bg-red-100 text-red-800",
  "rule.scheduled": "bg-purple-100 text-purple-800",
  "rule.unscheduled": "bg-gray-200 text-gray-700",
  "run.started": "bg-yellow-100 text-yellow-800",
  "run.completed": "bg-green-100 text-green-800",
  "run.scheduled": "bg-green-100 text-green-800",
  "run.scheduled.error": "bg-red-100 text-red-800",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<LogEntry[]>("/audit-logs").then(setLogs).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading audit logs…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Trail</h1>

      {logs.length === 0 ? (
        <p className="text-gray-500">No audit logs yet.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((l) => (
            <div key={l._id} className="bg-white border rounded-lg px-4 py-3 flex items-start gap-3 shadow-sm">
              <span className={`text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap ${actionColors[l.action] || "bg-gray-100 text-gray-700"}`}>
                {l.action}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{l.details || "—"}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(l.timestamp).toLocaleString()}
                  {l.ruleId && <span className="ml-2 font-mono">rule:{l.ruleId.slice(-8)}</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
