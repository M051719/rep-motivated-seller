// @ts-nocheck
import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import EnhancedApp from "./App.enhanced";
import "./index.css";

// Enhanced Error Fallback Component
const ErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen flex items-center justify-center bg-red-50">
    <div className="max-w-md mx-auto text-center p-6">
      <div className="text-6xl mb-4">💥</div>
      <h2 className="text-2xl font-bold text-red-800 mb-4">
        Application Error
      </h2>
      <p className="text-red-600 mb-6">
        Something went wrong with RepMotivatedSeller
      </p>
      <details className="text-left bg-red-100 p-4 rounded-lg mb-6">
        <summary className="cursor-pointer font-medium text-red-800 mb-2">
          Error Details
        </summary>
        <pre className="text-xs text-red-700 overflow-auto">
          {error.message}
        </pre>
      </details>
      <div className="space-x-4">
        <button
          onClick={resetErrorBoundary}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
        >
          Go Home
        </button>
      </div>
    </div>
  </div>
);

// Enhanced Performance Monitoring
const performanceObserver = () => {
  if ("PerformanceObserver" in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        // Log performance metrics for monitoring
        if (entry.entryType === "navigation") {
          console.log(`Page Load Time: ${entry.duration}ms`);
        }
      });
    });

    observer.observe({ entryTypes: ["navigation", "paint"] });
  }
};

// Enhanced App Initialization
const initializeApp = () => {
  // Performance monitoring
  performanceObserver();

  // Service Worker registration (if available)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }

  // Enhanced error tracking
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
  });

  // App initialization complete
  console.log("🏠 RepMotivatedSeller Enhanced App Initialized");
};

// Initialize enhanced features
initializeApp();

// Render Enhanced App
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error("Application Error:", error, errorInfo);
        // You can send error reports to your monitoring service here
      }}
      onReset={() => {
        // Clean up and reset application state
        window.location.reload();
      }}
    >
      <EnhancedApp />
    </ErrorBoundary>
  </React.StrictMode>,
);
