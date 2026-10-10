import { useState, useEffect, useCallback } from "react";
import { FiLoader } from "react-icons/fi";
import ModeCard from "../components/ModeCard";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../config/api";
import PreMarketingSlider from "../components/PreMarketingSlider";
function InterviewModes() {
   const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();
 const fetchDashboard = useCallback(async (signal) => {
    try {
        setLoading(true);
        const clientId = localStorage.getItem("client_id");
        const response = await fetch(
            `${BASE_URL}/api/clients/${clientId}/dashboard`,
            { signal }
        );
        console.log("Status:", response.status);
        const data = await response.json();
        if (signal.aborted) return;
        console.log(data);
        setDashboardData(data);
    } catch (error) {
        if (!signal.aborted) {
            console.error("Dashboard Error:", error);
        }
    } finally {
        if (!signal.aborted) {
            setLoading(false);
        }
    }
}, []);
useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => {
        if (!controller.signal.aborted) {
            fetchDashboard(controller.signal);
        }
    });
    return () => controller.abort();
}, [fetchDashboard]);

  return (
    <div className="min-h-screen bg-[#FDFDFF] px-12 py-12">
      {/*Loader*/}
      {loading && (
        <div className="fixed inset-0 bg-black/40 z-9999 flex items-center justify-center">
          <div className="p-6 flex flex-col items-center gap-3">
            <FiLoader className="animate-spin text-4xl text-green-800" />

            <p className="text-gray-800 font-medium">
              Please wait...
            </p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[48px] font-bold text-[#230804]">
          Choose Interview Mode
        </h1>

        <p className="text-xl text-[#514441] max-w-4xl leading-relaxed">
          Select a specialized environment to begin your session.
          Each mode is powered by custom AI agents tailored for
          specific evaluation criteria.
        </p>
      </div>

      {/* Title */}
      <div className="flex items-center gap-4 mb-8">
        <h3 className="uppercase tracking-[4px] text-xs font-bold text-gray-500">
          Featured Assessment Modes
        </h3>

        <div className="flex-1 h-px bg-gray-300"></div>
      </div>
      {/* Cards */}
      <PreMarketingSlider />
      <div className="grid lg:grid-cols-2 gap-8">
        <ModeCard
          icon={
            <span className="material-symbols-outlined text-[32px] text-[#2d5a27] transition-colors duration-300 group-hover:text-white">
              record_voice_over
            </span>
          }
          title="Self-Introduction Evaluation"
          description="Pitch yourself to AI scouts and receive deep impact scores on communication and presence."
          onBeginAssessment={() => {
            setLoading(true);
            setTimeout(() => {
              navigate("/self-introduction", {
                state: {
                  showBeginAssessmentModal: true,
                },
              });
            }, 500);
          }}
        />

        <ModeCard
          icon={
            <span className="material-symbols-outlined text-[32px] text-[#2d5a27] transition-colors duration-300 group-hover:text-white">
              psychology
            </span>
          }
          title="Topic-Specific Theory"
          description="Deep dive into your specific area of expertise and niche domain skills with domain-expert AI."
          onBeginAssessment={() => {
            setLoading(true);
            setTimeout(() => {
              navigate("/theory-topic");
            }, 500);
          }}
        />

        {/* <ModeCard
          icon={
            <span className="material-symbols-outlined text-[32px] text-[#2d5a27] transition-colors duration-300 group-hover:text-white">
              terminal
            </span>
          }
          title="Code Interview"
          description="Solve algorithmic challenges in a real-time environment with live intelligent execution feedback."
        /> */}
      </div>

      {/* Executive Summary */}
      <div className="mt-10 bg-white rounded-xl border border-[#dee2e6] overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-[#dee2e6]">
          <h4 className="uppercase tracking-[0.15em] text-[11px] sm:text-xs font-semibold text-[#6c757d]">
            Executive Summary
          </h4>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-8 p-4 sm:p-6 lg:p-8">

          {/* Total Interviews */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#6c757d] font-semibold">
              Total Interviews
            </p>

            <div className="flex flex-wrap items-end gap-2 mt-2">
              <h3 className="text-4xl lg:text-5xl font-bold text-[#230804]">
                {dashboardData?.summary?.total_interviews_completed || 0}
              </h3>

              <span className="text-sm text-[#2d5a27] font-semibold">
                {dashboardData?.summary?.total_interviews_completed > 0
                  ? `(${dashboardData?.summary?.total_interviews_completed} completed)`
                  : "(0 completed)"}
              </span>
            </div>
          </div>

          {/* Impact Score */}
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#6c757d] font-semibold">
              Avg. Impact Score
            </p>

            <h3 className="text-4xl lg:text-5xl font-bold text-[#2d5a27] mt-2">
              {dashboardData?.summary?.average_performance_score?.toFixed(2) || 0}%
            </h3>
          </div>

          {/* Mock Session */}
          <div className="bg-[#f8f9fa] border border-[#dee2e6] p-4 lg:p-5 rounded-xl">
            <p className="uppercase text-[11px] tracking-wider text-black/60 font-semibold">
              Next Mockup Session
            </p>

            <h3 className="text-xl lg:text-2xl font-bold mt-2 text-[#230804]">
              {dashboardData?.next_sessions?.mockup?.date_display || "No Session"}
            </h3>

            <p className="text-sm lg:text-base text-black/80 mt-2">
              {dashboardData?.next_sessions?.mockup?.subtitle || "--"}
            </p>
          </div>

          {/* Next Session */}
          <div className="bg-[#230804] text-white p-4 lg:p-5 rounded-xl">
            <p className="uppercase text-[11px] tracking-wider text-white/60 font-semibold">
              Next REAL TIME Session
            </p>

            <h3 className="text-xl lg:text-2xl font-bold mt-2">
              {dashboardData?.next_sessions?.realtime?.date_display || "No Session"}
            </h3>

            <p className="text-sm lg:text-base text-white/80 mt-2">
              {dashboardData?.next_sessions?.realtime?.subtitle || "--"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default InterviewModes;