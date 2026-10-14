import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import axios from "axios";
import BASE_URL from "../config/api";
import { getClientId, getAccessToken } from "../services/authSession";
import { getApiErrorMessage } from "../utils/apiErrorHandler";
import ApiErrorModal from "../components/ApiErrorModal";

function InterviewTable({ interviews = [] }) {
  // Track the loading state while fetching interview insights.
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Retrieve the client ID and authentication token from the current session.
  const clientId = getClientId();
  const token = getAccessToken();

  // Shared API error handling.
  const [apiError, setApiError] = useState(null);
  const [retryAction, setRetryAction] = useState(null);

  const handleViewInsights = async (scorecardId) => {
    setApiError(null);
    setRetryAction(null);

    try {
      // Display the loader before starting the API request.
      setLoading(true);

      // Fetch the selected interview's scorecard using the client ID and scorecard ID.
      const response = await axios.get(
        `${BASE_URL}/api/clients/${clientId}/scorecards/${scorecardId}`,
        {
          // Pass the authentication token to authorize the request.
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Navigate to the performance report and pass the fetched scorecard data.
      navigate("/Interview-Performance-Report", {
        state: {
          scorecard: response.data.scorecard,
          from: "dashboard",
        },
      });
    } catch (error) {
      // Preserve the existing session-expiry flow.
      if (error.response?.status === 401) {
        window.dispatchEvent(new Event("session-expired"));
        return;
      }

      // Display API errors through the shared error handler and modal.
      setApiError({
        title: "Unable to Load Interview Report",
        message: getApiErrorMessage(
          error,
          "Failed to load interview report. Please try again."
        ),
      });

      // Retry the same scorecard request.
      setRetryAction(() => () => handleViewInsights(scorecardId));
    } finally {
      // Stop the loader regardless of whether the request succeeds or fails.
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#dee2e6] shadow-sm overflow-hidden h-full flex flex-col">
      {/* Display a loading overlay while interview insights are being fetched. */}
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
            {/* Render interview records when data is available; otherwise show the empty state. */}
            {interviews.length > 0 ? (
              interviews.map((item, index) => (
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
                        // Extract the scorecard ID from the interview's insights URL.
                        const params = new URLSearchParams(
                          item.insights_url.split("?")[1]
                        );
                        const scorecardId = params.get("scorecard_id");

                        // Fetch the selected scorecard and open its performance report.
                        handleViewInsights(scorecardId);
                      }}
                      className="inline-flex items-center gap-1 text-[#2d5a27] cursor-pointer font-bold text-sm hover:underline"
                    >
                      View Insights
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[#f8f9fa] border border-[#dee2e6] flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-[#6c757d] text-[24px]">
                        assignment
                      </span>
                    </div>

                    <h3 className="text-[16px] font-semibold text-[#230804]">
                      No interviews completed yet
                    </h3>

                    <p className="mt-1 text-[14px] text-[#6c757d]">
                      Complete an interview to see your results and insights here.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Shared API error modal */}
      <ApiErrorModal
        title={apiError?.title || "Something Went Wrong"}
        message={apiError?.message}
        onClose={() => {
          setApiError(null);
          setRetryAction(null);
        }}
        onRetry={retryAction || undefined}
      />
    </div>
  );
}

export default InterviewTable;