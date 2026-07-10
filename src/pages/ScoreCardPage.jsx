import {
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
    FiSearch,
    FiMapPin,
    FiLoader,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../config/api";
function ScoreCardPage() {
    const navigate = useNavigate();
    const [scorecards, setScorecards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const client_id = localStorage.getItem("client_id");

    const getScorecards = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${BASE_URL}/api/clients/${client_id}/scorecards`,
                {
                    params: {
                        page,
                        page_size: 10,
                        from_date: fromDate || undefined,
                        to_date: toDate || undefined,
                    },
                }
            );

            setScorecards(response.data.scorecards);
            setTotalPages(response.data.pagination.total_pages);
            setTotalRecords(response.data.pagination.total_records);
        } catch (error) {
            console.error(error);

            setPopup({
                show: true,
                type: "error",
                message:
                    error.response?.data?.message ||
                    "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getScorecards(page, fromDate, toDate);
    }, [page]);

    const handleViewInsights = async (scorecardId) => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${BASE_URL}/api/clients/${client_id}/scorecards/${scorecardId}`
            );

            navigate("/Interview-Performance-Report", {
                state: {
                    scorecard: response.data.scorecard,
                    from: "scorecard"
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

    return (
        <div className="bg-[#f8f8f8] min-h-screen p-8">
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
            <div className="mb-8">
                <h1 className="text-5xl font-bold text-[#1c0d05]">Scorecards</h1>

                <p className="text-gray-600 mt-2 leading-7 max-w-xl">
                    Review comprehensive interview performance metrics, AI-driven
                    candidate scoring, and detailed evaluation history.
                </p>
            </div>

            {/* Filters */}
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
                    onClick={() => {
                        if (fromDate && toDate && fromDate > toDate) {
                            setPopup({
                                show: true,
                                type: "error",
                                message: "From Date cannot be greater than To Date.",
                            });
                            return;
                        }
                        setPage(1);
                        getScorecards(1, fromDate, toDate);
                    }}
                    className="bg-[#2e5d2d] text-white h-10 px-6 rounded font-medium flex items-center gap-2 cursor-pointer"
                >
                    <FiSearch />
                    Search
                </button>

                <button
                    onClick={() => {
                        setFromDate("");
                        setToDate("");
                        setPage(1);
                        getScorecards();
                    }}
                    className="h-10 px-5 border border-gray-200 rounded bg-white cursor-pointer"
                >
                    Clear
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Top */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-[#230804]">
                        Recent Scorecards
                    </h2>
                </div>

                {/* Table */}
                <table className="w-full">
                    <thead className="text-sm uppercase tracking-wide text-gray-500">
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-4 px-6">Submitted Date</th>
                            <th className="text-left">Interview Mode</th>
                            <th className="text-left">Performance Score</th>
                            <th className="text-left">AI Insights</th>
                        </tr>
                    </thead>

                    <tbody>
                        {scorecards.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500">
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
                                            onClick={() => handleViewInsights(item.scorecard_id)}
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

                {/* Footer */}
                <div className="flex flex-col md:flex-row gap-3 justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-500">
                        Showing {scorecards.length} of {totalRecords} scorecards
                    </div>
                    <div className="flex items-center gap-2">
                        {/* First Page */}
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(1)}
                            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100 cursor-pointer"
                        >
                            {"<<"}
                        </button>
                        {/* Previous */}
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100 cursor-pointer"
                        >
                            Previous
                        </button>
                        {/* Current Page */}
                        <button className="bg-[#2f6f2f] text-white px-4 py-1 rounded">
                            {page}
                        </button>
                        {/* Next */}
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100 cursor-pointer"
                        >
                            Next
                        </button>
                        {/* Last Page */}
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(totalPages)}
                            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100 cursor-pointer"
                        >
                            {">>"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ScoreCardPage;