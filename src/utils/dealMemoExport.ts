import ExcelJS from "exceljs";

export interface DealMemoData {
  dealId?: string;
  property?: string;
  city?: string;
  state?: string;
  assetType?: string;
  strategy?: string;
  purchasePrice?: number;
  totalBasis?: number;
  exitValue?: number;
  targetReturnPercent?: number;
  dealScore?: number;
  filename?: string;
}

const cleanNumber = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : "";

export const exportDealMemoWorkbook = async (data: DealMemoData = {}) => {
  const {
    dealId = `DEAL-${Date.now()}`,
    property = "",
    city = "",
    state = "",
    assetType = "",
    strategy = "",
    purchasePrice,
    totalBasis,
    exitValue,
    targetReturnPercent,
    dealScore,
    filename = "Deal_Memo_System.xlsx",
  } = data;

  const workbook = new ExcelJS.Workbook();

  const exec = workbook.addWorksheet("Executive Summary");
  exec.columns = [
    { header: "Deal ID", width: 14 },
    { header: "Property", width: 28 },
    { header: "City", width: 16 },
    { header: "State", width: 10 },
    { header: "Asset Type", width: 16 },
    { header: "Strategy", width: 18 },
    { header: "Purchase Price", width: 16 },
    { header: "Total Basis", width: 14 },
    { header: "ARV / Exit Value", width: 18 },
    { header: "Target Return %", width: 16 },
    { header: "Deal Score", width: 12 },
  ];
  exec.addRow([
    dealId,
    property,
    city,
    state,
    assetType,
    strategy,
    cleanNumber(purchasePrice),
    cleanNumber(totalBasis),
    cleanNumber(exitValue),
    cleanNumber(targetReturnPercent),
    cleanNumber(dealScore),
  ]);

  const scoring = workbook.addWorksheet("Scoring");
  scoring.columns = [
    { header: "Deal ID", width: 12 },
    { header: "Basis & Price (25%)", width: 20 },
    { header: "Value-Add Clarity (20%)", width: 20 },
    { header: "Market Quality (15%)", width: 18 },
    { header: "Exit Strength (15%)", width: 16 },
    { header: "Risk Profile (15%)", width: 16 },
    { header: "Investor Alignment (10%)", width: 18 },
    { header: "Weighted Score", width: 16 },
  ];
  scoring.addRow([dealId, "", "", "", "", "", "", ""]);
  scoring.addRow([
    "",
    "Scoring rubric: 1=Weak, 3=Average, 5=Excellent. Weighted score auto-calculates.",
  ]);
  scoring.getCell("H2").value = {
    formula: "B2*0.25 + C2*0.20 + D2*0.15 + E2*0.15 + F2*0.15 + G2*0.10",
  };

  const investor = workbook.addWorksheet("Investor Summary");
  investor.columns = [
    { header: "Deal ID", width: 14 },
    { header: "Property", width: 28 },
    { header: "Strategy", width: 18 },
    { header: "Asset Type", width: 16 },
    { header: "Total Basis", width: 16 },
    { header: "ARV / Exit Value", width: 18 },
    { header: "Target Return %", width: 16 },
    { header: "Deal Score", width: 12 },
  ];
  investor.addRow([
    dealId,
    property,
    strategy,
    assetType,
    cleanNumber(totalBasis),
    cleanNumber(exitValue),
    cleanNumber(targetReturnPercent),
    "",
  ]);
  investor.getCell("H2").value = { formula: "Scoring!H2" };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
