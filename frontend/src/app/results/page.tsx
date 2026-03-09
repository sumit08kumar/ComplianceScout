"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Result {
  _id: string;
  ruleId: string;
  runAt: string;
  findings: any[];
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Result[]>("/results").then(setResults).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading results…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Run Results</h1>

      {results.length === 0 ? (
        <p className="text-gray-500">No results yet.</p>
      ) : (
        <table className="w-full text-sm border rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Run ID</th>
              <th className="px-4 py-2">Rule ID</th>
              <th className="px-4 py-2">Run At</th>
              <th className="px-4 py-2">Findings</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs">{r._id.slice(-8)}</td>
                <td className="px-4 py-2 font-mono text-xs">
                  <Link href={`/rules/${r.ruleId}/results`} className="text-brand-600 underline">{r.ruleId.slice(-8)}</Link>
                </td>
                <td className="px-4 py-2">{new Date(r.runAt).toLocaleString()}</td>
                <td className="px-4 py-2">{r.findings.length}</td>
                <td className="px-4 py-2">
                  <Link href={`/results/${r._id}`} className="text-brand-600 underline text-xs">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
