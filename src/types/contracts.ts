// Contract types
export type ContractType = "wholesale" | "fix-flip" | "cashout-refi";

export interface ContractData {
  id: string;
  userId: string;
  type: ContractType;
  data: WholesaleContractData | FixFlipFormData | CashoutRefiFormData;
  generatedHtml?: string;
  status: "draft" | "generated" | "downloaded" | "signed";
  createdAt: string;
  updatedAt: string;
}

export interface WholesaleContractData {
  propertyAddress: string;
  legalDescription: string;
  parcelNumber: string;
  sellerName: string;
  sellerAddress: string;
  buyerName: string;
  buyerAddress: string;
  purchasePrice: number;
  wholesaleFee: number;
  closingDate: string;
}

export interface FixFlipFormData {
  propertyAddress: string;
  legalDescription: string;
  parcelNumber: string;
  propertyType: string;
  yearBuilt: string;
  squareFootage: string;
  bedrooms: string;
  bathrooms: string;
  lotSize: string;
  zoning: string;
  sellerName: string;
  sellerAddress: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerEntityType: string;
  buyerName: string;
  buyerAddress: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerEntityType: string;
  buyerLicense: string;
  purchasePrice: string;
  earnestMoney: string;
  downPayment: string;
  financingType: string;
  loanAmount: string;
  interestRate: string;
  loanTerm: string;
  estimatedRehabCost: string;
  rehabTimeline: string;
  contractorLicense: string;
  permitRequired: string;
  renovationScope: string;
  afterRepairValue: string;
  comparableSales: string;
  marketConditions: string;
  holdingPeriod: string;
  inspectionPeriod: string;
  financingContingency: string;
  appraisalContingency: string;
  titleContingency: string;
  closingDate: string;
  closingLocation: string;
  titleCompany: string;
  disclosures: string[];
  warranties: string[];
  defaultRemedies: string[];
}

export interface CashoutRefiFormData {
  borrowerName: string;
  borrowerAddress: string;
  borrowerPhone: string;
  borrowerEmail: string;
  borrowerSSN: string;
  borrowerDOB: string;
  borrowerEmployer: string;
  borrowerIncome: string;
  borrowerCreditScore: string;
  coBorrowerName: string;
  coBorrowerAddress: string;
  coBorrowerPhone: string;
  coBorrowerEmail: string;
  coBorrowerSSN: string;
  coBorrowerDOB: string;
  coBorrowerEmployer: string;
  coBorrowerIncome: string;
  coBorrowerCreditScore: string;
  propertyAddress: string;
  propertyType: string;
  propertyValue: string;
  yearBuilt: string;
  squareFootage: string;
  occupancyType: string;
  propertyUse: string;
  currentLender: string;
  currentBalance: string;
  currentRate: string;
  currentPayment: string;
  originalLoanDate: string;
  requestedLoanAmount: string;
  cashoutAmount: string;
  newLoanTerm: string;
  desiredRate: string;
  loanProgram: string;
  monthlyIncome: string;
  monthlyDebts: string;
  assets: string;
  liabilities: string;
  cashoutPurpose: string;
  purposeDetails: string;
  lenderName: string;
  lenderAddress: string;
  lenderPhone: string;
  lenderEmail: string;
  loanOfficer: string;
  lenderLicense: string;
}
