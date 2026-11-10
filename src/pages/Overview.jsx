import { useCallback, useEffect, useState } from "react";
import { getClientId, getAccessToken } from "../services/authSession";
import { FiPhone, FiMail, FiUser, FiAward, FiLoader } from "react-icons/fi";
import axios from "axios";
import BASE_URL from "../config/api";
import { getApiErrorMessage } from "../utils/apiErrorHandler";

// Use backend messages where available and redirect on expired sessions.
const getOverviewErrorMessage = (error, fallbackMessage) => {
    if (error?.response?.status === 401) {
        window.dispatchEvent(new Event("session-expired"));
    }

    const detail = error?.response?.data?.detail;
    const backendMessage = Array.isArray(detail)
        ? detail.map((item) => item?.msg).filter(Boolean).join(", ")
        : detail;

    return (
        (typeof backendMessage === "string" && backendMessage.trim()) ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        getApiErrorMessage(error, fallbackMessage)
    );
};


export default function Overview() {
    const client_id = getClientId();
    const token = getAccessToken();
    const [applications, setApplications] = useState([]);
    const [reports, setReports] = useState([]);
    const [pipelineCounts, setPipelineCounts] = useState({
        calls_received: 0,
        mails_received: 0,
        l1_interviews: 0,
        l2_interviews: 0,
        offer_letters: 0,
    });
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [appliedFromDate, setAppliedFromDate] = useState("");
    const [appliedToDate, setAppliedToDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [applicationsError, setApplicationsError] = useState("");
    const [reportsError, setReportsError] = useState("");

    // FETCH APPLICATIONS
    const fetchApplications = useCallback(async () => {
        if (!client_id || !token) {
            throw new Error("Client ID or authentication token not found. Please sign in again.");
        }
        try {
            setLoading(true);
            setApplicationsError("");
            const res = await axios.get(
                `${BASE_URL}/applications/applications/${client_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            ); const appsObject = res.data?.applications || {};

            const allApps = Object.entries(appsObject).flatMap(([platform, apps]) =>
                apps.map((app) => ({ ...app, platform }))
            );

            setApplications(allApps);
        } catch (err) {
            setApplicationsError(
                getOverviewErrorMessage(err, "Unable to load applications. Please try again.")
            );
            setApplications([]);
        } finally {
            setLoading(false);
        }
    }, [client_id]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // FETCH REPORTS
    const fetchReports = useCallback(async () => {
        if (!client_id || !token) {
            throw new Error("Client ID or authentication token not found. Please sign in again.");
        }
        try {
            setLoading(true);
            setReportsError("");
            const res = await axios.get(
                `${BASE_URL}/reports/clients/${client_id}/reports`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const responseData = res.data || {};

            setPipelineCounts({
                calls_received: responseData.pipeline_overview?.calls_received || 0,
                mails_received: responseData.pipeline_overview?.mails_received || 0,
                l1_interviews: responseData.pipeline_overview?.l1_interviews || 0,
                l2_interviews: responseData.pipeline_overview?.l2_interviews || 0,
                offer_letters: responseData.pipeline_overview?.offer_letters || 0,
            });

            const data = responseData.company_progression || [];
            setReports(data);
        } catch (err) {
            setReportsError(
                getOverviewErrorMessage(err, "Unable to load recruitment reports. Please try again.")
            );
            setReports([]);
            setPipelineCounts({
                calls_received: 0,
                mails_received: 0,
                l1_interviews: 0,
                l2_interviews: 0,
                offer_letters: 0,
            });
        } finally {
            setLoading(false);
        }
    }, [client_id]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    //filter
    const parseLocalDate = (dateValue, endOfDay = false) => {

        if (!dateValue) return null;

        // ALREADY DATE OBJECT
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

    const filterByDate = (items, dateField) => {
        const from = appliedFromDate
            ? parseLocalDate(appliedFromDate)
            : null;

        const to = appliedToDate
            ? parseLocalDate(appliedToDate, true)
            : null;

        return items.filter((item) => {
            const itemDate = parseLocalDate(item[dateField]);

            if (!itemDate) return false;

            // Both dates
            if (from && to) {
                return (
                    itemDate.getTime() >= from.getTime() &&
                    itemDate.getTime() <= to.getTime()
                );
            }

            // From only
            if (from) {
                return itemDate.getTime() >= from.getTime();
            }

            // To only
            if (to) {
                return itemDate.getTime() <= to.getTime();
            }

            return true;
        });
    };

    const filteredApplications = filterByDate(
        applications,
        "date"
    );

    const filteredReports = filterByDate(
        reports,
        "created_date"
    );

    //APPLICATION PLATFORM COUNTS
    const platforms = ["Naukri", "LinkedIn", "Career Pages", "Cold Emails", "Other"];

    const platformCounts = platforms.map((platform) => ({
        name: platform,
        value: filteredApplications.filter(a => a.platform === platform).length
    }));

    const max = Math.max(...platformCounts.map(p => p.value), 1);

    // FUNNEL LOGIC
    const STAGES = ["Call", "Mail", "L1", "L2", "Offer"];

    const normalizeStage = (stage) => {
        const value = stage?.toLowerCase() || "";

        if (value.includes("call")) return "Call";
        if (value.includes("mail")) return "Mail";
        if (value.includes("l1")) return "L1";
        if (value.includes("l2")) return "L2";
        if (value.includes("offer")) return "Offer";

        return null;
    };

    // CALCULATE COUNTS FROM FILTERED REPORTS
    const filteredCounts = {
        calls_received: 0,
        mails_received: 0,
        l1_interviews: 0,
        l2_interviews: 0,
        offer_letters: 0,
    };

    filteredReports.forEach((company) => {
        const stages = company.stages || [];

        const from = appliedFromDate ? parseLocalDate(appliedFromDate) : null;
        const to = appliedToDate ? parseLocalDate(appliedToDate, true) : null;

        // Filter stages by date if filter is applied
        const dateFilteredStages = stages.filter((stage) => {
            if (!from && !to) return true;
            const stageDate = parseLocalDate(stage.date);
            if (!stageDate) return false;
            if (from && to) return stageDate >= from && stageDate <= to;
            if (from) return stageDate >= from;
            if (to) return stageDate <= to;
            return true;
        });

        // Remove duplicates per stage type
        const uniqueStages = [];
        dateFilteredStages.forEach((stage) => {
            const exists = uniqueStages.some(s => s.stage === stage.stage);
            if (!exists) uniqueStages.push(stage);
        });

        uniqueStages.forEach((stage) => {
            const normalized = normalizeStage(stage.stage);
            switch (normalized) {
                case "Call": filteredCounts.calls_received++; break;
                case "Mail": filteredCounts.mails_received++; break;
                case "L1": filteredCounts.l1_interviews++; break;
                case "L2": filteredCounts.l2_interviews++; break;
                case "Offer": filteredCounts.offer_letters++; break;
                default: break;
            }
        });
    });

    const hasFilter = appliedFromDate || appliedToDate;

    const displayCounts = hasFilter
        ? filteredCounts
        : pipelineCounts;

    const funnel = [
        {
            title: "Calls Received",
            value: displayCounts.calls_received,
            subtitle: "Initial Screening",
            icon: <FiPhone />
        },
        {
            title: "Mails Received",
            value: displayCounts.mails_received,
            subtitle: "Documentation",
            icon: <FiMail />
        },
        {
            title: "L1 Interviews",
            value: displayCounts.l1_interviews,
            subtitle: "Technical Round",
            icon: <FiUser />
        },
        {
            title: "L2 Interviews",
            value: displayCounts.l2_interviews,
            subtitle: "Cultural Fit",
            icon: <FiUser />
        },
        {
            title: "Offer Letters",
            value: displayCounts.offer_letters,
            subtitle: "Final Selection",
            icon: <FiAward />,
            highlight: true
        }
    ];
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
            <div className="p-4 sm:p-6 bg-[#f5f6f8] min-h-screen">

                {/* HEADER */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">

                    <h1 className="text-2xl sm:text-3xl font-bold">
                        Executive Overview
                    </h1>

                    {/* FILTER */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 w-full lg:w-auto">

                        {/* FROM */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">
                                From
                            </span>

                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="text-sm outline-none w-full sm:w-auto"
                            />
                        </div>

                        {/* TO */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">
                                To
                            </span>

                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="text-sm outline-none w-full sm:w-auto"
                            />
                        </div>

                        {/* APPLY */}
                        <button
                            onClick={() => {
                                setAppliedFromDate(fromDate);
                                setAppliedToDate(toDate);
                            }}
                            className="w-full sm:w-auto bg-green-800 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
                        >
                            Search
                        </button>

                        {/* CLEAR */}
                        <button
                            onClick={() => {
                                setFromDate("");
                                setToDate("");
                                setAppliedFromDate("");
                                setAppliedToDate("");
                            }}
                            className="w-full sm:w-auto text-gray-600 text-sm px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

                    {/* LEFT CARD */}
                    <div className="xl:col-span-3 bg-gray-100 p-4 sm:p-6 rounded-3xl shadow-md">

                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold">
                                    Applications by Platform
                                </h2>
                            </div>
                        </div>

                        {applicationsError ? (
                            <div className="flex flex-col items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-6 text-center" role="alert">
                                <p className="text-sm font-semibold text-red-700">Unable to load applications</p>
                                <p className="max-w-xl text-sm text-gray-600">{applicationsError}</p>
                                <button
                                    type="button"
                                    onClick={fetchApplications}
                                    className="mt-1 rounded-lg border border-green-800 px-4 py-2 text-sm font-medium text-green-800 transition hover:bg-green-50"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            platformCounts.map((item, index) => (
                                <div key={index} className="mb-5">
                                    <div className="flex justify-between text-sm sm:text-md mb-1 font-bold gap-3">
                                        <span className="wrap-break-word">{item.name}</span>
                                        <span>{item.value}</span>
                                    </div>

                                    <div className="w-full h-2 bg-[#e2cbb8] rounded-full">
                                        <div
                                            className="h-2 bg-[#3b6b4f] rounded-full"
                                            style={{ width: `${(item.value / max) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* RIGHT CARD */}
                    <div
                        className="xl:col-span-2 relative rounded-3xl p-4 sm:p-6 text-white 
            bg-linear-to-br from-[#3a2418] to-[#2b1a12] 
            shadow-2xl overflow-hidden"
                    >

                        {/* DOT BG */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [bg-size:16px_16px]"></div>

                        <div className="relative z-10">

                            <h2 className="text-lg sm:text-xl font-bold text-white">
                                Recruitment Reports
                            </h2>

                            <div className="space-y-4 pt-3">
                                {reportsError ? (
                                    <div className="flex flex-col items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                                        <p className="text-sm font-semibold text-red-700">Unable to load recruitment reports</p>
                                        <p className="max-w-xl text-sm text-gray-600">{reportsError}</p>
                                        <button
                                            type="button"
                                            onClick={fetchReports}
                                            className="mt-1 rounded-lg border border-green-800 px-4 py-2 text-sm font-medium text-green-800 transition hover:bg-green-50"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : (
                                    funnel.map((item, i) => (
                                        <div
                                            key={i}
                                            className={`p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4
                      ${item.highlight
                                                    ? "bg-linear-to-r from-green-800 to-green-700"
                                                    : "bg-white/5 backdrop-blur-md border border-white/10"
                                                }`}
                                        >
                                            {/* LEFT */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="bg-white/20 p-3 rounded-xl shrink-0">
                                                    {item.icon}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium wrap-break-word">
                                                        {item.title}
                                                    </p>

                                                    <p className="text-xs text-gray-300 wrap-break-word">
                                                        {item.subtitle}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* RIGHT */}
                                            <div className="text-left sm:text-right">
                                                <p className="text-lg sm:text-xl font-semibold">
                                                    {item.value}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}