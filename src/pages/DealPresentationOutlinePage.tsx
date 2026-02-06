// @ts-nocheck
import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import ExcelJS from "exceljs";
import {
  Download,
  ListChecks,
  FileSpreadsheet,
  Target,
  FileText,
} from "lucide-react";
import { PageLayout } from "../components/ui/PageLayout";

interface DealDetails {
  dealId: string;
  property: string;
  city: string;
  state: string;
  assetType: string;
  strategy: string;
  purchasePrice: number;
  totalBasis: number;
  arv: number;
  targetReturn: number; // percent
}

interface ScoreInputs {
  basis: number;
  valueAdd: number;
  market: number;
  exit: number;
  risk: number;
  alignment: number;
}

const outlineSections = [
  {
    title: "Executive Summary (1 Page Max)",
    purpose:
      "Let the investor know in under 60 seconds whether to keep reading.",
    bullets: [
      "Property address (or general location if off-market)",
      "Asset type (SFR / Duplex / Triplex / Quad / Small MF)",
      "Strategy (Wholesale / Wholetail / Value-Add Hold)",
      "Purchase price (or assignment price)",
      "Estimated ARV / Stabilized value",
      "Target returns (high-level)",
      "Key value-add drivers (2–3 bullets)",
      "Target closing timeline",
    ],
    note: "This section should be scannable.",
  },
  {
    title: "Investment Thesis",
    purpose: "Explain why this deal exists.",
    bullets: [
      "Why this asset is mispriced or underperforming",
      "What the market inefficiency is (operations, management, capital constraints, seller motivation)",
      "Why the strategy fits current market conditions",
      "Why this deal makes sense now",
    ],
    note: "Investors invest in logic before numbers.",
  },
  {
    title: "Property Overview",
    purpose: "Give a clean snapshot of the asset.",
    bullets: [
      "Property type and unit mix",
      "Year built / major renovations",
      "Current condition summary",
      "Current occupancy (if applicable)",
      "Current rents vs market rents",
      "Utilities and expenses responsibility",
      "Photos (current condition)",
      "Site layout or floor plans (if available)",
    ],
  },
  {
    title: "Market Overview",
    purpose: "Prove the deal isn’t dependent on hype.",
    bullets: [
      "Metro and submarket description",
      "Demand drivers (employment, population, rental demand)",
      "Comparable rental rates",
      "Comparable sales (for exit validation)",
      "Liquidity of asset class in this market",
    ],
    note: "Keep it factual, not promotional.",
  },
  {
    title: "Value-Add Plan (The Playbook)",
    purpose: "Show control and clarity.",
    bullets: [
      "What exactly will be improved?",
      "Estimated renovation scope and cost",
      "Rent increases or value creation assumptions",
      "Timeline to stabilization",
      "Operational improvements (management, expenses, utility billing, etc.)",
    ],
    note: "Avoid vague language. Precision builds trust.",
  },
  {
    title: "Financial Overview (High-Level)",
    purpose: "Show the economics without overwhelming.",
    bullets: [
      "Purchase price / assignment price",
      "Rehab budget",
      "Total basis",
      "ARV or stabilized value",
      "Exit cap or comp-based valuation",
      "Projected rents / expenses / NOI (for holds)",
      "Estimated resale price & gross margin (for wholesale / wholetail)",
      "Assumptions clearly stated",
    ],
  },
  {
    title: "Exit Strategy",
    purpose: "Show optionality.",
    bullets: [
      "Primary exit (sale / refi / assignment)",
      "Secondary exit (backup plan)",
      "Expected hold period (if applicable)",
      "Liquidity considerations",
    ],
    note: "Investors care more about exits than upside.",
  },
  {
    title: "Risk Factors & Mitigants",
    purpose: "List risks before they ask.",
    bullets: [
      "Market risk",
      "Renovation risk",
      "Lease-up risk",
      "Interest rate risk",
      "Liquidity risk",
      "Your mitigation plan for each",
    ],
    note: "If there are no risks listed, investors stop trusting.",
  },
  {
    title: "Investor Fit",
    purpose: "Signal discipline.",
    bullets: [
      "Who this deal is best suited for",
      "Who it is not a fit for",
      "Capital and timeline expectations",
    ],
  },
  {
    title: "Next Steps / Call to Action",
    purpose: "Offer a calm, clear path.",
    bullets: [
      "Review materials",
      "Schedule follow-up questions",
      "Submit LOI / proof of funds (if applicable)",
      "Timeline for decision",
    ],
    note: "No pressure. Just clarity.",
  },
  {
    title: "Optional Appendix",
    purpose: "Attach detail only when needed.",
    bullets: [
      "Detailed underwriting",
      "Rent comps / sales comps",
      "Contractor estimates",
      "Floor plans",
    ],
  },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percent = (value: number) => `${value.toFixed(1)}%`;

const DealPresentationOutlinePage: React.FC = () => {
  const [deal, setDeal] = useState<DealDetails>({
    dealId: "DEAL-1001",
    property: "123 Main St",
    city: "Austin",
    state: "TX",
    assetType: "SFR",
    strategy: "Value-Add Hold",
    purchasePrice: 275000,
    totalBasis: 335000,
    arv: 450000,
    targetReturn: 18.0,
  });

  const [scores, setScores] = useState<ScoreInputs>({
    basis: 4.2,
    valueAdd: 4.0,
    market: 3.8,
    exit: 4.1,
    risk: 3.5,
    alignment: 4.6,
  });

  const weightedScore = useMemo(() => {
    const score =
      scores.basis * 0.25 +
      scores.valueAdd * 0.2 +
      scores.market * 0.15 +
      scores.exit * 0.15 +
      scores.risk * 0.15 +
      scores.alignment * 0.1;
    return Number(score.toFixed(2));
  }, [scores]);

  const scoreBand = useMemo(() => {
    if (weightedScore >= 4.0)
      return { label: "Green", className: "bg-green-50 text-green-800" };
    if (weightedScore >= 3.0)
      return { label: "Yellow", className: "bg-yellow-50 text-yellow-800" };
    return { label: "Red", className: "bg-red-50 text-red-800" };
  }, [weightedScore]);

  const handleDealChange = (
    field: keyof DealDetails,
    value: string | number,
  ) => {
    setDeal((prev) => ({ ...prev, [field]: value }));
  };

  const handleScoreChange = (field: keyof ScoreInputs, value: number) => {
    const sanitized = Number.isNaN(value) ? 0 : Math.min(Math.max(value, 1), 5);
    setScores((prev) => ({ ...prev, [field]: sanitized }));
  };

  const buildWorkbook = async () => {
    const workbook = new ExcelJS.Workbook();

    const executiveSummary = workbook.addWorksheet("Executive Summary");
    executiveSummary.columns = [
      { header: "Deal ID", width: 12 },
      { header: "Property", width: 30 },
      { header: "City", width: 14 },
      { header: "State", width: 8 },
      { header: "Asset Type", width: 14 },
      { header: "Strategy", width: 18 },
      { header: "Purchase Price", width: 16 },
      { header: "Total Basis", width: 14 },
      { header: "ARV / Exit Value", width: 16 },
      { header: "Target Return %", width: 16 },
      { header: "Deal Score", width: 12 },
    ];
    executiveSummary.addRow([
      deal.dealId || "Deal",
      deal.property || "",
      deal.city || "",
      deal.state || "",
      deal.assetType || "",
      deal.strategy || "",
      currency.format(deal.purchasePrice || 0),
      currency.format(deal.totalBasis || 0),
      currency.format(deal.arv || 0),
      percent(deal.targetReturn || 0),
      weightedScore,
    ]);

    const scoringSheet = workbook.addWorksheet("Scoring");
    scoringSheet.columns = [
      { header: "Deal ID", width: 12 },
      { header: "Basis & Price (25%)", width: 20 },
      { header: "Value-Add Clarity (20%)", width: 20 },
      { header: "Market Quality (15%)", width: 18 },
      { header: "Exit Strength (15%)", width: 16 },
      { header: "Risk Profile (15%)", width: 16 },
      { header: "Investor Alignment (10%)", width: 18 },
      { header: "Weighted Score", width: 16 },
    ];
    scoringSheet.addRow([
      deal.dealId || "Deal",
      scores.basis,
      scores.valueAdd,
      scores.market,
      scores.exit,
      scores.risk,
      scores.alignment,
      weightedScore,
    ]);

    const investorSummary = workbook.addWorksheet("Investor Summary");
    investorSummary.columns = [
      { header: "Deal ID", width: 12 },
      { header: "Property", width: 28 },
      { header: "Strategy", width: 18 },
      { header: "Asset Type", width: 14 },
      { header: "Total Basis", width: 16 },
      { header: "ARV / Exit Value", width: 16 },
      { header: "Target Return %", width: 16 },
      { header: "Deal Score", width: 12 },
    ];
    investorSummary.addRow([
      deal.dealId || "Deal",
      deal.property || "",
      deal.strategy || "",
      deal.assetType || "",
      currency.format(deal.totalBasis || 0),
      currency.format(deal.arv || 0),
      percent(deal.targetReturn || 0),
      weightedScore,
    ]);

    const cfRule = {
      type: "colorScale" as const,
      cfvo: [
        { type: "num", value: 1 },
        { type: "num", value: 3.5 },
        { type: "num", value: 5 },
      ],
      color: ["FF9999", "FFFF99", "99FF99"],
      priority: 1,
    };

    scoringSheet.addConditionalFormatting({ ref: "H2:H200", rules: [cfRule] });
    executiveSummary.addConditionalFormatting({
      ref: "K2:K200",
      rules: [cfRule],
    });
    investorSummary.addConditionalFormatting({
      ref: "H2:H200",
      rules: [cfRule],
    });

    return workbook;
  };

  const downloadWorkbook = async () => {
    const workbook = await buildWorkbook();
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${deal.dealId || "Deal_Memo_System"}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const numberInput = (
    id: string,
    label: string,
    value: number,
    onChange: (value: number) => void,
    step = "0.1",
    helper?: string,
  ) => (
    <label className="flex flex-col gap-2" htmlFor={id}>
      <div className="flex items-center justify-between text-sm font-medium text-gray-700">
        <span>{label}</span>
        {helper && <span className="text-gray-400">{helper}</span>}
      </div>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step={step}
        min={0}
        max={id.includes("score") ? 5 : undefined}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );

  return (
    <PageLayout
      title="Real Estate Deal Presentation"
      subtitle="Institutional-grade outline plus an investor-ready Excel export—built for web use."
      maxWidth="7xl"
      showBackButton
    >
      <Helmet>
        <title>Deal Presentation Outline | RepMotivatedSeller</title>
        <meta
          name="description"
          content="Create investor-ready deal presentations, score opportunities, and export the Executive Summary workbook from the browser."
        />
      </Helmet>

      <div className="space-y-10">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-blue-900">
            <div className="flex items-center gap-2 font-semibold">
              <FileText className="h-5 w-5" />
              Investor-facing outline
            </div>
            <p className="mt-2 text-sm text-blue-800">
              Follow the sections below to stay crisp, logical, and scannable
              for institutional readers.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-emerald-900">
            <div className="flex items-center gap-2 font-semibold">
              <Target className="h-5 w-5" />
              Weighted score
            </div>
            <p className="mt-2 text-sm">
              Current score:{" "}
              <span className="font-semibold">{weightedScore.toFixed(2)}</span>{" "}
              ({scoreBand.label})
            </p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-amber-900">
            <div className="flex items-center gap-2 font-semibold">
              <FileSpreadsheet className="h-5 w-5" />
              Excel download
            </div>
            <p className="mt-2 text-sm">
              Generates Executive Summary, Scoring, and Investor Summary tabs
              from the inputs on this page.
            </p>
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <ListChecks className="h-5 w-5" />
            Presentation outline
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {outlineSections.map((section) => (
              <div
                key={section.title}
                className="rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                <div className="mb-2 text-sm font-semibold text-blue-700">
                  {section.title}
                </div>
                <p className="text-sm text-gray-700">{section.purpose}</p>
                <ul className="mt-3 space-y-1 text-sm text-gray-800 list-disc list-inside">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {section.note && (
                  <p className="mt-3 text-xs font-medium text-gray-600">
                    {section.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="text-lg font-semibold text-gray-900">
              Deal snapshot
            </div>
            <div className="grid gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Deal ID
                </span>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                  value={deal.dealId}
                  onChange={(e) => handleDealChange("dealId", e.target.value)}
                />
              </label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Property
                  </span>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    value={deal.property}
                    onChange={(e) =>
                      handleDealChange("property", e.target.value)
                    }
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    aria-label="City"
                    placeholder="City"
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    value={deal.city}
                    onChange={(e) => handleDealChange("city", e.target.value)}
                  />
                  <input
                    type="text"
                    aria-label="State"
                    placeholder="State"
                    className="rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    value={deal.state}
                    onChange={(e) => handleDealChange("state", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  type="text"
                  aria-label="Asset type"
                  placeholder="Asset type"
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                  value={deal.assetType}
                  onChange={(e) =>
                    handleDealChange("assetType", e.target.value)
                  }
                />
                <input
                  type="text"
                  aria-label="Strategy"
                  placeholder="Strategy"
                  className="rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                  value={deal.strategy}
                  onChange={(e) => handleDealChange("strategy", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {numberInput(
                  "purchasePrice",
                  "Purchase price",
                  deal.purchasePrice,
                  (v) => handleDealChange("purchasePrice", v),
                  "1000",
                )}
                {numberInput(
                  "totalBasis",
                  "Total basis",
                  deal.totalBasis,
                  (v) => handleDealChange("totalBasis", v),
                  "1000",
                )}
                {numberInput(
                  "arv",
                  "ARV / exit value",
                  deal.arv,
                  (v) => handleDealChange("arv", v),
                  "1000",
                )}
                {numberInput(
                  "targetReturn",
                  "Target return %",
                  deal.targetReturn,
                  (v) => handleDealChange("targetReturn", v),
                  "0.1",
                  "Percent",
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-900">
                Scoring (1–5)
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${scoreBand.className}`}
              >
                {scoreBand.label}
              </span>
            </div>
            <div className="grid gap-3">
              {numberInput(
                "score-basis",
                "Basis & Price (25%)",
                scores.basis,
                (v) => handleScoreChange("basis", v),
                "0.1",
                "1–5",
              )}
              {numberInput(
                "score-value-add",
                "Value-Add Clarity (20%)",
                scores.valueAdd,
                (v) => handleScoreChange("valueAdd", v),
                "0.1",
                "1–5",
              )}
              {numberInput(
                "score-market",
                "Market Quality (15%)",
                scores.market,
                (v) => handleScoreChange("market", v),
                "0.1",
                "1–5",
              )}
              {numberInput(
                "score-exit",
                "Exit Strength (15%)",
                scores.exit,
                (v) => handleScoreChange("exit", v),
                "0.1",
                "1–5",
              )}
              {numberInput(
                "score-risk",
                "Risk Profile (15%)",
                scores.risk,
                (v) => handleScoreChange("risk", v),
                "0.1",
                "1–5",
              )}
              {numberInput(
                "score-alignment",
                "Investor Alignment (10%)",
                scores.alignment,
                (v) => handleScoreChange("alignment", v),
                "0.1",
                "1–5",
              )}
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Weighted Score
                </span>
                <span className="text-2xl font-semibold text-gray-900">
                  {weightedScore.toFixed(2)}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                Formula: 0.25*Basis + 0.20*Value-Add + 0.15*Market + 0.15*Exit +
                0.15*Risk + 0.10*Alignment
              </p>
            </div>
            <button
              type="button"
              onClick={downloadWorkbook}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Download className="h-4 w-4" />
              Download Excel (3 tabs)
            </button>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default DealPresentationOutlinePage;
