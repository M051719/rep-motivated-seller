import React, { useState, useEffect } from "react";

interface Dispute {
  id: string;
  type: string;
  creditor: string;
  account: string;
  status: "Pending" | "In Review" | "Resolved" | "Rejected";
  submittedDate: string;
  expectedResolution?: string;
  resolution?: string;
  resolvedDate?: string;
}

interface ActiveDisputesProps {
  limit?: number;
}

const ActiveDisputes: React.FC<ActiveDisputesProps> = ({ limit }) => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      const response = await fetch("/api/credit-repair/disputes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result = await response.json();
      let disputesData = result.data || [];

      if (limit) {
        disputesData = disputesData.slice(0, limit);
      }

      setDisputes(disputesData);
    } catch (error) {
      console.error("Error loading disputes:", error);
      // Fallback data
      setDisputes([
        {
          id: "disp_001",
          type: "Late Payment",
          creditor: "ABC Bank",
          account: "****1234",
          status: "Pending",
          submittedDate: "2025-11-01",
          expectedResolution: "2025-12-01",
        },
        {
          id: "disp_002",
          type: "Collection",
          creditor: "XYZ Collections",
          account: "****5678",
          status: "In Review",
          submittedDate: "2025-10-15",
          expectedResolution: "2025-11-15",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string): string => {
    const statusClasses = {
      Pending: "status-pending",
      "In Review": "status-in-review",
      Resolved: "status-resolved",
      Rejected: "status-rejected",
    };
    return (
      statusClasses[status as keyof typeof statusClasses] || "status-pending"
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className="loading">Loading disputes...</div>;
  }

  if (disputes.length === 0) {
    return (
      <div className="no-disputes">
        <p>
          No active disputes. Start improving your credit by filing a dispute!
        </p>
        <button
          className="btn btn-primary btn-sm mt-3"
          onClick={() => (window.location.href = "/credit-repair/disputes/new")}
        >
          + New Dispute
        </button>
      </div>
    );
  }

  return (
    <div className="active-disputes-component">
      <div className="disputes-list">
        {disputes.map((dispute) => (
          <div key={dispute.id} className="dispute-item">
            <div className="dispute-header">
              <div>
                <h4 className="dispute-type">{dispute.type}</h4>
                <p className="dispute-creditor">
                  {dispute.creditor} • {dispute.account}
                </p>
              </div>
              <span
                className={`dispute-status ${getStatusClass(dispute.status)}`}
              >
                {dispute.status}
              </span>
            </div>

            <div className="dispute-details">
              <div className="detail-item">
                <span className="detail-label">Submitted:</span>
                <span className="detail-value">
                  {formatDate(dispute.submittedDate)}
                </span>
              </div>

              {dispute.status !== "Resolved" && dispute.expectedResolution && (
                <div className="detail-item">
                  <span className="detail-label">Expected Resolution:</span>
                  <span className="detail-value">
                    {formatDate(dispute.expectedResolution)}
                  </span>
                </div>
              )}

              {dispute.status === "Resolved" && dispute.resolvedDate && (
                <div className="detail-item">
                  <span className="detail-label">Resolved:</span>
                  <span className="detail-value success">
                    {formatDate(dispute.resolvedDate)}
                  </span>
                </div>
              )}
            </div>

            <div className="dispute-actions">
              <button
                className="btn btn-outline btn-sm"
                onClick={() =>
                  (window.location.href = `/credit-repair/disputes/${dispute.id}`)
                }
              >
                View Details
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() =>
                  (window.location.href = `/credit-repair/disputes/${dispute.id}/letters`)
                }
              >
                View Letters
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="disputes-footer">
        <button
          className="btn btn-primary"
          onClick={() => (window.location.href = "/credit-repair/disputes/new")}
        >
          + Start New Dispute
        </button>
        {limit && disputes.length >= limit && (
          <button
            className="btn btn-outline"
            onClick={() => (window.location.href = "/credit-repair/disputes")}
          >
            View All Disputes
          </button>
        )}
      </div>
    </div>
  );
};

export default ActiveDisputes;
