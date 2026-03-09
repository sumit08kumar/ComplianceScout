"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Rule {
  _id: string;
  name: string;
  targetUrl: string;
  schedule?: string;
  createdAt: string;
  workflow: any[];
}

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);

  const load = () => apiFetch<Rule[]>("/rules").then(setRules).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  async function triggerRun(id: string) {
    setRunning(id);
    try {
      await apiFetch(`/rules/${id}/run`, { method: "POST" });
      alert("Run completed! Check Results page.");
    } catch (e: any) {
      alert("Run error: " + e.message);
    }
    setRunning(null);
  }

  async function deleteRule(id: string) {
    if (!confirm("Delete this rule?")) return;
    await apiFetch(`/rules/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-gray-500">Loading rules…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Monitor Rules</h1>
        <Link href="/rules/new" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition">
          + New Rule
        </Link>
      </div>

      {rules.length === 0 ? (
        <p className="text-gray-500">No rules yet.</p>
      ) : (
        <div className="space-y-4">
          {rules.map((r) => (
            <div key={r._id} className="bg-white border rounded-xl p-5 shadow-sm flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{r.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{r.targetUrl}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  <span>Steps: {r.workflow.length}</span>
                  {r.schedule && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">cron: {r.schedule}</span>}
                  <span>Created: {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => triggerRun(r._id)}
                  disabled={running === r._id}
                  className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {running === r._id ? "Running…" : "▶ Run"}
                </button>
                <Link href={`/rules/${r._id}/results`} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-300">
                  Results
                </Link>
                <button onClick={() => deleteRule(r._id)} className="bg-red-100 text-red-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-red-200">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
