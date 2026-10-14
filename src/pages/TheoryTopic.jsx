import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import BASE_URL from "../config/api";
import { getClientId } from "../services/authSession";
import { getApiErrorMessage } from "../utils/apiErrorHandler";
import ApiErrorModal from "../components/ApiErrorModal";

function TheoryTopic() {
    // Stores the available topics and the currently selected topic.
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState("");
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const navigate = useNavigate();

    // Read the client ID from the current session.
    const clientId = getClientId();

    // Loads active technologies for this client and selects the first one by default.
    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();

        const loadTechnologies = async () => {
            try {
                setLoading(true);
                setApiError(null);

                const response = await fetch(
                    `${BASE_URL}/Topic_based/clients/${clientId}/technologies`,
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
                        title: "Unable to Load Technologies",
                        message: getApiErrorMessage(
                            { response: { status: response.status } },
                            "Failed to load technologies. Please try again."
                        ),
                        onRetry: () => {
                            setApiError(null);
                            setRetryCount((previousCount) => previousCount + 1);
                        },
                    });

                    return;
                }

                const data = await response.json();

                if (cancelled) return;

                if (data?.technologies) {
                    const activeTopics = data.technologies
                        .filter(
                            (topic) =>
                                topic.status?.toLowerCase() === "active"
                        )
                        .sort(
                            (a, b) =>
                                a.display_order - b.display_order
                        );

                    setTopics(activeTopics);

                    if (activeTopics.length > 0) {
                        setSelectedTopic(
                            activeTopics[0].technology_name
                        );
                    }
                }
            } catch (error) {
                if (cancelled || error.name === "AbortError") return;

                setApiError({
                    title: "Unable to Load Technologies",
                    message: getApiErrorMessage(
                        error,
                        "Failed to load technologies. Please check your connection and try again."
                    ),
                    onRetry: () => {
                        setApiError(null);
                        setRetryCount((previousCount) => previousCount + 1);
                    },
                });
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadTechnologies();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [clientId, retryCount]);

    // Opens the selected topic's sub-topic page on double-click.
    const handleTechnologyDoubleClick = (topic) => {
        navigate("/sub-topic", {
            state: {
                client_id: clientId,
                topic: topic.technology_name,
                technology_id: topic.technology_id,
            },
        });
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Loading overlay while topics are being fetched */}
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

                    <span>Technologies</span>
                </div>
            </div>

            {/* Main topic selection content */}
            <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
                {/* Page heading and description */}
                <div className="mb-10">
                    <h1 className="text-[32px] font-semibold text-[#0B1C30] mb-2">
                        Select Theory Topic
                    </h1>

                    <p className="text-[18px] text-[#514441]">
                        Choose your area of specialized expertise to begin the assessment.
                    </p>
                </div>

                {/* Displays available topics as selectable cards */}
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {topics.map((topic) => (
                        <div
                            key={topic.technology_id}
                            onClick={() =>
                                setSelectedTopic(topic.technology_name)
                            }
                            onDoubleClick={() =>
                                handleTechnologyDoubleClick(topic)
                            }
                            className={`relative bg-white rounded-lg p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 shadow-md
                                ${
                                    selectedTopic === topic.technology_name
                                        ? "border-2 border-[#3B6934]"
                                        : "border border-gray-200"
                                }`}
                        >
                            {selectedTopic === topic.technology_name && (
                                <div className="absolute top-4 right-4 text-[#3B6934]">
                                    <span
                                        className="material-symbols-outlined"
                                        style={{
                                            fontVariationSettings: "'FILL' 1",
                                            fontSize: "22px",
                                        }}
                                    >
                                        check_circle
                                    </span>
                                </div>
                            )}

                            <div
                                className={`w-12 h-12 rounded-md flex items-center justify-center mb-4
                                    ${
                                        selectedTopic === topic.technology_name
                                            ? "bg-[#BCF1AD]"
                                            : "bg-[#EEF4FF]"
                                    }`}
                            >
                                <img
                                    src={topic.icon}
                                    alt={topic.technology_name}
                                    className="w-7 h-7"
                                />
                            </div>

                            <h3 className="text-lg font-semibold text-[#0B1C30] mb-2">
                                {topic.technology_name}
                            </h3>

                            <p className="text-sm text-[#514441] leading-relaxed">
                                {topic.technology_description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Common API error modal */}
            <ApiErrorModal
                title={apiError?.title}
                message={apiError?.message}
                onRetry={apiError?.onRetry}
                onClose={() => setApiError(null)}
            />
        </div>
    );
}

export default TheoryTopic;