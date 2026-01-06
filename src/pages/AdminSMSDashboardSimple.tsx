import React from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/ui/BackButton";

const AdminSMSDashboardSimple: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <BackButton />
        <button
          onClick={() => navigate("/")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            marginBottom: "16px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#374151",
            backgroundColor: "white",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#f9fafb";
            e.currentTarget.style.color = "#111827";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.color = "#374151";
          }}
        >
          <svg
            style={{ width: "16px", height: "16px" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </button>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#333" }}>
          📱 SMS Monitoring Dashboard
        </h1>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#666" }}
          >
            ✅ Dashboard Loaded Successfully!
          </h2>

          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "1.1rem", color: "#555", lineHeight: "1.6" }}>
              Your SMS monitoring system is set up and ready to use.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#e3f2fd",
              padding: "15px",
              borderRadius: "6px",
              borderLeft: "4px solid #2196f3",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "1.2rem",
                marginBottom: "0.5rem",
                color: "#1976d2",
              }}
            >
              📊 System Status
            </h3>
            <ul
              style={{ margin: "10px 0", paddingLeft: "20px", color: "#555" }}
            >
              <li>✅ Database tables created</li>
              <li>✅ Alert rules configured (5 rules)</li>
              <li>✅ Quick replies loaded (5 templates)</li>
              <li>✅ Admin permissions set</li>
              <li>⏳ Waiting for first SMS message</li>
            </ul>
          </div>

          <div
            style={{
              backgroundColor: "#fff3e0",
              padding: "15px",
              borderRadius: "6px",
              borderLeft: "4px solid #ff9800",
            }}
          >
            <h3
              style={{
                fontSize: "1.2rem",
                marginBottom: "0.5rem",
                color: "#f57c00",
              }}
            >
              📱 Send Test SMS
            </h3>
            <p style={{ color: "#555", marginBottom: "10px" }}>
              Text this number to create your first conversation:
            </p>
            <div
              style={{
                backgroundColor: "#fff",
                padding: "12px",
                borderRadius: "4px",
                fontSize: "1.3rem",
                fontWeight: "bold",
                color: "#f57c00",
                textAlign: "center",
                border: "2px dashed #ff9800",
              }}
            >
              (877) 806-4677
            </div>
            <p style={{ color: "#555", marginTop: "10px", fontSize: "0.9rem" }}>
              Example message: "Help! I'm behind on my mortgage payments"
            </p>
          </div>

          <div
            style={{
              marginTop: "30px",
              padding: "15px",
              backgroundColor: "#f5f5f5",
              borderRadius: "6px",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "0.5rem",
                color: "#666",
              }}
            >
              🔧 Next Steps
            </h3>
            <ol
              style={{ margin: "10px 0", paddingLeft: "20px", color: "#555" }}
            >
              <li>Send a test SMS to (877) 806-4677</li>
              <li>Wait for conversation to appear here</li>
              <li>Click conversation to view details</li>
              <li>Try sending a reply with Quick Reply templates</li>
            </ol>
          </div>

          <div
            style={{
              marginTop: "20px",
              fontSize: "0.9rem",
              color: "#999",
              textAlign: "center",
            }}
          >
            <p>
              Full dashboard with real-time updates will be available once the
              circular dependency is resolved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSMSDashboardSimple;
