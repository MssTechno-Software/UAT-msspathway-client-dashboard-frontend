import { useEffect, useState, useCallback } from "react";
import { FiLoader } from "react-icons/fi";
import StatCard from "../components/StatCard";
import InterviewTable from "../components/InterviewTable";
import AnalyticsPanel from "../components/AnalyticsPanel";
import axios from "axios";
import BASE_URL from "../config/api";
function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const clientId = localStorage.getItem("client_id");
  const token = localStorage.getItem("token");

 const fetchDashboard = useCallback(async (signal) => {
    try {
        setLoading(true);
        console.log("Client ID:", clientId);
        console.log("Token:", token);
        const response = await axios.get(
            `${BASE_URL}/api/clients/${clientId}/dashboard`,
            {
                params: {
                    recent_limit: 5,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                signal,
            }
        );
        if (signal.aborted) return;
        console.log("Dashboard Response:", response.data);
        setData(response.data);
    } catch (error) {
        if (!signal.aborted) {
            console.error("Dashboard Error:", error.response?.data || error.message);
        }
    } finally {
        if (!signal.aborted) {
            setLoading(false);
        }
    }
}, [clientId, token]);
useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => {
        if (!controller.signal.aborted) {
            fetchDashboard(controller.signal);
        }
    });
    return () => controller.abort();
}, [fetchDashboard]);

  if (loading || !data) {
    return (
      <div className="fixed inset-0 bg-black/40 z-9999 flex items-center justify-center">
        <div className="p-6 flex flex-col items-center gap-3">
          <FiLoader className="animate-spin text-4xl text-green-800" />

          <p className="text-gray-800 font-medium">
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212529] px-6 md:px-10 xl:px-12 py-8 md:py-10">
      {/* Header */}
      <header className="mb-8 md:mb-10">
        <h1 className="text-[28px] md:text-[32px] leading-tight font-bold tracking-[-0.01em] text-[#230804]">
          {data.greeting}
        </h1>

        <p className="mt-2 text-[16px] md:text-[18px] text-[#6c757d]">
          Practice. Analyze. Improve. Repeat...
        </p>
      </header>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <StatCard
          title="Total Interviews Completed"
          value={data?.summary?.total_interviews_completed ?? 0}
          message="Keep up the good work! ❤️"
          type="interviews"
        />

        <StatCard
          title="Average Performance Score"
          value={`${data?.summary?.average_performance_score ?? 0}%`}
          message="You're performing great! ✨"
          type="performance"
        />
      </section>

      {/* Table + Analytics */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8">
          <InterviewTable
            interviews={data?.recently_completed_interviews ?? []}
          />
        </div>

        <div className="xl:col-span-4">
          <AnalyticsPanel
            analytics={data?.performance_analytics ?? []}
          />
        </div>
      </section>
    </div>
  );
}
export default Dashboard;