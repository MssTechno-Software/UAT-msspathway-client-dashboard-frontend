import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import { CheckCircle, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import BASE_URL from "../config/api";
import { getClientId } from "../services/authSession";
import { getApiErrorMessage } from "../utils/apiErrorHandler";
import ApiErrorModal from "../components/ApiErrorModal";

function SubTopic() {
// Stores subtopics and the currently selected subtopic.
    const [loading, setLoading] = useState(false);
    const [subTopics, setSubTopics] = useState([]);
    const [selectedSubTopic, setSelectedSubTopic] = useState(null);
    const [apiError, setApiError] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [hasLoadFailed, setHasLoadFailed] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    const navigate = useNavigate();
    const { state } = useLocation();

    // Read the client ID from route state or the current session.
    const topic = state?.topic || "";
    const technology_id = state?.technology_id;
    const client_id = state?.client_id || getClientId();

    // Load subtopics for the selected technology.
    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();

        const loadSubTopics = async () => {
            if (!client_id || !technology_id) {
                setApiError({
                    title: "Subtopic Information Unavailable",
                    message:
                        "Technology information is missing. Return to Technologies and select a topic again.",
                });
                setHasLoadFailed(true);
                setShowErrorModal(true);
                setLoading(false);
                return;
            }

            setLoading(true);
            setApiError(null);
            setShowErrorModal(false);
            setHasLoadFailed(false);

            try {
                const response = await fetch(
                    `${BASE_URL}/Topic_based/clients/${client_id}/technologies/${technology_id}/subtopics`,
                    {
                        signal: controller.signal,
                    }
                );

                if (cancelled) return;

                // Preserve the existing session-expiry flow.
                if (response.status === 401) {
                    window.dispatchEvent(new Event("session-expired"));
                    return;
                }

                // Handle HTTP errors through the common error handler.
                if (!response.ok) {
                    setApiError({
                        title: "Unable to Load Subtopics",
                        message: getApiErrorMessage(
                            { response: { status: response.status } },
                            "Failed to load subtopics. Please try again."
                        ),
                    });
                    setHasLoadFailed(true);
                    setShowErrorModal(true);
                    return;
                }

                const data = await response.json();

                if (cancelled) return;

                if (!Array.isArray(data?.subtopics)) {
                    setApiError({
                        title: "Unable to Load Subtopics",
                        message:
                            "The server returned an unexpected response. Please try again.",
                    });
                    setHasLoadFailed(true);
                    setShowErrorModal(true);
                    return;
                }

                // Keep the existing display order.
                const sortedSubTopics = [...data.subtopics].sort(
                    (a, b) => a.display_order - b.display_order
                );

                setSubTopics(sortedSubTopics);
                setSelectedSubTopic(null);
                setHasLoadFailed(false);
            } catch (error) {
                if (cancelled || error.name === "AbortError") return;

                setApiError({
                    title: "Unable to Load Subtopics",
                    message: getApiErrorMessage(
                        error,
                        "Failed to load subtopics. Please check your connection and try again."
                    ),
                });
                setHasLoadFailed(true);
                setShowErrorModal(true);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadSubTopics();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [client_id, technology_id, retryCount]);

    // Retry the subtopics request.
    const handleRetry = () => {
        setShowErrorModal(false);
        setApiError(null);
        setHasLoadFailed(false);
        setLoading(true);
        setRetryCount((previousCount) => previousCount + 1);
    };

    // Open the selected subtopic's interview setup page on double-click.
    const handleSubTopicDoubleClick = (item) => {
        navigate("/theory-interview-start-module", {
            state: {
                topic,
                subTopic: item.subtopic_name,
                subtopic_id: item.subtopic_id,
                technology_id,
                client_id,
            },
        });
    };

    // Return progress colors based on status.
    const getProgressColor = (status) => {
        switch (status?.toLowerCase()) {
            case "red":
                return {
                    text: "text-red-600",
                    bar: "bg-red-500",
                };

            case "yellow":
                return {
                    text: "text-yellow-600",
                    bar: "bg-yellow-500",
                };

            case "green":
                return {
                    text: "text-[#3b6934]",
                    bar: "bg-[#3b6934]",
                };

            default:
                return {
                    text: "text-gray-500",
                    bar: "bg-gray-400",
                };
        }
    };

    // Show fallback only after a failed request and after closing the error modal.
    if (
        hasLoadFailed &&
        !loading &&
        !showErrorModal &&
        subTopics.length === 0
    ) {
        return (
            <div className="bg-white min-h-screen">
                {/* Breadcrumb navigation */}
                <div className="h-auto min-h-16 border-b border-[#d5c2bf] flex items-center px-4 sm:px-6 lg:px-12 py-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold uppercase text-[#514441]">
                        <span
                            onClick={() => navigate("/interview-modes")}
                            className="cursor-pointer hover:text-[#3b6934]"
                        >
                            Interview Modes
                        </span>

                        <span>›</span>

                        <span
                            onClick={() => navigate("/theory-topic")}
                            className="cursor-pointer hover:text-[#3b6934]"
                        >
                            Technologies
                        </span>

                        <span>›</span>
                        <span>{topic}</span>
                    </div>
                </div>

                {/* Fallback UI: shown only after closing the error popup. */}
                <div className="min-h-[65vh] flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-lg rounded-2xl border border-[#e7dbd6] bg-white px-6 py-10 sm:px-10 text-center shadow-sm">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#eff4ff]">
                            <AlertCircle
                                size={32}
                                className="text-[#3b6934]"
                            />
                        </div>

                        <p className="mb-3 text-xs font-bold uppercase tracking-[2px] text-[#3b6934]">
                            Technical Assessment
                        </p>

                        <h1 className="text-2xl sm:text-3xl font-bold text-[#0B1C30]">
                            Unable to Load Subtopics
                        </h1>

                        <p className="mt-4 text-sm sm:text-base leading-7 text-[#514441]">
                            Your selected technology is saved, but its subtopics
                            could not be loaded. Please retry or return to the
                            technology list.
                        </p>

                        {/* Retry loading */}
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="mt-7 w-full rounded-xl bg-[#3b6934] px-6 py-4 font-bold uppercase text-white transition hover:bg-[#2f5a29]"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <RefreshCw size={18} />
                                Retry Loading Subtopics
                            </span>
                        </button>

                        {/* Return to technology selection */}
                        <button
                            type="button"
                            onClick={() => navigate("/theory-topic")}
                            className="mt-3 w-full rounded-xl border border-[#d5c2bf] px-6 py-3 font-semibold uppercase text-[#514441] transition hover:bg-[#f8f9ff]"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <ArrowLeft size={18} />
                                Back to Technologies
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Existing loader: shown while loading or retrying. */}
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

            {/* Breadcrumb */}
            <div className="h-auto min-h-16 border-b border-[#d5c2bf] flex items-center px-4 sm:px-6 lg:px-12 py-4">
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold uppercase text-[#514441]">
                    <span
                        onClick={() => navigate("/interview-modes")}
                        className="cursor-pointer hover:text-[#3b6934]"
                    >
                        Interview Modes
                    </span>

                    <span>›</span>

                    <span
                        onClick={() => navigate("/theory-topic")}
                        className="cursor-pointer hover:text-[#3b6934]"
                    >
                        Technologies
                    </span>

                    <span>›</span>

                    <span>{topic}</span>
                </div>
            </div>

            {/* Main content */}
            <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
                <div className="mb-10">
                    <button
                        type="button"
                        onClick={() => {
                            setLoading(true);

                            setTimeout(() => {
                                navigate(-1);
                            }, 500);
                        }}
                        className="inline-flex items-center gap-2 mb-6 text-sm font-semibold text-[#514441] uppercase cursor-pointer hover:text-[#3b6934] transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Change Topic
                    </button>

                    <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-semibold text-[#0B1C30]">
                        Refine Your Focus
                    </h1>

                    <p className="mt-2 text-sm sm:text-base lg:text-lg text-[#514441] max-w-3xl">
                        Select a specific area of expertise to tailor your technical interview.
                        This ensures the assessment precisely matches the candidate's core
                        technical competencies.
                    </p>
                </div>

                {/* Existing subtopic cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {!loading && !hasLoadFailed && subTopics.length === 0 ? (
                        <div className="col-span-1 md:col-span-2 rounded-xl border border-[#d5c2bf] bg-white px-6 py-10 text-center">
                            <AlertCircle
                                size={32}
                                className="mx-auto mb-4  text-red-600"
                            />
                            <h3 className="text-lg font-semibold text-[#0B1C30]">
                                No Subtopics Available
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-[#514441]">
                                No subtopics are available for this technology right now.
                                Please select another technology or try again later.
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate("/theory-topic")}
                                className="mt-5 cursor-pointer rounded-xl bg-[#3b6934] px-5 py-3 font-semibold text-white transition hover:bg-[#2f5a29]"
                            >
                                Back to Technologies
                            </button>
                        </div>
                    ) : (
                        subTopics.map((item) => (
                            <div
                                key={item.subtopic_id}
                                onClick={() => setSelectedSubTopic(item)}
                                onDoubleClick={() => handleSubTopicDoubleClick(item)}
                                className={`cursor-pointer rounded-xl border p-4 sm:p-5 lg:p-6 transition-all hover:shadow-md
                                ${selectedSubTopic?.subtopic_id === item.subtopic_id
                                        ? "bg-[#eff4ff] border-[#3b6934]"
                                        : "bg-white border-[#d5c2bf]"
                                    }`}
                            >
                                <div className="w-10 h-10 bg-[#eff4ff] rounded flex items-center justify-center text-[#3b6934]">
                                    <img
                                        src={item.icon}
                                        alt={item.subtopic_name}
                                        className="w-6 h-6"
                                    />
                                </div>

                                <h3 className="font-semibold text-lg sm:text-xl mt-4 flex items-center gap-2">
                                    {item.subtopic_name}

                                    {item.is_completed && (
                                        <CheckCircle
                                            size={18}
                                            className="text-[#3b6934]"
                                        />
                                    )}
                                </h3>

                                <p className="text-sm sm:text-base text-[#514441] mt-3 leading-relaxed">
                                    {item.subtopic_description}
                                </p>

                                {/* Progress */}
                                <div className="mt-5">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold text-sm">
                                            Progress
                                        </span>

                                        <span
                                            className={`font-semibold text-sm ${getProgressColor(item.progress_status).text
                                                }`}
                                        >
                                            {item.progress_percentage}%
                                        </span>
                                    </div>

                                    <div className="h-1.5 bg-[#dce6f7] rounded-full">
                                        <div
                                            className={`h-full rounded-full ${getProgressColor(item.progress_status).bar
                                                }`}
                                            style={{
                                                width: `${item.progress_percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )))}
                </div>
            </div>

            {/* Error popup overlays the original page; fallback remains hidden behind it. */}
            {showErrorModal && apiError && (
                <ApiErrorModal
                    title={apiError.title}
                    message={apiError.message}
                    onRetry={
                        client_id && technology_id
                            ? handleRetry
                            : undefined
                    }
                    onClose={() => setShowErrorModal(false)}
                />
            )}
        </div>
    );
}

export default SubTopic;