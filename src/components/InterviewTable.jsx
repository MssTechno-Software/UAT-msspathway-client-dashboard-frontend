import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import axios from "axios";
import BASE_URL from "../config/api";
function InterviewTable({ interviews = [] }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const clientId = localStorage.getItem("client_id");
  const token = localStorage.getItem("token");
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "", // success | error
  });
  const handleViewInsights = async (scorecardId) => {
    try {
      console.log("Scorecard ID:", scorecardId);
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/api/clients/${clientId}/scorecards/${scorecardId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("API Response:", response.data);
      navigate("/Interview-Performance-Report", {
        state: {
          scorecard: response.data.scorecard,
          from: "dashboard"
        },
      });
    } catch (error) {
      console.error(error);

      setPopup({
        show: true,
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to load interview report.",
      });
    } finally {
      setLoading(false);
    }
  };
  console.log("Interviews:", interviews);
  return (
    <div className="bg-white border border-[#dee2e6] shadow-sm overflow-hidden h-full flex flex-col">
      {/*loader*/}
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
      <div className="px-6 py-5 border-b border-[#dee2e6] flex items-center gap-3">
        <div className="w-10 h-10 shrink-0 bg-green-50 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-[#2d5a27]">
            assignment
          </span>
        </div>

        <h2 className="text-[20px] leading-7 font-bold text-[#230804]">
          Recently Completed Interviews
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#f8f9fa]">
              <th className="px-6 py-4 text-left text-[12px] uppercase tracking-widest font-bold text-[#6c757d]">
                Date
              </th>
              <th className="px-6 py-4 text-left text-[12px] uppercase tracking-widest font-bold text-[#6c757d]">
                Mode
              </th>
              <th className="px-6 py-4 text-left text-[12px] uppercase tracking-widest font-bold text-[#6c757d]">
                Score
              </th>
              <th className="px-6 py-4 text-left text-[12px] uppercase tracking-widest font-bold text-[#6c757d]">
                Insights
              </th>
            </tr>
          </thead>

          <tbody>
            {interviews.map((item, index) => (
              <tr
                key={`${item.date}-${index}`}
                className="border-t border-[#dee2e6] hover:bg-[#f8f9fa] transition-colors"
              >
                <td className="px-6 py-5 font-semibold text-[#230804] text-[16px]">
                  {item.date}
                </td>

                <td className="px-6 py-5 text-[#6c757d] text-[16px]">
                  {item.mode_label}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`
                      px-3 py-1 text-xs font-bold border rounded-sm
                      ${item.score >= 70
                        ? "bg-green-50 text-[#2d5a27] border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                      }
                    `}
                  >
                    {item.score_display}
                  </span>
                </td>

                <td className="px-6 py-5 text-left">
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(
                        item.insights_url.split("?")[1]
                      );
                      const scorecardId = params.get("scorecard_id");
                      handleViewInsights(scorecardId);
                    }}
                    className="inline-flex items-center gap-1 text-[#2d5a27] cursor-pointer font-bold text-sm hover:underline"
                  >
                    View Insights
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InterviewTable;