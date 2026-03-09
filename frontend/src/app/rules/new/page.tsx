"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const presetWorkflows: Record<string, { targetUrl: string; workflow: any[]; region: "🇺🇸 US" | "🇮🇳 India" }> = {
  // ── US Agencies ──
  "FDA Food Labeling": {
    region: "🇺🇸 US",
    targetUrl: "https://www.fda.gov/food/food-labeling-nutrition",
    workflow: [
      { action: "navigate", selector: "#regulatory-updates" },
      { action: "click", selector: "button[aria-label='Advanced Search']" },
      { action: "fill", selector: "input[name='from_date']", value: "2026-01-01" },
      { action: "click", selector: "button[type='submit']" },
      { action: "extractTable", selector: ".results-table" },
      { action: "handlePagination", maxPages: 5 },
    ],
  },
  "SEC EDGAR": {
    region: "🇺🇸 US",
    targetUrl: "https://www.sec.gov/cgi-bin/browse-edgar",
    workflow: [
      { action: "navigate", selector: "#search" },
      { action: "fill", selector: "#company", value: "rule-10b5-1" },
      { action: "click", selector: "#submit" },
      { action: "handlePagination", maxPages: 3 },
    ],
  },
  "EPA Regulations": {
    region: "🇺🇸 US",
    targetUrl: "https://www.epa.gov/laws-regulations",
    workflow: [
      { action: "navigate", selector: "#recent-actions" },
      { action: "extractTable", selector: ".reg-table" },
      { action: "handlePagination", maxPages: 5 },
    ],
  },

  // ── Indian Agencies ──
  "RBI Circulars": {
    region: "🇮🇳 India",
    targetUrl: "https://www.rbi.org.in/Scripts/BS_CircularIndexDisplay.aspx",
    workflow: [
      { action: "navigate", selector: "#divCircular" },
      { action: "fill", selector: "#txtFromDate", value: "01/01/2026" },
      { action: "fill", selector: "#txtToDate", value: "09/03/2026" },
      { action: "click", selector: "#btnSearch" },
      { action: "extractTable", selector: "#grdCircular" },
      { action: "handlePagination", maxPages: 5 },
    ],
  },
  "SEBI Regulations": {
    region: "🇮🇳 India",
    targetUrl: "https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=1&ssid=1",
    workflow: [
      { action: "navigate", selector: "#contentArea" },
      { action: "click", selector: "a[title='Circulars']" },
      { action: "fill", selector: "#fromDate", value: "01-Jan-2026" },
      { action: "fill", selector: "#toDate", value: "09-Mar-2026" },
      { action: "click", selector: "#btnSubmit" },
      { action: "extractTable", selector: ".table-responsive" },
      { action: "handlePagination", maxPages: 5 },
    ],
  },
  "FSSAI Food Safety": {
    region: "🇮🇳 India",
    targetUrl: "https://www.fssai.gov.in/cms/regulations.php",
    workflow: [
      { action: "navigate", selector: "#regulations-section" },
      { action: "click", selector: "a.latest-orders" },
      { action: "extractTable", selector: ".table-bordered" },
      { action: "handlePagination", maxPages: 3 },
      { action: "downloadPDFs", selector: "a[href$='.pdf']" },
    ],
  },
  "MCA Company Law": {
    region: "🇮🇳 India",
    targetUrl: "https://www.mca.gov.in/content/mca/global/en/acts-rules/ebooks/acts.html",
    workflow: [
      { action: "navigate", selector: "#latestUpdates" },
      { action: "click", selector: "a[title='Notifications']" },
      { action: "extractTable", selector: ".views-table" },
      { action: "handlePagination", maxPages: 5 },
      { action: "downloadPDFs", selector: "a[href$='.pdf']" },
    ],
  },
  "GST Council Updates": {
    region: "🇮🇳 India",
    targetUrl: "https://gstcouncil.gov.in/gst-council-meetings",
    workflow: [
      { action: "navigate", selector: "#block-system-main" },
      { action: "extractTable", selector: ".views-table" },
      { action: "click", selector: "a[title='Press Release']" },
      { action: "extractTable", selector: ".field-content" },
      { action: "downloadPDFs", selector: "a[href$='.pdf']" },
    ],
  },
  "CPCB Pollution Norms": {
    region: "🇮🇳 India",
    targetUrl: "https://cpcb.nic.in/latest-notifications/",
    workflow: [
      { action: "navigate", selector: "#content-area" },
      { action: "extractTable", selector: ".table" },
      { action: "handlePagination", maxPages: 3 },
      { action: "downloadPDFs", selector: "a[href$='.pdf']" },
    ],
  },
};

export default function NewRulePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [workflowJson, setWorkflowJson] = useState("[]");
  const [schedule, setSchedule] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function applyPreset(key: string) {
    const p = presetWorkflows[key];
    if (!p) return;
    setName(key + " Monitor");
    setTargetUrl(p.targetUrl);
    setWorkflowJson(JSON.stringify(p.workflow, null, 2));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const workflow = JSON.parse(workflowJson);
      await apiFetch("/rules", {
        method: "POST",
        body: JSON.stringify({ name, targetUrl, workflow, schedule: schedule || undefined }),
      });
      router.push("/rules");
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create Monitor Rule</h1>

      {/* Presets */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-600 mb-3">Quick presets:</p>
        {(["🇺🇸 US", "🇮🇳 India"] as const).map((region) => (
          <div key={region} className="mb-3">
            <p className="text-xs font-semibold text-gray-500 mb-1.5">{region}</p>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(presetWorkflows)
                .filter(([, v]) => v.region === region)
                .map(([k]) => (
                  <button
                    key={k}
                    onClick={() => applyPreset(k)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                      region === "🇮🇳 India"
                        ? "bg-orange-100 hover:bg-orange-200 text-orange-800"
                        : "bg-blue-100 hover:bg-blue-200 text-blue-800"
                    }`}
                  >
                    {k}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Rule Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. FDA Food Labeling Monitor" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Target URL</label>
          <input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://www.fda.gov/…" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Workflow (JSON)</label>
          <textarea value={workflowJson} onChange={(e) => setWorkflowJson(e.target.value)} rows={10} className="w-full border rounded-lg px-3 py-2 text-sm font-mono" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Schedule (cron, optional)</label>
          <input value={schedule} onChange={(e) => setSchedule(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. 0 9 * * 1-5  (weekdays 9 AM)" />
          <p className="text-xs text-gray-400 mt-1">Leave empty for manual-only runs.</p>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="bg-brand-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50">
          {saving ? "Saving…" : "Create Rule"}
        </button>
      </form>
    </div>
  );
}
