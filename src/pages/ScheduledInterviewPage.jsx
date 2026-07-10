import { useEffect, useState } from "react";
import ListView from "../pages/scheduledForYou/ListView";
import CalendarView from "../pages/scheduledForYou/CalendarView";
import axios from "axios";
import BASE_URL from "../config/api";
import { FiLoader, FiSearch, FiX, FiCalendar, FiList } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
const ScheduledInterviews = () => {
    const [view, setView] = useState("list");
    const [data, setData] = useState({
        scheduled_interviews: [],
        pagination: {
            page: 1,
            page_size: 10,
            total_pages: 1,
            total_records: 0,
        },
        next_session: null,
        today_timeline: [],
    });
    const clientId = localStorage.getItem("client_id");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const navigate = useNavigate();
    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "", // success | error
    });

    const interviews = Array.isArray(data.scheduled_interviews)
        ? data.scheduled_interviews
        : Object.values(data.scheduled_interviews || {}).flat();

    const filteredInterviews = interviews.filter((item) => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) return true;

        return (
            (item.title || "").toLowerCase().includes(search) ||
            (item.company_name || "").toLowerCase().includes(search) ||
            (item.interview_type || "").toLowerCase().includes(search) ||
            (item.interview_source || "").toLowerCase().includes(search) ||
            (item.mode || "").toLowerCase().includes(search) ||
            (item.status || "").toLowerCase().includes(search)
        );
    });
    const getScheduledInterviews = async () => {
        try {
            setLoading(true);

            const res = await axios.get(
                `${BASE_URL}/clients/${clientId}/scheduled-interviews`,
                {
                    params: {
                        view,
                        page,
                        page_size: pageSize,
                    },
                }
            );

            setData(res.data);

        } catch (err) {
            console.error(err);

            setPopup({
                show: true,
                type: "error",
                message:
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.response?.data?.detail ||
                    "Failed to start the interview. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (clientId) {
            getScheduledInterviews();
        }
    }, [clientId, view, page, pageSize]);
    const handleStartInterview = async (interview) => {
        try {

            // Realtime interview
            if (interview.interview_source === "realtime") {

                if (interview.meeting_link) {
                    window.open(interview.meeting_link, "_blank", "noopener,noreferrer");
                } else {
                    setPopup({
                        show: true,
                        type: "error",
                        message: "Meeting link is not available.",
                    });
                }

                return;
            }

            setLoading(true);

            const res = await axios.get(
                `${BASE_URL}/api/clients/${clientId}/interviews/${interview.interview_id}/pre-start`
            );

            console.log(res.data);

            navigate("/scheduled-interview-mode", {
                state: {
                    interview,
                    preStartData: res.data,
                },
            });

        } catch (err) {
            console.error(err);

            let errorMessage = "Failed to load scheduled interviews.";

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (
                Array.isArray(err.response?.data?.detail) &&
                err.response.data.detail.length > 0
            ) {
                errorMessage = err.response.data.detail[0].msg;
            } else if (typeof err.response?.data?.detail === "string") {
                errorMessage = err.response.data.detail;
            }

            setPopup({
                show: true,
                type: "error",
                message: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="p-6">
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
            <div className="flex justify-between items-center mb-6">

                <h1 className="text-[48px] font-bold text-[#230804]">
                    Scheduled Interviews
                </h1>
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative w-65">
                        <FiSearch
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            size={16}
                        />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 rounded-full border border-gray-300 bg-white pl-11 pr-11 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            >
                                <FiX size={16} />
                            </button>
                        )}
                    </div>

                    {/* View Toggle */}
                    <div className="flex rounded-lg overflow-hidden border border-gray-300 shadow">

                        <button
                            onClick={() => setView("month")}
                            className={`flex items-center gap-2 px-5 py-2 transition cursor-pointer ${view === "month"
                                ? "bg-gray-300 text-black"
                                : "bg-white"
                                }`}
                        >
                            <FiCalendar size={18} />
                            <span>Calendar</span>
                        </button>

                        <button
                            onClick={() => setView("list")}
                            className={`flex items-center gap-2 px-5 py-2 transition cursor-pointer ${view === "list"
                                ? "bg-gray-300 text-black"
                                : "bg-white"
                                }`}
                        >
                            <FiList size={18} />
                            <span>List</span>
                        </button>

                    </div>
                </div>
            </div>

            {/* Views */}

            {view === "list" ? (

                <ListView
                    interviews={filteredInterviews}
                    pagination={data.pagination}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    onStartInterview={handleStartInterview}
                />

            ) : (

                <CalendarView
                    scheduledInterviews={filteredInterviews}
                    nextSession={data.next_session}
                    todayTimeline={data.today_timeline}
                    onStartInterview={handleStartInterview}
                />

            )}

            {popup.show && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">

                        <p
                            className={`text-lg font-semibold mb-4 ${popup.type === "success"
                                ? "text-green-700"
                                : "text-red-600"
                                }`}
                        >
                            {popup.message}
                        </p>

                        <button
                            onClick={() =>
                                setPopup({
                                    show: false,
                                    message: "",
                                    type: "",
                                })
                            }
                            className="px-5 py-2 bg-green-800 text-white rounded-full hover:bg-green-700"
                        >
                            OK
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduledInterviews;