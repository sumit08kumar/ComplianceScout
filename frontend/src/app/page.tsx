"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Stats {
  totalRules: number;
  totalRuns: number;
  totalFindings: number;
  scheduledRules: number;
  recentRuns: { _id: string; ruleId: string; runAt: string; findingsCount: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Stats>("/stats").then(setStats).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!stats) return <p className="text-gray-500">Loading dashboard…</p>;

  const hoursPerRun = 2.5; // avg hours a compliance officer spends per manual check
  const hourlyRate = 1500; // ₹/hr for a compliance professional in India
  const estimatedHoursSaved = stats.totalRuns * hoursPerRun;
  const estimatedCostSaved = estimatedHoursSaved * hourlyRate;

  const cards = [
    { label: "Monitor Rules", value: stats.totalRules, color: "bg-blue-500", icon: "📋" },
    { label: "Total Runs", value: stats.totalRuns, color: "bg-green-500", icon: "▶️" },
    { label: "Findings", value: stats.totalFindings, color: "bg-yellow-500", icon: "🔍" },
    { label: "Scheduled", value: stats.scheduledRules, color: "bg-purple-500", icon: "⏰" },
    { label: "Hours Saved", value: `${estimatedHoursSaved.toFixed(0)}h`, color: "bg-teal-500", icon: "⏱️" },
    { label: "Cost Saved", value: `₹${estimatedCostSaved.toLocaleString("en-IN")}`, color: "bg-orange-500", icon: "💰" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Monitoring compliance across 🇮🇳 Indian & 🇺🇸 US regulatory agencies</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`${c.color} text-white rounded-xl p-5 shadow`}>
            <p className="text-sm font-medium opacity-80">{c.icon} {c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Recent runs */}
      <h2 className="text-lg font-semibold mb-3">Recent Runs</h2>
      {stats.recentRuns.length === 0 ? (
        <p className="text-gray-500">No runs yet. <Link href="/rules" className="text-brand-600 underline">Create a rule</Link> and run it.</p>
      ) : (
        <table className="w-full text-sm border rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Run ID</th>
              <th className="px-4 py-2">Rule ID</th>
              <th className="px-4 py-2">Run At</th>
              <th className="px-4 py-2">Findings</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentRuns.map((r) => (
              <tr key={r._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs">
                  <Link href={`/results/${r._id}`} className="text-brand-600 underline">{r._id.slice(-8)}</Link>
                </td>
                <td className="px-4 py-2 font-mono text-xs">{r.ruleId.slice(-8)}</td>
                <td className="px-4 py-2">{new Date(r.runAt).toLocaleString()}</td>
                <td className="px-4 py-2">{r.findingsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
