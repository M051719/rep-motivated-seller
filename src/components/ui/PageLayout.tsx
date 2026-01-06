import React from "react";
import BackButton from "./BackButton";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonLabel?: string;
  backButtonPath?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "7xl" | "full";
  className?: string;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = true,
  backButtonLabel = "← Back",
  backButtonPath = "/",
  maxWidth = "7xl",
  className = "",
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className={`${maxWidthClasses[maxWidth]} mx-auto ${className}`}>
        {showBackButton && (
          <div className="mb-6">
            <BackButton label={backButtonLabel} fallbackPath={backButtonPath} />
          </div>
        )}

        {(title || subtitle) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {title}
              </h1>
            )}
            {subtitle && <p className="text-lg text-gray-600">{subtitle}</p>}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">{children}</div>
      </div>
    </div>
  );
};

export default PageLayout;
