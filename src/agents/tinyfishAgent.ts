import { MonitorRule } from "../models/monitorRule";
import { RunResult } from "../models/runResult";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run a TinyFish workflow from a MonitorRule.
 * If TINYFISH_API_KEY is set AND the API base URL is reachable, it calls the TinyFish API.
 * Otherwise it gracefully falls back to a mock workflow that simulates navigation, pagination,
 * and PDF downloads, returning sample structured findings.
 */
export async function runTinyFishAgent(ruleId: string) {
  const rule = await MonitorRule.findById(ruleId).lean();
  if (!rule) throw new Error("MonitorRule not found");

  const apiKey = process.env.TINYFISH_API_KEY;
  const base = process.env.TINYFISH_API_BASE || "https://api.tinyfish.example";

  // ---------- Real TinyFish API path (with graceful fallback) ----------
  if (apiKey) {
    try {
      const resp = await fetch(`${base}/run-workflow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ target: rule.targetUrl, workflow: rule.workflow }),
        signal: AbortSignal.timeout(10_000), // 10-second timeout
      });

      if (!resp.ok) {
        console.warn(`TinyFish API returned ${resp.status} – falling back to mock agent`);
      } else {
        const data = (await resp.json()) as Record<string, any>;
        const result = await RunResult.create({
          ruleId: rule._id,
          findings: data.findings || [],
          rawSnapshot: data.snapshot,
        });
        return result;
      }
    } catch (err) {
      console.warn(`TinyFish API unreachable (${(err as Error).message}) – falling back to mock agent`);
    }
  }

  // ---------- Mock agent ----------
  const logs: string[] = [];
  logs.push(`Starting mock agent for ${rule.targetUrl}`);
  for (const step of rule.workflow as any[]) {
    logs.push(`Action: ${step.action} selector=${step.selector || "-"} value=${step.value || "-"}`);
    await sleep(300);
  }

  // Simulate pagination if maxPages present
  const maxPages = rule.workflow?.find((s: any) => s.maxPages)?.maxPages || 1;
  const findings: any[] = [];

  // ---------- Indian agency–aware mock findings ----------
  const url = rule.targetUrl.toLowerCase();
  const indianFindings = getIndianMockFindings(url);
  const usFindings = getUSMockFindings(url);
  const contextFindings = indianFindings.length > 0 ? indianFindings : usFindings.length > 0 ? usFindings : null;

  for (let p = 1; p <= Math.min(maxPages, 5); p++) {
    logs.push(`Processing page ${p}`);
    await sleep(200);
    if (contextFindings && p <= contextFindings.length) {
      findings.push({ ...contextFindings[p - 1], url: `${rule.targetUrl}?page=${p}` });
    } else if (p % 2 === 0) {
      findings.push({ type: "regulation", summary: `Regulation update found on page ${p}`, url: `${rule.targetUrl}?page=${p}`, effectiveDate: null });
    }
  }

  logs.push(`Downloaded ${Math.min(findings.length, 3)} PDFs (mock)`);

  const snapshot = `<html><body><h1>Snapshot for ${rule.targetUrl}</h1><p>${logs.join("<br>")}</p></body></html>`;
  const result = await RunResult.create({ ruleId: rule._id, findings, rawSnapshot: snapshot });
  return result;
}

// ----- Realistic mock findings per Indian agency -----
function getIndianMockFindings(url: string): any[] {
  if (url.includes("rbi.org.in")) {
    return [
      { type: "RBI Circular", summary: "RBI/2026-27/01 – Revised guidelines on digital lending by NBFCs. All NBFCs must implement KYC re-verification by June 2026.", effectiveDate: "2026-06-01" },
      { type: "RBI Circular", summary: "RBI/2026-27/03 – UPI transaction limit increased to ₹5,00,000 for merchant payments effective April 2026.", effectiveDate: "2026-04-01" },
      { type: "RBI Notification", summary: "Master Direction on KYC updated – Aadhaar e-KYC now mandatory for accounts > ₹50,000.", effectiveDate: "2026-05-15" },
    ];
  }
  if (url.includes("sebi.gov.in")) {
    return [
      { type: "SEBI Circular", summary: "SEBI/HO/MRD/2026/001 – T+0 settlement to be mandatory for top 500 stocks from July 2026.", effectiveDate: "2026-07-01" },
      { type: "SEBI Regulation", summary: "Amendment to LODR Regulations – ESG disclosure now mandatory for top 1000 listed companies.", effectiveDate: "2026-04-01" },
      { type: "SEBI Circular", summary: "New framework for Algo Trading by retail investors. Registration required by brokers before September 2026.", effectiveDate: "2026-09-01" },
    ];
  }
  if (url.includes("fssai.gov.in")) {
    return [
      { type: "FSSAI Order", summary: "F.No. 1-12/Standards/SP – Revised limits for trans-fat in edible oils. Maximum 2% w/w effective immediately.", effectiveDate: "2026-03-01" },
      { type: "FSSAI Notification", summary: "Mandatory front-of-pack nutrition labelling (star rating system) for all packaged foods.", effectiveDate: "2026-10-01" },
      { type: "FSSAI Directive", summary: "All FBOs with turnover > ₹25 lakh must have FSSAI-trained Food Safety Supervisor by July 2026.", effectiveDate: "2026-07-01" },
    ];
  }
  if (url.includes("mca.gov.in")) {
    return [
      { type: "MCA Notification", summary: "Companies (CSR Policy) Amendment Rules 2026 – CSR spending threshold increased to 3% of net profit for companies > ₹1000 Cr turnover.", effectiveDate: "2026-04-01" },
      { type: "MCA Circular", summary: "Mandatory filing of XBRL returns for all companies with paid-up capital > ₹5 Cr from FY 2026-27.", effectiveDate: "2026-04-01" },
    ];
  }
  if (url.includes("gstcouncil.gov.in")) {
    return [
      { type: "GST Notification", summary: "53rd GST Council Meeting – GST on health insurance premiums reduced from 18% to 5% for policies under ₹5 lakh.", effectiveDate: "2026-04-01" },
      { type: "GST Circular", summary: "New e-invoicing threshold – Mandatory for businesses with turnover > ₹5 Cr (down from ₹10 Cr).", effectiveDate: "2026-04-01" },
      { type: "GST Rate Change", summary: "Online gaming taxation clarified – 28% GST on full face value upheld. Compliance deadline extended to June 2026.", effectiveDate: "2026-06-30" },
    ];
  }
  if (url.includes("cpcb.nic.in")) {
    return [
      { type: "CPCB Notification", summary: "Revised National Ambient Air Quality Standards – PM2.5 annual limit reduced to 30 µg/m³ from 40 µg/m³.", effectiveDate: "2026-10-01" },
      { type: "CPCB Direction", summary: "All industries in NCR must install CEMS (Continuous Emission Monitoring) by August 2026. Non-compliance = closure.", effectiveDate: "2026-08-01" },
    ];
  }
  return [];
}

// ----- Realistic mock findings per US agency -----
function getUSMockFindings(url: string): any[] {
  if (url.includes("fda.gov")) {
    return [
      { type: "FDA Rule", summary: "Final Rule: Nutrition Facts label must include 'Added Sugars' declaration for all packaged foods. Compliance deadline July 2026.", effectiveDate: "2026-07-01" },
      { type: "FDA Guidance", summary: "Draft Guidance on front-of-package labeling – 'Healthy' symbol criteria updated.", effectiveDate: "2026-06-15" },
    ];
  }
  if (url.includes("sec.gov")) {
    return [
      { type: "SEC Amendment", summary: "Rule 10b5-1 trading plan amendments – Enhanced cooling-off period (120 days) and disclosure requirements.", effectiveDate: "2026-04-15" },
      { type: "SEC Rule", summary: "Climate Disclosure Rule – All registrants must file Scope 1 & 2 emissions starting FY 2026.", effectiveDate: "2026-01-01" },
    ];
  }
  if (url.includes("epa.gov")) {
    return [
      { type: "EPA Rule", summary: "Revised PFAS drinking water standards – Maximum contaminant levels for PFOA/PFOS set at 4 ppt.", effectiveDate: "2026-06-01" },
    ];
  }
  return [];
}
