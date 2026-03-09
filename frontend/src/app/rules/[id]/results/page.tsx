"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Finding {
  type: string;
  summary: string;
  url?: string;
  effectiveDate?: string;
}
interface Result {
  _id: string;
  ruleId: string;
  runAt: string;
  findings: Finding[];
  rawSnapshot?: string;
}

export default function RuleResultsPage() {
  const { id } = useParams() as { id: string };
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Result[]>(`/rules/${id}/results`).then(setResults).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-gray-500">Loading results…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Results for Rule</h1>
      <p className="text-sm text-gray-400 mb-6 font-mono">{id}</p>

      {results.length === 0 ? (
        <p className="text-gray-500">No results yet. Trigger a run from the <Link href="/rules" className="text-brand-600 underline">Rules</Link> page.</p>
      ) : (
        <div className="space-y-6">
          {results.map((r) => (
            <div key={r._id} className="bg-white border rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">Run: {new Date(r.runAt).toLocaleString()}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{r.findings.length} finding(s)</span>
              </div>
              {r.findings.length > 0 && (
                <table className="w-full text-sm border rounded overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-1.5 text-left">Type</th>
                      <th className="px-3 py-1.5 text-left">Summary</th>
                      <th className="px-3 py-1.5 text-left">Effective Date</th>
                      <th className="px-3 py-1.5 text-left">URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.findings.map((f, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-1.5">{f.type}</td>
                        <td className="px-3 py-1.5">{f.summary}</td>
                        <td className="px-3 py-1.5">{f.effectiveDate || "—"}</td>
                        <td className="px-3 py-1.5">{f.url ? <a href={f.url} target="_blank" className="text-brand-600 underline text-xs">Link</a> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
