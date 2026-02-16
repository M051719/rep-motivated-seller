import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase, ForeclosureResponse } from "../../lib/supabase";

interface AdminStats {
  total: number;
  submitted: number;
  reviewed: number;
  contacted: number;
  closed: number;
  urgent: number;
  todaySubmissions: number;
}

const AdminStats: React.FC = () => {
  const [submissions, setSubmissions] = useState<ForeclosureResponse[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    submitted: 0,
    reviewed: 0,
    contacted: 0,
    closed: 0,
    urgent: 0,
    todaySubmissions: 0,
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [urgency, setUrgency] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [loading, setLoading] = useState(false);

  const getUrgencyLevel = useCallback((submission: ForeclosureResponse) => {
    const missed = submission.missed_payments || 0;
    const hasNOD = submission.nod === "yes";
    const overwhelmed = submission.overwhelmed === "yes";
    if (hasNOD || missed >= 3 || overwhelmed) return "high";
    if (missed >= 1) return "medium";
    return "low";
  }, []);

  const calculateStats = useCallback(
    (data: ForeclosureResponse[]) => {
      const today = new Date().toDateString();
      const urgent = data.filter((s) => getUrgencyLevel(s) === "high").length;
      const todaySubmissions = data.filter(
        (s) => new Date(s.created_at).toDateString() === today,
      ).length;

      setStats({
        total: data.length,
        submitted: data.filter((s) => s.status === "submitted").length,
        reviewed: data.filter((s) => s.status === "reviewed").length,
        contacted: data.filter((s) => s.status === "contacted").length,
        closed: data.filter((s) => s.status === "closed").length,
        urgent,
        todaySubmissions,
      });
    },
    [getUrgencyLevel],
  );

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("foreclosure_responses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const list = data || [];
      setSubmissions(list);
      calculateStats(list);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const filtered = useMemo(() => {
    let result = [...submissions];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.contact_name?.toLowerCase().includes(q) ||
          s.contact_email?.toLowerCase().includes(q) ||
          s.lender?.toLowerCase().includes(q),
      );
    }

    if (status !== "all") {
      result = result.filter((s) => s.status === status);
    }

    if (urgency !== "all") {
      result = result.filter((s) => getUrgencyLevel(s) === urgency);
    }

    if (dateRange !== "all") {
      const now = new Date();
      const cutoff = new Date();
      switch (dateRange) {
        case "today":
          cutoff.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoff.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      result = result.filter(
        (s) => new Date(s.created_at).getTime() >= cutoff.getTime(),
      );
    }

    return result;
  }, [submissions, search, status, urgency, dateRange, getUrgencyLevel]);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Stats</h1>
          <p className="text-sm text-gray-600">
            Foreclosure submissions overview (lightweight view rebuilt to fix
            lint).
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total" value={stats.total} />
        <Stat label="Submitted" value={stats.submitted} />
        <Stat label="Reviewed" value={stats.reviewed} />
        <Stat label="Urgent" value={stats.urgent} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <label className="text-sm text-gray-700">
          Search
          <input
            className="mt-1 w-full border rounded px-2 py-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="name, email, lender"
          />
        </label>
        <label className="text-sm text-gray-700">
          Status
          <select
            className="mt-1 w-full border rounded px-2 py-1"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <label className="text-sm text-gray-700">
          Urgency
          <select
            className="mt-1 w-full border rounded px-2 py-1"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label className="text-sm text-gray-700">
          Date range
          <select
            className="mt-1 w-full border rounded px-2 py-1"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>
        </label>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Contact</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Urgency</th>
              <th className="px-3 py-2 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-3 py-2">
                  <div className="font-semibold">
                    {s.contact_name || "Unknown"}
                  </div>
                  <div className="text-gray-500">
                    {s.contact_email || "No email"}
                  </div>
                </td>
                <td className="px-3 py-2">{s.status || "n/a"}</td>
                <td className="px-3 py-2">{getUrgencyLevel(s)}</td>
                <td className="px-3 py-2">
                  {new Date(s.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-gray-500" colSpan={4}>
                  No submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="border rounded-lg p-3 bg-white">
    <div className="text-xs uppercase text-gray-500">{label}</div>
    <div className="text-xl font-bold text-gray-900">{value}</div>
  </div>
);

export default AdminStats;
