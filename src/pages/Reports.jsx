import { useState, useEffect, useCallback } from "react";
import CompanyCard from "../components/CompanyCard";
import { FiSearch, FiLoader, FiX } from "react-icons/fi";
import { useParams } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config/api";
import { getAccessToken, getClientId } from "../services/authSession";
import ApiErrorModal from "../components/ApiErrorModal";
import { getApiErrorMessage } from "../utils/apiErrorHandler";

const STAGES = ["Call", "Mail", "Assignment", "L1", "L2", "Offer"];

const normalizeStage = (stage) => {
    const value = stage?.toLowerCase().trim();

    if (value.includes("call")) return "Call";
    if (value.includes("mail")) return "Mail";
    if (value.includes("assignment")) return "Assignment";
    if (value.includes("l1")) return "L1";
    if (value.includes("l2")) return "L2";
    if (value.includes("offer")) return "Offer";

    return "Call";
};

const normalizeStatus = (status) => {
    const value = status?.toLowerCase().trim();

    if (value === "completed" || value === "cleared") return "Cleared";
    if (value === "pending") return "Pending";
    if (value === "rejected") return "Rejected";
    if (value === "skipped") return "Skipped";

    return "Pending";
};

export default function Reports() {
    const [entries, setEntries] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const { client_id: routeClientId } = useParams();
    // Read authentication details from the current tab's session.
    const clientId = routeClientId || getClientId();
    const token = getAccessToken();
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [appliedFromDate, setAppliedFromDate] = useState("");
    const [appliedToDate, setAppliedToDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [counts, setCounts] = useState({
        "Call Received": 0,
        "Mail Received": 0,
        "Assignment": 0,
        "L1 Interview": 0,
        "L2 Interview": 0,
        "Offer Letter": 0,
    });
    const itemsPerPage = 6;

    // Fetch reports using the existing project API and authentication pattern.
    const fetchReports = useCallback(async (signal) => {
        try {
            setLoading(true);
            setLoadError("");
            setShowErrorModal(false);

            const res = await axios.get(
                `${BASE_URL}/reports/clients/${clientId}/reports`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    signal,
                }
            );

            // Ignore responses from requests that have already been cancelled.
            if (signal?.aborted) return false;

            const responseData = res.data || {};

            // PIPELINE OVERVIEW COUNTS
            setCounts({
                "Call Received": responseData.pipeline_overview?.calls_received || 0,
                "Mail Received": responseData.pipeline_overview?.mails_received || 0,
                "L1 Interview": responseData.pipeline_overview?.l1_interviews || 0,
                "L2 Interview": responseData.pipeline_overview?.l2_interviews || 0,
                "Offer Letter": responseData.pipeline_overview?.offer_letters || 0,
            });

            // COMPANY PROGRESSION
            const data = responseData.company_progression || [];
            const formatted = data.map((item) => ({
                company: item.company,
                created_date: item.created_date,
                stages: (item.stages || []).map((stageItem) => ({
                    id: item.report_id,
                    stage: normalizeStage(stageItem.stage),
                    status: normalizeStatus(stageItem.status),
                    date: stageItem.date,
                })),
            }));

            setEntries(formatted);
            return true;
        } catch (error) {
            if (!signal?.aborted) {
                const message = getApiErrorMessage(
                    error,
                    "Unable to load reports. Please try again."
                );

                setEntries([]);
                setLoadError(message);
                setShowErrorModal(true);
            }

            return false;
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, [clientId, token]);

    // Cancel the request when the page unmounts or its dependencies change.
    useEffect(() => {
        if (!clientId) return undefined;

        const controller = new AbortController();
        Promise.resolve().then(() => {
            if (!controller.signal.aborted) {
                fetchReports(controller.signal);
            }
        });

        return () => controller.abort();
    }, [clientId, fetchReports]);

    // Group by company
    const grouped = Object.values(
        entries.reduce((acc, entry) => {
            if (!acc[entry.company]) {
                acc[entry.company] = {
                    company: entry.company,
                    created_date: entry.created_date,
                    stages: [],
                };
            }
            // push actual stage objects
            acc[entry.company].stages.push(...entry.stages);

            // sort stages properly
            acc[entry.company].stages.sort(
                (a, b) => STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage)
            );

            return acc;
        }, {})
    );

    //filter
    const parseLocalDate = (dateValue, endOfDay = false) => {
        if (!dateValue) return null;
        // ALREADY A DATE OBJECT
        if (dateValue instanceof Date) {
            return dateValue;
        }
        // HANDLE STRING
        let dateStr = String(dateValue).trim();

        // REMOVE TIME PART
        if (dateStr.includes("T")) {
            dateStr = dateStr.split("T")[0];
        }

        let year, month, day;

        // YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {

            [year, month, day] =
                dateStr.split("-").map(Number);
        }

        // DD-MM-YYYY
        else if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {

            [day, month, year] =
                dateStr.split("-").map(Number);
        }

        // OTHER FORMATS
        else {
            const tempDate = new Date(dateStr);
            if (isNaN(tempDate.getTime())) {
                return null;
            }

            year = tempDate.getFullYear();
            month = tempDate.getMonth() + 1;
            day = tempDate.getDate();
        }

        return new Date(
            year,
            month - 1,
            day,
            endOfDay ? 23 : 0,
            endOfDay ? 59 : 0,
            endOfDay ? 59 : 0,
            endOfDay ? 999 : 0
        );
    };
    // DATE FILTER ONLY (FOR COUNTS)
    const dateFiltered = grouped.filter((company) => {

        // Use created_date instead of latest stage date
        const reportDate = parseLocalDate(
            company.created_date
        );

        if (!reportDate) {
            return false;
        }

        const from = appliedFromDate
            ? parseLocalDate(appliedFromDate)
            : null;

        const to = appliedToDate
            ? parseLocalDate(appliedToDate, true)
            : null;

        if (from && to) {
            return (
                reportDate.getTime() >= from.getTime() &&
                reportDate.getTime() <= to.getTime()
            );
        }

        if (from) {
            return reportDate.getTime() >= from.getTime();
        }

        if (to) {
            return reportDate.getTime() <= to.getTime();
        }

        return true;
    });

    // SEARCH + DATE FILTER (FOR COMPANY CARDS)
    const filtered = dateFiltered.filter((company) => {

        const searchValue = search.toLowerCase().trim();

        const matchesSearch =
            !searchValue ||
            company.company?.toLowerCase().includes(searchValue);

        return matchesSearch;
    });

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const paginated = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
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
            <div className={`bg-gray-50 min-h-screen p-4 sm:p-6 ${loadError && !loading ? "hidden" : ""}`}>

                {/* TOP HEADER */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-3xl font-bold mb-1">Reports</h2>
                        <p className="text-gray-500">
                            Comprehensive overview of pipeline progression across all active companies.
                        </p>

                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">

                        {/* SEARCH BAR */}
                        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full shadow-sm w-full sm:w-64">
                            <FiSearch className="text-gray-400 mr-2" />
                            <input
                                placeholder="Search companies..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="outline-none"
                            />
                            {/* Clear Button */}
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="ml-2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                                >
                                    <FiX size={18} />
                                </button>
                            )}
                        </div>

                    </div>
                </div>

                {/* PIPELINE OVERVIEW */}
                <div className="mb-6">
                    {/* HEADER + FILTER IN SAME ROW */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5 w-full">

                        {/* LEFT TITLE */}
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <span className="text-green-700">📊</span> Pipeline Overview
                        </h3>

                        {/* RIGHT FILTER */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 lg:w-auto">

                            {/* FROM */}
                            <div className="flex items-center gap-2 sm:pr-5 sm:border-r w-full sm:w-auto">
                                <span className="text-sm font-semibold text-gray-400 uppercase whitespace-nowrap">
                                    From
                                </span>

                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="text-sm text-gray-600 outline-none bg-transparent cursor-pointer w-full sm:w-auto"
                                />
                            </div>

                            {/* TO */}
                            <div className="flex items-center gap-2 sm:px-5 sm:border-r border-gray-200 w-full sm:w-auto">
                                <span className="text-sm font-semibold text-gray-400 uppercase whitespace-nowrap">
                                    To
                                </span>

                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="text-sm text-gray-600 outline-none bg-transparent cursor-pointer w-full sm:w-auto"
                                />
                            </div>

                            {/* BUTTONS */}
                            <div className="sm:pl-5 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">

                                <button
                                    onClick={() => {
                                        setAppliedFromDate(fromDate);
                                        setAppliedToDate(toDate);
                                        setCurrentPage(1);
                                    }}
                                    className="bg-green-800 hover:bg-green-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition w-full sm:w-auto cursor-pointer"
                                >
                                    Search
                                </button>

                                <button
                                    onClick={() => {
                                        setFromDate("");
                                        setToDate("");
                                        setAppliedFromDate("");
                                        setAppliedToDate("");
                                        setCurrentPage(1);
                                    }}
                                    className="border border-gray-200 rounded-xl font-medium text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition px-5 py-2 cursor-pointer w-full sm:w-auto"
                                >
                                    Clear
                                </button>

                            </div>
                        </div>
                    </div>

                    {/* STATS CARDS */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {Object.entries(counts).map(([key, val]) => (
                            <div
                                key={key}
                                className="bg-white p-5 rounded-xl shadow-sm border border-gray-200"
                            >
                                <p className="text-gray-500 text-sm">{key}</p>
                                <h2 className="text-2xl font-bold">{val}</h2>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COMPANY STATUS HEADER */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold">Company Status Progression</h3>

                    <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> Cleared
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Pending
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span> Rejected
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span> Skipped
                        </span>
                    </div>
                </div>

                {/* COMPANY CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginated.map((company) => (
                        <CompanyCard
                            key={company.company}
                            data={company}
                        />

                    ))}
                </div>

                {/* PAGINATION */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">

                    <p className="text-gray-500 text-sm">
                        {filtered.length === 0
                            ? "No data available"
                            : `Showing ${paginated.length} of ${filtered.length} reports`}
                    </p>

                    <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-end text-xs sm:text-sm">

                        {/* FIRST PAGE */}
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded border
                                ${currentPage === 1
                                    ? "text-gray-300 cursor-not-allowed border-gray-200"
                                    : "text-gray-700 hover:bg-gray-100 border-gray-300"
                                }`}
                        >
                            {"<<"}
                        </button>

                        {/* PREVIOUS */}
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded border
                                ${currentPage === 1
                                    ? "text-gray-300 cursor-not-allowed border-gray-200"
                                    : "text-gray-700 hover:bg-gray-100 border-gray-300"
                                }`}
                        >
                            Previous
                        </button>

                        {/* PAGE NUMBERS */}
                        {filtered.length > 0 &&
                            Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded border
                                        ${currentPage === page
                                            ? "bg-green-800 text-white border-green-800"
                                            : "text-gray-700 hover:bg-gray-100 border-gray-300"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                        {/* NEXT */}
                        <button
                            onClick={() =>
                                setCurrentPage(p => Math.min(p + 1, totalPages))
                            }
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded border
                                ${currentPage === totalPages
                                    ? "text-gray-300 cursor-not-allowed border-gray-200"
                                    : "text-gray-700 hover:bg-gray-100 border-gray-300"
                                }`}
                        >
                            Next
                        </button>

                        {/* LAST PAGE */}
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded border
                                ${currentPage === totalPages
                                    ? "text-gray-300 cursor-not-allowed border-gray-200"
                                    : "text-gray-700 hover:bg-gray-100 border-gray-300"
                                }`}
                        >
                            {">>"}
                        </button>
                    </div>
                </div>

            </div>

            {loadError && !loading && (
                <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3 p-6 text-center" role="alert">
                    <div className="w-full max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-red-700">Reports unavailable</h2>
                        <p className="mt-2 text-sm text-gray-600">{loadError}</p>
                        <button
                            type="button"
                            onClick={() => fetchReports()}
                            className="mt-5 rounded-lg bg-green-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {loadError && showErrorModal && (
                <ApiErrorModal
                    title="Unable to Load Reports"
                    message={loadError}
                    onRetry={() => window.location.reload()}
                    onClose={() => setShowErrorModal(false)}
                />
            )}
        </>
    );
}