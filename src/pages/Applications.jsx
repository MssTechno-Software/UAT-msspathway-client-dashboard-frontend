import { useState, useEffect, useCallback } from "react";
import { getClientId } from "../services/authSession";
import {
    FiSearch,
    FiX,
    FiLoader,
} from "react-icons/fi";
import axios from "axios";

import BASE_URL from "../config/api";
import ApiErrorModal from "../components/ApiErrorModal";
import { getApiErrorMessage } from "../utils/apiErrorHandler";
import { getAccessToken } from "../services/authSession";

const API = axios.create({
    baseURL: BASE_URL,
});

// Attach the current session token to GET requests.
API.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Handle unauthorized responses through the existing session flow.
const handleUnauthorized = (error) => {
    if (error?.response?.status === 401) {
        window.dispatchEvent(new Event("session-expired"));
    }
};
function Applications() {
    const client_id = getClientId();

    const [applications, setApplications] = useState([]);
    const [activeTab, setActiveTab] = useState("All");

    const [search, setSearch] = useState("");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [appliedFromDate, setAppliedFromDate] = useState("");
    const [appliedToDate, setAppliedToDate] = useState("");

    const [pageMap, setPageMap] = useState({});

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);

    const [apiError, setApiError] = useState(null);
    const [applicationsLoadFailed, setApplicationsLoadFailed] =
        useState(false);

    const ITEMS_PER_PAGE = 5;

    const platforms = [
        "All",
        "Naukri",
        "LinkedIn",
        "Career Pages",
        "Cold Emails",
        "Other",
    ];

    // FETCH APPLICATIONS - READ ONLY
    const fetchApplications = useCallback(async (signal) => {
        try {
            setLoading(true);
            setApiError(null);
            setApplicationsLoadFailed(false);

            if (!client_id) {
                throw new Error("Client ID not found.");
            }

            const token = getAccessToken();

            if (!token) {
                throw new Error(
                    "Authentication token not found. Please sign in again."
                );
            }

            const response = await API.get(
                `/applications/applications/${client_id}`,
                { signal }
            );

            if (signal?.aborted) return;

            const appsObject = response.data?.applications || {};

            // Convert platform object into a list.
            const allApplications = Object.entries(appsObject).flatMap(
                ([platform, apps]) =>
                    (Array.isArray(apps) ? apps : []).map((app) => ({
                        ...app,
                        platform,
                    }))
            );

            const formatted = allApplications
                .map((app) => ({
                    id: app.id,
                    platform: app.platform,
                    company: app.company_name,
                    role: app.role,
                    date: app.date,
                    link: app.application_link,
                    notes: app.notes,
                    created_at: app.created_at,
                    updated_at: app.updated_at,
                }))
                .sort((a, b) => {
                    const dateA = new Date(
                        a.updated_at || a.created_at || 0
                    );

                    const dateB = new Date(
                        b.updated_at || b.created_at || 0
                    );

                    return dateB - dateA;
                });

            setApplications(formatted);

        } catch (error) {
            if (signal?.aborted) return;

            console.error("Applications API Error:", error);

            handleUnauthorized(error);

            setApplications([]);
            setApplicationsLoadFailed(true);

            setApiError({
                title: "Unable to Load Applications",
                message: getApiErrorMessage(
                    error,
                    "Failed to fetch applications."
                ),
            });

        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, [client_id]);

    // LOAD DATA WHEN PAGE OPENS
    useEffect(() => {
        if (!client_id) {
            setApplicationsLoadFailed(true);
            setApiError({
                title: "Unable to Load Applications",
                message: "Client ID not found.",
            });

            return undefined;
        }

        const controller = new AbortController();

        fetchApplications(controller.signal);

        return () => {
            controller.abort();
        };
    }, [client_id, fetchApplications]);

    // GET PERCENTAGE
    const getPercentage = (count, total) => {
        if (total === 0) return 0;

        return Math.round((count / total) * 100);
    };

    // DATE PARSER
    const parseLocalDate = (dateValue, endOfDay = false) => {
        if (!dateValue) return null;

        if (dateValue instanceof Date) {
            return dateValue;
        }

        let dateStr = String(dateValue).trim();

        if (dateStr.includes("T")) {
            dateStr = dateStr.split("T")[0];
        }

        let year;
        let month;
        let day;

        // YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            [year, month, day] = dateStr
                .split("-")
                .map(Number);
        }

        // DD-MM-YYYY
        else if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
            [day, month, year] = dateStr
                .split("-")
                .map(Number);
        }

        // OTHER DATE FORMATS
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

    // FILTER FOR CARDS - DATE FILTER
    const cardFilteredApps = applications.filter((app) => {
        let matchesDate = true;

        const appDate = parseLocalDate(app.date);

        if (!appDate) {
            matchesDate = false;
        }

        const from = appliedFromDate
            ? parseLocalDate(appliedFromDate)
            : null;

        const to = appliedToDate
            ? parseLocalDate(appliedToDate, true)
            : null;

        if (from && to && appDate) {
            matchesDate =
                appDate.getTime() >= from.getTime() &&
                appDate.getTime() <= to.getTime();
        } else if (from && appDate) {
            matchesDate =
                appDate.getTime() >= from.getTime();
        } else if (to && appDate) {
            matchesDate =
                appDate.getTime() <= to.getTime();
        }

        return matchesDate;
    });

    // FILTER FOR TABLE - SEARCH + TAB + DATE
    const filteredApps = cardFilteredApps.filter((app) => {
        const searchValue = search.toLowerCase().trim();

        const matchesSearch =
            !searchValue ||
            app.company?.toLowerCase().includes(searchValue) ||
            app.role?.toLowerCase().includes(searchValue) ||
            app.platform?.toLowerCase().includes(searchValue);

        const matchesTab =
            activeTab === "All" ||
            app.platform?.toLowerCase() === activeTab.toLowerCase();

        return matchesSearch && matchesTab;
    });

    // PLATFORM COUNTS
    const currentCounts = platforms.reduce((acc, platform) => {
        if (platform === "All") {
            acc[platform] = cardFilteredApps.length;
        } else {
            acc[platform] = cardFilteredApps.filter(
                (app) => app.platform === platform
            ).length;
        }

        return acc;
    }, {});

    // PAGINATION
    const currentPage = pageMap[activeTab] || 1;

    const totalPages = Math.max(
        1,
        Math.ceil(filteredApps.length / ITEMS_PER_PAGE)
    );

    const paginatedApps = filteredApps.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // CHANGE PAGE
    const changePage = (page) => {
        setPageLoading(true);

        setPageMap((previous) => ({
            ...previous,
            [activeTab]: page,
        }));

        setPageLoading(false);
    };

    // RENDER
    return (
        <>
            {/* LOADING */}
            {(loading || pageLoading) && (
                <div className="fixed inset-0 bg-black/40 z-9999 flex items-center justify-center">
                    <div className="p-6 flex flex-col items-center gap-3">
                        <FiLoader className="animate-spin text-4xl text-green-800" />

                        <p className="text-gray-800 font-medium">
                            Please wait...
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-gray-50 w-full px-4 sm:px-6 lg:px-8 py-4">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold">
                        Applications
                    </h1>

                    {/* SEARCH */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full shadow-sm">
                            <div className="relative w-full sm:w-64">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                <input
                                    placeholder="Search applications..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);

                                        setPageMap((previous) => ({
                                            ...previous,
                                            [activeTab]: 1,
                                        }));
                                    }}
                                    className="pl-11 pr-10 rounded-full outline-none placeholder-gray-400 w-full bg-transparent"
                                />

                                {search && (
                                    <FiX
                                        onClick={() => {
                                            setSearch("");
                                            setPageMap((previous) => ({
                                                ...previous,
                                                [activeTab]: 1,
                                            }));
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* PLATFORM CARDS */}
                <div className="grid grid-cols-1 shadow-xs sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 bg-gray-100 p-6 rounded-2xl">

                    {platforms.map((item) => {
                        const current = currentCounts[item] || 0;

                        const totalApplications =
                            cardFilteredApps.length;

                        const percent = getPercentage(
                            current,
                            totalApplications
                        );

                        return (
                            <div
                                key={item}
                                className="bg-white p-5 rounded-2xl hover:shadow-md transition-all"
                            >
                                <div className="flex justify-between items-center">
                                    <p className="text-gray-500 text-sm">
                                        {item}
                                    </p>

                                    <span className="text-sm font-semibold px-2 py-1 rounded-full bg-green-100 text-green-600">
                                        {percent}%
                                    </span>
                                </div>

                                <h2 className="text-3xl font-bold mt-3">
                                    {current}
                                </h2>

                                <div className="mt-3">
                                    <div className="h-10 flex items-end gap-1">
                                        {[4, 6, 5, 8, 7].map((h, i) => (
                                            <div
                                                key={i}
                                                className="w-2 rounded bg-green-300"
                                                style={{
                                                    height: `${h * 4}px`,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* DATE FILTER */}
                <div className="flex flex-col lg:flex-row lg:justify-end lg:items-center gap-3 w-full mt-2">

                    {/* FROM DATE */}
                    <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 bg-white">
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                            From
                        </span>

                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) =>
                                setFromDate(e.target.value)
                            }
                            className="outline-none text-sm"
                        />
                    </div>

                    {/* TO DATE */}
                    <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 bg-white">
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                            To
                        </span>

                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) =>
                                setToDate(e.target.value)
                            }
                            className="outline-none text-sm"
                        />
                    </div>

                    {/* SEARCH BUTTON */}
                    <button
                        onClick={() => {
                            setAppliedFromDate(fromDate);
                            setAppliedToDate(toDate);

                            setPageMap((previous) => ({
                                ...previous,
                                [activeTab]: 1,
                            }));
                        }}
                        className="px-5 py-2 rounded-xl bg-green-800 text-white font-medium hover:bg-green-700 transition cursor-pointer"
                    >
                        Search
                    </button>

                    {/* CLEAR BUTTON */}
                    <button
                        onClick={() => {
                            setFromDate("");
                            setToDate("");
                            setAppliedFromDate("");
                            setAppliedToDate("");
                            setSearch("");
                            setActiveTab("All");
                            setPageMap({ All: 1 });
                        }}
                        className="px-5 py-2 rounded-xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                    >
                        Clear
                    </button>
                </div>

                {/* PLATFORM TABS */}
                <div className="flex gap-6 border-b mb-4 overflow-x-auto mt-6">
                    {platforms.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 whitespace-nowrap ${
                                activeTab === tab
                                    ? "border-b-2 border-green-600 text-green-600"
                                    : "text-gray-500"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* READ-ONLY APPLICATIONS TABLE */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">

                            <thead className="bg-gray-100 text-gray-600">
                                <tr>
                                    <th className="p-4 text-left">
                                        WEBSITE NAME
                                    </th>

                                    <th className="p-4 text-left">
                                        DATE
                                    </th>

                                    <th className="p-4 text-left">
                                        ROLE
                                    </th>

                                    <th className="p-4 text-left">
                                        COMPANY
                                    </th>

                                    <th className="p-4 text-left">
                                        LINK
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {applicationsLoadFailed ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="text-center py-10 text-gray-500"
                                        >
                                            <p>
                                                Unable to load applications.
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() => fetchApplications()}
                                                className="mt-3 px-4 py-2 rounded-lg bg-green-800 text-white hover:bg-green-700 cursor-pointer"
                                            >
                                                Try Again
                                            </button>
                                        </td>
                                    </tr>
                                ) : filteredApps.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="text-center py-10 text-gray-400"
                                        >
                                            No applications found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedApps.map((app) => (
                                        <tr
                                            key={app.id}
                                            className="hover:bg-gray-50 border-b border-gray-100"
                                        >
                                            <td className="p-4 font-medium">
                                                {app.platform}
                                            </td>

                                            <td className="p-4">
                                                {app.date || "-"}
                                            </td>

                                            <td className="p-4">
                                                {app.role || "-"}
                                            </td>

                                            <td className="p-4">
                                                {app.company || "-"}
                                            </td>

                                            <td className="p-4">
                                                {app.link ? (
                                                    <a
                                                        href={app.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-green-700 font-medium cursor-pointer hover:underline"
                                                    >
                                                        View ↗
                                                    </a>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* PAGINATION */}
                        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50 gap-3">

                            {/* LEFT */}
                            <div className="text-sm text-gray-500">
                                Showing {paginatedApps.length} of{" "}
                                {filteredApps.length} applications
                            </div>

                            {/* RIGHT */}
                            <div className="flex items-center gap-2 flex-wrap">

                                {/* FIRST PAGE */}
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => changePage(1)}
                                    className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-40 cursor-pointer"
                                >
                                    {"<<"}
                                </button>

                                {/* PREVIOUS */}
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        changePage(
                                            Math.max(currentPage - 1, 1)
                                        )
                                    }
                                    className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-40 cursor-pointer"
                                >
                                    Previous
                                </button>

                                {/* CURRENT PAGE */}
                                <button
                                    className="bg-green-800 text-white px-4 py-1 rounded font-medium"
                                >
                                    {currentPage}
                                </button>

                                {/* NEXT */}
                                <button
                                    disabled={
                                        currentPage >= totalPages ||
                                        filteredApps.length === 0
                                    }
                                    onClick={() =>
                                        changePage(
                                            Math.min(
                                                currentPage + 1,
                                                totalPages
                                            )
                                        )
                                    }
                                    className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-40 cursor-pointer"
                                >
                                    Next
                                </button>

                                {/* LAST PAGE */}
                                <button
                                    disabled={
                                        currentPage >= totalPages ||
                                        filteredApps.length === 0
                                    }
                                    onClick={() =>
                                        changePage(totalPages)
                                    }
                                    className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-40 cursor-pointer"
                                >
                                    {">>"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* API ERROR MODAL */}
            {apiError && (
                <ApiErrorModal
                    title={apiError.title}
                    message={apiError.message}
                    onRetry={() => {
                        setApiError(null);
                        fetchApplications();
                    }}
                    onClose={() => setApiError(null)}
                />
            )}
        </>
    );
}

export default Applications;
