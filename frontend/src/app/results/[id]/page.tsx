"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function ResultDetailPage() {
  const { id } = useParams() as { id: string };
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Result>(`/results/${id}`).then(setResult).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!result) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Run Result</h1>
      <p className="text-sm text-gray-400 mb-1 font-mono">ID: {result._id}</p>
      <p className="text-sm text-gray-400 mb-1 font-mono">Rule: {result.ruleId}</p>
      <p className="text-sm text-gray-500 mb-6">Run at: {new Date(result.runAt).toLocaleString()}</p>

      <h2 className="text-lg font-semibold mb-3">Findings ({result.findings.length})</h2>
      {result.findings.length === 0 ? (
        <p className="text-gray-500">No findings in this run.</p>
      ) : (
        <div className="space-y-3">
          {result.findings.map((f, i) => (
            <div key={i} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">{f.type}</span>
                {f.effectiveDate && <span className="text-xs text-gray-400">Effective: {f.effectiveDate}</span>}
              </div>
              <p className="text-sm">{f.summary}</p>
              {f.url && <a href={f.url} target="_blank" className="text-xs text-brand-600 underline mt-1 inline-block">Source →</a>}
            </div>
          ))}
        </div>
      )}

      {/* Raw snapshot */}
      {result.rawSnapshot && (
        <details className="mt-8">
          <summary className="text-sm font-medium text-gray-600 cursor-pointer">View Raw Snapshot</summary>
          <div className="mt-2 bg-gray-100 rounded-lg p-4 text-xs overflow-auto max-h-80" dangerouslySetInnerHTML={{ __html: result.rawSnapshot }} />
        </details>
      )}
    </div>
  );
}
