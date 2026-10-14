import {
    FiSearch,
    FiMapPin,
    FiLoader,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../config/api";
import { getClientId } from "../services/authSession";
import { getApiErrorMessage } from "../utils/apiErrorHandler";
import ApiErrorModal from "../components/ApiErrorModal";

// Main component for the scorecards page.
function ScoreCardPage() {
    const navigate = useNavigate();

    const [scorecards, setScorecards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // fromDate/toDate store only the dates entered by the user.
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [invalidPopup, setInvalidPopup] = useState(false);

    // Applied dates are sent to the API only after clicking Search.
    const [appliedFromDate, setAppliedFromDate] = useState("");
    const [appliedToDate, setAppliedToDate] = useState("");

    // Re-runs the API request even when the filters remain unchanged.
    const [refreshKey, setRefreshKey] = useState(0);

    const [apiError, setApiError] = useState(null);
    const [retryAction, setRetryAction] = useState(null);
    const [listLoadFailed, setListLoadFailed] = useState(false);

    const client_id = getClientId();

    // Fetches scorecards whenever pagination or applied filters change.
    useEffect(() => {
        let cancelled = false;

        const loadScorecards = async () => {
            try {
                const response = await axios.get(
                    `${BASE_URL}/api/clients/${client_id}/scorecards`,
                    {
                        params: {
                            page,
                            page_size: 10,
                            // Empty dates are omitted from the API request.
                            from_date: appliedFromDate || undefined,
                            to_date: appliedToDate || undefined,
                        },
                    }
                );

                if (cancelled) return;

                setScorecards(response.data.scorecards || []);
                setTotalPages(
                    response.data.pagination?.total_pages || 1
                );
                setTotalRecords(
                    response.data.pagination?.total_records || 0
                );

                setListLoadFailed(false);
                setApiError(null);
                setRetryAction(null);
            } catch (error) {
                if (cancelled) return;

                if (error.response?.status === 401) {
                    window.dispatchEvent(new Event("session-expired"));
                    return;
                }

                setListLoadFailed(true);
                setApiError({
                    title: "Unable to Load Scorecards",
                    message: getApiErrorMessage(
                        error,
                        "Unable to load scorecards. Please try again."
                    ),
                });

                // Retry the same page and applied date filters.
                setRetryAction(() => handleRetryScorecards);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadScorecards();

        return () => {
            cancelled = true;
        };
    }, [
        page,
        appliedFromDate,
        appliedToDate,
        refreshKey,
        client_id,
    ]);

    // Retries loading scorecards with the existing filters.
    const handleRetryScorecards = () => {
        setApiError(null);
        setRetryAction(null);
        setListLoadFailed(false);
        setLoading(true);
        setRefreshKey((prev) => prev + 1);
    };

    // Fetches the selected scorecard and opens its detailed report.
    const handleViewInsights = async (scorecardId) => {
        setApiError(null);
        setRetryAction(null);

        try {
            setLoading(true);

            const response = await axios.get(
                `${BASE_URL}/api/clients/${client_id}/scorecards/${scorecardId}`
            );

            // Scorecard data is passed through router state.
            navigate("/Interview-Performance-Report", {
                state: {
                    scorecard: response.data.scorecard,
                    from: "scorecard",
                },
            });
        } catch (error) {
            if (error.response?.status === 401) {
                window.dispatchEvent(new Event("session-expired"));
                return;
            }

            setApiError({
                title: "Unable to Load Interview Report",
                message: getApiErrorMessage(
                    error,
                    "Failed to load interview report. Please try again."
                ),
            });

            // Retry the selected scorecard request.
            setRetryAction(
                () => () => handleViewInsights(scorecardId)
            );
        } finally {
            setLoading(false);
        }
    };

    // Validates date filters and starts a fresh search.
    const handleSearch = () => {
        if (fromDate && toDate && fromDate > toDate) {
            setInvalidPopup(true);
            return;
        }
        setApiError(null);
        setRetryAction(null);
        setListLoadFailed(false);
        setLoading(true);

        // Every new search starts from page 1.
        setPage(1);

        setAppliedFromDate(fromDate);
        setAppliedToDate(toDate);

        // Refresh even if the selected dates are unchanged.
        setRefreshKey((prev) => prev + 1);
    };

    // Clears the date filters and reloads the complete list.
    const handleClearFilters = () => {
        setFromDate("");
        setToDate("");

        setApiError(null);
        setRetryAction(null);
        setListLoadFailed(false);
        setLoading(true);

        setPage(1);
        setAppliedFromDate("");
        setAppliedToDate("");

        setRefreshKey((prev) => prev + 1);
    };

    // Changes the current page and loads its scorecards.
    const handlePageChange = (nextPage) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
            return;
        }

        setApiError(null);
        setRetryAction(null);
        setListLoadFailed(false);
        setLoading(true);
        setPage(nextPage);
    };

    return (
        <div className="bg-[#f8f8f8] min-h-screen p-8">
            {/* Invalid date range popup */}
            {invalidPopup && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
                    <div className="bg-white w-full max-w-xs sm:max-w-[320px] p-5 sm:p-6 rounded-lg shadow-lg text-center">
                        <h3 className="text-lg font-semibold mb-2 text-red-600">
                            Invalid Date Range
                        </h3>

                        <p className="text-gray-600 text-sm wrap-break-word">
                            From Date cannot be greater than To Date.
                        </p>

                        <button
                            type="button"
                            onClick={() => setInvalidPopup(false)}
                            className="mt-5 px-6 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 text-sm cursor-pointer"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {/* Loading indicator */}
            {loading && (
                <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center">
                    <div className="p-6 flex flex-col items-center gap-3">
                        <FiLoader className="animate-spin text-4xl text-green-800" />

                        <p className="text-gray-800 font-medium">
                            Please wait...
                        </p>
                    </div>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-5xl font-bold text-[#1c0d05]">
                    Scorecards
                </h1>

                <p className="text-gray-600 mt-2 leading-7 max-w-xl">
                    Review comprehensive interview performance metrics, AI-driven
                    candidate scoring, and detailed evaluation history.
                </p>
            </div>

            {/* Date filters and actions */}
            <div className="flex justify-end items-center gap-3 mb-6">
                <div className="relative">
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-44 h-10 border border-gray-200 rounded px-3 cursor-pointer"
                    />
                </div>

                <div className="relative">
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-44 h-10 border border-gray-200 rounded px-3 cursor-pointer"
                    />
                </div>

                <button
                    type="button"
                    onClick={handleSearch}
                    className="bg-[#2e5d2d] text-white h-10 px-6 rounded font-medium flex items-center gap-2 cursor-pointer"
                >
                    <FiSearch />
                    Search
                </button>

                <button
                    type="button"
                    onClick={handleClearFilters}
                    className="h-10 px-5 border border-gray-200 rounded bg-white cursor-pointer"
                >
                    Clear
                </button>
            </div>

            {/* Scorecards table and pagination */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-[#230804]">
                        Recent Scorecards
                    </h2>
                </div>

                <table className="w-full">
                    <thead className="text-sm uppercase tracking-wide text-gray-500">
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-4 px-6">
                                Submitted Date
                            </th>

                            <th className="text-left">
                                Interview Mode
                            </th>

                            <th className="text-left">
                                Performance Score
                            </th>

                            <th className="text-left">
                                AI Insights
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {/*
                            Keep the table empty while loading or while
                            the error modal is open. Show the fallback only
                            after the user closes the error modal.
                        */}
                        {loading || apiError ? null : listLoadFailed ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center py-8 text-gray-500"
                                >
                                    <p className="mb-3">
                                        Unable to load scorecards.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleRetryScorecards}
                                        className="px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 text-sm cursor-pointer"
                                    >
                                        Try Again
                                    </button>
                                </td>
                            </tr>
                        ) : scorecards.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center py-8 text-gray-500"
                                >
                                    No scorecards found
                                </td>
                            </tr>
                        ) : (
                            scorecards.map((item) => (
                                <tr
                                    key={item.scorecard_id}
                                    className="border-b border-gray-200 hover:bg-gray-50"
                                >
                                    <td className="px-6 py-7">
                                        {item.submitted_date}
                                    </td>

                                    <td>
                                        <span className="bg-gray-100 px-4 py-1 rounded-full text-[11px] font-semibold">
                                            {item.interview_mode}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="w-40">
                                            <div className="w-full h-2 bg-gray-200 rounded-full">
                                                {/* Bar width represents the score percentage. */}
                                                <div
                                                    className="h-2 rounded-full bg-[#2f6c2f]"
                                                    style={{
                                                        width: `${item.performance_score}%`,
                                                    }}
                                                />
                                            </div>

                                            <p className="mt-2 text-sm font-semibold text-[#2f6c2f]">
                                                {item.performance_score}/100
                                            </p>
                                        </div>
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleViewInsights(item.scorecard_id)
                                            }
                                            className="text-[#2f6c2f] font-semibold text-sm flex items-center gap-2 cursor-pointer"
                                        >
                                            <FiMapPin />
                                            VIEW INSIGHTS & FEEDBACK
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className="flex flex-col md:flex-row gap-3 justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-500">
                        Showing {scorecards.length} of {totalRecords} scorecards
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={page === 1}
                            onClick={() => handlePageChange(1)}
                            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100 cursor-pointer"
                        >
                            {"<<"}
                        </button>

                        <button
                            type="button"
                            disabled={page === 1}
                            onClick={() => handlePageChange(page - 1)}
                            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100 cursor-pointer"
                        >
                            Previous
                        </button>

                        <button
                            type="button"
                            className="bg-[#2f6f2f] text-white px-4 py-1 rounded"
                        >
                            {page}
                        </button>

                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => handlePageChange(page + 1)}
                            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100 cursor-pointer"
                        >
                            Next
                        </button>

                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => handlePageChange(totalPages)}
                            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100 cursor-pointer"
                        >
                            {">>"}
                        </button>
                    </div>
                </div>
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

export default ScoreCardPage;