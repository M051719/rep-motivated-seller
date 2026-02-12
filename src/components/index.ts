// src/components/index.ts - Centralized component exports

// Layout Components
export { default as Header } from "./layout/Header";
export { default as Footer } from "./layout/Footer";
export { DashboardNavigation } from "./DashboardNavigation";

// Calculator Components
export { FlipAnalyzer } from "./calculators/FlipAnalyzer";
export { RentalAnalyzer } from "./calculators/RentalAnalyzer";
export { RentalAnalyzerFull } from "./calculators/RentalAnalyzerFull";
export { ProfessionalUnderwriting } from "./calculators/ProfessionalUnderwriting";
export { AmortizationCalculator } from "./calculators/AmortizationCalculator";
export { RepairEstimator } from "./calculators/RepairEstimator";
export { FlipVsRentCalculator } from "./calculators/FlipVsRentCalculator";
export { UnderwritingAnalyzer } from "./calculators/UnderwritingAnalyzer";
export { PerformanceDashboard } from "./calculators/PerformanceDashboard";

// Auth & User Components
export { default as AuthForm } from "./AuthForm";
export { default as UserProfile } from "./UserProfile";

// Foreclosure Components
export { default as ForeclosureQuestionnaire } from "./ForeclosureQuestionnaire";

// UI Components
export { BackButton } from "./ui/BackButton";

// Credit Repair Components
export { default as PricingCards } from "./credit-repair/PricingCards";

// Compliance Components
export { default as SMSOptInComponent } from "./compliance/SMSOptInComponent";

// Analytics Components
export { default as PropertyIntelligenceDashboard } from "./analytics/PropertyIntelligenceDashboard";

// Legal Components
export { default as UnsubscribePage } from "./legal/UnsubscribePage";

// Payment Components
export { default as PayPalCheckout } from "./payments/PayPalCheckout";
