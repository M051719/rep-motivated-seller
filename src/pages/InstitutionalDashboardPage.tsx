import React from "react";
import { Helmet } from "react-helmet-async";
import ExcelJS from "exceljs";
import {
  Download,
  Gauge,
  BarChart3,
  TimerReset,
  Layers,
  Radar,
  Landmark,
  Rocket,
  RefreshCcw,
} from "lucide-react";
import { PageLayout } from "../components/ui/PageLayout";

const currencyFormat = (v: number) => ({
  formula: undefined,
  result: v,
});

const addDealsSheet = (workbook: ExcelJS.Workbook) => {
  const ws = workbook.addWorksheet("Deals");
  ws.columns = [
    { header: "Deal ID", key: "deal_id", width: 12 },
    { header: "Property Name", key: "property", width: 28 },
    { header: "Market", key: "market", width: 16 },
    { header: "Asset Type", key: "asset_type", width: 14 },
    { header: "Strategy", key: "strategy", width: 14 },
    { header: "Investor Type", key: "investor_type", width: 16 },
    { header: "Purchase Price", key: "purchase_price", width: 16 },
    { header: "Total Basis", key: "total_basis", width: 14 },
    { header: "ARV", key: "arv", width: 14 },
    { header: "Deal Score", key: "deal_score", width: 12 },
    { header: "Current Stage", key: "stage", width: 16 },
    { header: "Date Sourced", key: "date_sourced", width: 14 },
    { header: "Date Underwritten", key: "date_under", width: 16 },
    { header: "Date Investor Ready", key: "date_ready", width: 18 },
    { header: "Date Presented", key: "date_presented", width: 16 },
    { header: "Date Closed / Passed", key: "date_closed", width: 18 },
    { header: "Days Sourced → Underwritten", key: "days_su", width: 20 },
    { header: "Days Underwritten → Investor Ready", key: "days_ur", width: 24 },
    { header: "Total Days in Pipeline", key: "days_total", width: 18 },
    { header: "Capital Deployed", key: "capital_deployed", width: 16 },
  ];

  const sampleRows = [
    {
      deal_id: "DEAL-1001",
      property: "123 Main St",
      market: "Austin",
      asset_type: "SFR",
      strategy: "Wholesale",
      investor_type: "Wholesale",
      purchase_price: 185000,
      total_basis: 195000,
      arv: 245000,
      deal_score: 4.4,
      stage: "Investor Ready",
      date_sourced: new Date(2026, 0, 3),
      date_under: new Date(2026, 0, 6),
      date_ready: new Date(2026, 0, 9),
      date_presented: new Date(2026, 0, 10),
      date_closed: "",
      capital_deployed: 0,
    },
    {
      deal_id: "DEAL-1002",
      property: "456 Oak Ave",
      market: "Phoenix",
      asset_type: "Duplex",
      strategy: "FixFlip",
      investor_type: "FixFlip",
      purchase_price: 320000,
      total_basis: 395000,
      arv: 520000,
      deal_score: 3.8,
      stage: "Underwritten",
      date_sourced: new Date(2026, 0, 4),
      date_under: new Date(2026, 0, 8),
      date_ready: "",
      date_presented: "",
      date_closed: "",
      capital_deployed: 0,
    },
    {
      deal_id: "DEAL-1003",
      property: "789 River Ct",
      market: "Charlotte",
      asset_type: "Triplex",
      strategy: "BRRR",
      investor_type: "BRRR",
      purchase_price: 410000,
      total_basis: 485000,
      arv: 650000,
      deal_score: 4.6,
      stage: "Closed",
      date_sourced: new Date(2025, 11, 10),
      date_under: new Date(2025, 11, 14),
      date_ready: new Date(2025, 11, 18),
      date_presented: new Date(2025, 11, 19),
      date_closed: new Date(2026, 0, 5),
      capital_deployed: 250000,
    },
  ];

  sampleRows.forEach((row) => {
    const excelRow = ws.addRow([
      row.deal_id,
      row.property,
      row.market,
      row.asset_type,
      row.strategy,
      row.investor_type,
      row.purchase_price,
      row.total_basis,
      row.arv,
      row.deal_score,
      row.stage,
      row.date_sourced,
      row.date_under,
      row.date_ready,
      row.date_presented,
      row.date_closed,
      "",
      "",
      "",
      row.capital_deployed,
    ]);

    const r = excelRow.number;
    excelRow.getCell(17).value = {
      formula: `IF(ISBLANK(M${r}),"",M${r}-L${r})`,
    };
    excelRow.getCell(18).value = {
      formula: `IF(ISBLANK(N${r}),"",N${r}-M${r})`,
    };
    excelRow.getCell(19).value = {
      formula: `IF(ISBLANK(P${r}),TODAY()-L${r},P${r}-L${r})`,
    };
  });

  const cfRule = {
    type: "colorScale" as const,
    cfvo: [
      { type: "num", value: 1 },
      { type: "num", value: 3.5 },
      { type: "num", value: 5 },
    ],
    color: ["FF9999", "FFFF99", "99FF99"],
  };

  ws.addConditionalFormatting({ ref: "J2:J500", rules: [cfRule] });

  ws.addTable({
    name: "DealsTable",
    ref: "A1",
    headerRow: true,
    totalsRow: false,
    style: { theme: "TableStyleMedium9", showRowStripes: true },
    columns: ws.columns.map((c) => ({ name: c.header as string })),
    rows: [],
  });
};

const addScoringSheet = (workbook: ExcelJS.Workbook) => {
  const ws = workbook.addWorksheet("Scoring");
  ws.columns = [
    { header: "Deal ID", width: 12 },
    { header: "Basis & Price (25%)", width: 20 },
    { header: "Value-Add Clarity (20%)", width: 20 },
    { header: "Market Quality (15%)", width: 18 },
    { header: "Exit Strength (15%)", width: 16 },
    { header: "Risk Profile (15%)", width: 16 },
    { header: "Investor Alignment (10%)", width: 18 },
    { header: "Weighted Score", width: 16 },
  ];

  const rows = [
    ["DEAL-1001", 4.2, 4.0, 3.8, 4.1, 3.5, 4.6, ""],
    ["DEAL-1002", 3.5, 3.8, 3.6, 3.7, 3.4, 3.9, ""],
    ["DEAL-1003", 4.4, 4.3, 4.1, 4.2, 3.9, 4.7, ""],
  ];

  rows.forEach((r) => {
    const row = ws.addRow(r);
    const idx = row.number;
    row.getCell(8).value = {
      formula: `B${idx}*0.25 + C${idx}*0.20 + D${idx}*0.15 + E${idx}*0.15 + F${idx}*0.15 + G${idx}*0.10`,
    };
  });

  const cfRule = {
    type: "colorScale" as const,
    cfvo: [
      { type: "num", value: 1 },
      { type: "num", value: 3.5 },
      { type: "num", value: 5 },
    ],
    color: ["FF9999", "FFFF99", "99FF99"],
  };
  ws.addConditionalFormatting({ ref: "H2:H500", rules: [cfRule] });
};

const addInvestorsSheet = (workbook: ExcelJS.Workbook) => {
  const ws = workbook.addWorksheet("Investors");
  ws.columns = [
    { header: "Investor Name", width: 24 },
    { header: "Investor Type", width: 16 },
    { header: "Email", width: 28 },
    { header: "Phone", width: 16 },
    { header: "Preferences", width: 28 },
    { header: "Capital Ready", width: 16 },
    { header: "Notes", width: 32 },
  ];
  ws.addRows([
    [
      "Summit Partners",
      "Wholesale",
      "wholesale@summit.com",
      "555-1010",
      "Assignments under 21 days",
      500000,
      "Fast movers",
    ],
    [
      "Oakbridge Capital",
      "FixFlip",
      "ff@oakbridge.com",
      "555-2020",
      "$350-650k ARV urban",
      750000,
      "Prefers newer stock",
    ],
    [
      "Frontier Equity",
      "BRRR",
      "brrr@frontier.com",
      "555-3030",
      "Cashflow-first secondary markets",
      1000000,
      "Likes stabilized cap >7%",
    ],
  ]);
};

const addStagesLogSheet = (workbook: ExcelJS.Workbook) => {
  const ws = workbook.addWorksheet("Deal_Stages_Log");
  ws.columns = [
    { header: "Deal ID", width: 12 },
    { header: "Stage Name", width: 18 },
    { header: "Stage Start Date", width: 16 },
    { header: "Stage End Date", width: 16 },
    { header: "Days in Stage", width: 14 },
  ];

  const rows = [
    [
      "DEAL-1001",
      "Underwritten",
      new Date(2026, 0, 6),
      new Date(2026, 0, 9),
      "",
    ],
    ["DEAL-1001", "Investor Ready", new Date(2026, 0, 9), "", ""],
    ["DEAL-1002", "Underwritten", new Date(2026, 0, 8), "", ""],
  ];

  rows.forEach((r) => {
    const row = ws.addRow(r);
    const idx = row.number;
    row.getCell(5).value = {
      formula: `IF(D${idx}="",TODAY()-C${idx},D${idx}-C${idx})`,
    };
  });
};

const addCapitalSheet = (workbook: ExcelJS.Workbook) => {
  const ws = workbook.addWorksheet("Capital");
  ws.columns = [
    { header: "Deal ID", width: 12 },
    { header: "Investor Name", width: 24 },
    { header: "Investor Type", width: 16 },
    { header: "Capital Committed", width: 18 },
    { header: "Capital Deployed", width: 18 },
    { header: "Capital Commit Date", width: 18 },
    { header: "Deployment Date", width: 16 },
    { header: "Expected Return", width: 16 },
    { header: "Actual Return", width: 16 },
    { header: "Capital Velocity (Days)", width: 22 },
  ];

  const rows = [
    [
      "DEAL-1003",
      "Frontier Equity",
      "BRRR",
      300000,
      250000,
      new Date(2025, 11, 15),
      new Date(2026, 0, 5),
      0.16,
      0.0,
      "",
    ],
    [
      "DEAL-1002",
      "Oakbridge Capital",
      "FixFlip",
      200000,
      0,
      new Date(2026, 0, 12),
      "",
      0.18,
      0.0,
      "",
    ],
  ];

  rows.forEach((r) => {
    const row = ws.addRow(r);
    const idx = row.number;
    row.getCell(10).value = {
      formula: `IF(G${idx}="",TODAY()-F${idx},G${idx}-F${idx})`,
    };
  });
};

const addPivotPlaceholder = (workbook: ExcelJS.Workbook) => {
  const ws = workbook.addWorksheet("Pivot_Data");
  ws.addRow([
    "Instruction",
    "Build a pivot sourced from DealsTable (rows: Strategy, Investor Type; values: count Deal ID, avg Deal Score, avg Total Days, sum Total Basis, sum Capital Deployed; filters: Status/Stage, Market, Date Range)",
  ]);
};

const addDashboardSheet = (
  workbook: ExcelJS.Workbook,
  name: string,
  description: string,
) => {
  const ws = workbook.addWorksheet(name);
  ws.addRow([name]);
  ws.addRow([description]);
  ws.addRow([]);
  ws.addRow(["Suggested KPIs / Charts"]);
  ws.addRows([
    ["• KPI cards: totals, averages, velocity, capital"],
    ["• Top 10 table by score"],
    ["• Funnel / timeline chart"],
    ["• Score or ROI distribution"],
  ]);
};

const buildWorkbook = async () => {
  const wb = new ExcelJS.Workbook();
  wb.created = new Date();
  wb.modified = new Date();

  addDealsSheet(wb);
  addScoringSheet(wb);
  addInvestorsSheet(wb);
  addStagesLogSheet(wb);
  addCapitalSheet(wb);
  addPivotPlaceholder(wb);
  addDashboardSheet(
    wb,
    "Dashboard_Overview",
    "CEO view: sourcing, speed, capital deployment",
  );
  addDashboardSheet(wb, "Dashboard_Wholesaler", "Filtered: Strategy=Wholesale");
  addDashboardSheet(wb, "Dashboard_FixFlip", "Filtered: Strategy=FixFlip");
  addDashboardSheet(wb, "Dashboard_FixHold", "Filtered: Strategy=Hold");
  addDashboardSheet(wb, "Dashboard_BRRR", "Filtered: Strategy=BRRR");
  addDashboardSheet(
    wb,
    "Dashboard_Capital",
    "Capital deployment, velocity, ROI by strategy",
  );

  return wb;
};

const downloadWorkbook = async () => {
  const wb = await buildWorkbook();
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Institutional_Dashboard_System.xlsx";
  link.click();
  URL.revokeObjectURL(url);
};

const InstitutionalDashboardPage: React.FC = () => {
  return (
    <PageLayout
      title="Institutional Dashboard System"
      subtitle="Fund-level XLSX architecture with auto-refresh pivots, velocity tracking, and capital monitoring."
      maxWidth="7xl"
    >
      <Helmet>
        <title>Institutional Dashboard | RepMotivatedSeller</title>
      </Helmet>

      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-blue-900">
              <Gauge className="h-5 w-5" />
              Velocity + capital control
            </div>
            <p className="mt-2 text-sm text-blue-800">
              Tracks days-in-stage, investor strategy, and capital deployment
              from one master table.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-emerald-900">
              <RefreshCcw className="h-5 w-5" />
              Auto-refresh pivots
            </div>
            <p className="mt-2 text-sm text-emerald-800">
              Built on Excel Tables so Refresh All keeps dashboards synced.
            </p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-amber-900">
              <Rocket className="h-5 w-5" />
              LP-ready outputs
            </div>
            <p className="mt-2 text-sm text-amber-800">
              Strategy-segmented dashboards for Wholesale, FixFlip, Hold, BRRR,
              and capital.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Download className="h-5 w-5" />
            Download the Excel system
          </div>
          <p className="mt-2 text-sm text-gray-700">
            Generates all sheets with sample rows, velocity formulas, score
            color scales, and placeholders for pivot-linked dashboards. Open and
            hit Data → Refresh All after you connect pivots to the Deals table.
          </p>
          <button
            type="button"
            onClick={downloadWorkbook}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Download className="h-4 w-4" />
            Download Institutional Dashboard XLSX
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Layers className="h-5 w-5" />
              Core sheets
            </div>
            <ul className="mt-2 space-y-1 text-sm text-gray-800 list-disc list-inside">
              <li>Deals (master table with stages + velocity)</li>
              <li>Scoring (weighted score 0.25/0.20/0.15/0.15/0.15/0.10)</li>
              <li>Investors (preferences, capital ready)</li>
              <li>Deal_Stages_Log (movement + days-in-stage)</li>
              <li>Capital (commit vs deploy, velocity)</li>
              <li>Pivot_Data (source for dashboards)</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <BarChart3 className="h-5 w-5" />
              Dashboards
            </div>
            <ul className="mt-2 space-y-1 text-sm text-gray-800 list-disc list-inside">
              <li>Dashboard_Overview (CEO view)</li>
              <li>Dashboard_Wholesaler</li>
              <li>Dashboard_FixFlip</li>
              <li>Dashboard_FixHold</li>
              <li>Dashboard_BRRR</li>
              <li>Dashboard_Capital</li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <TimerReset className="h-5 w-5" />
            Refresh & next steps
          </div>
          <ol className="mt-2 space-y-1 text-sm text-gray-800 list-decimal list-inside">
            <li>Open the XLSX → confirm Tables exist (Ctrl + T).</li>
            <li>
              Build pivots from DealsTable into Pivot_Data (rows: Strategy,
              Investor Type; values: count Deal ID, avg Deal Score, avg Total
              Days, sum Total Basis, sum Capital Deployed; filters: Stage,
              Market, Date).
            </li>
            <li>Copy pivot charts into the dashboard sheets and align KPIs.</li>
            <li>Use Refresh All to keep every dashboard in sync.</li>
          </ol>
        </div>
      </div>
    </PageLayout>
  );
};

export default InstitutionalDashboardPage;
