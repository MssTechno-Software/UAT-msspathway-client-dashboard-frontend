import { useState, useEffect } from "react";
import { FiLoader } from "react-icons/fi";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import BASE_URL from "../config/api";

function SubTopic() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { state } = useLocation();
    const [subTopics, setSubTopics] = useState([]);
    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "",
    });

    const [selectedSubTopic, setSelectedSubTopic] = useState(null);

    const topic = state?.topic || "";
    const technology_id = state?.technology_id;
    const client_id = state?.client_id;

    /*get subtopics bt technology_id*/

    useEffect(() => {
        let cancelled = false;

        const loadSubTopics = async () => {
            await Promise.resolve();

            if (cancelled || !technology_id) return;

            setLoading(true);

            try {
                const response = await fetch(
                    `${BASE_URL}/Topic_based/clients/${client_id}/technologies/${technology_id}/subtopics`
                );

                const data = await response.json();

                if (cancelled) return;

                if (data?.subtopics) {
                    const sortedSubTopics = [...data.subtopics].sort(
                        (a, b) => a.display_order - b.display_order
                    );

                    setSubTopics(sortedSubTopics);
                }
            } catch (error) {
                if (cancelled) return;

                console.log("Error in fetching the data:", error);

                setPopup({
                    show: true,
                    message:
                        error.message ||
                        error.detail ||
                        "Failed to load subtopics",
                    type: "error",
                });
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        if (technology_id) {
            loadSubTopics();
        }

        return () => {
            cancelled = true;
        };
    }, [client_id, technology_id]);

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

    /*Progress*/
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

    return (
        <div className="bg-white min-h-screen">
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

            <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
                <div className="mb-10">
                    <button
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                    {subTopics.map((item) => (
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

                            <div className="mt-5">
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold text-sm">
                                        Progress
                                    </span>

                                    <span
                                        className={`font-semibold text-sm ${getProgressColor(item.progress_status).text}`}
                                    >
                                        {item.progress_percentage}%
                                    </span>
                                </div>

                                <div className="h-1.5 bg-[#dce6f7] rounded-full">
                                    <div
                                        className={`h-full rounded-full ${getProgressColor(item.progress_status).bar}`}
                                        style={{
                                            width: `${item.progress_percentage}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {popup.show && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-2">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
                        <p
                            className={`text-lg font-semibold mb-4 ${popup.type === "success"
                                ? "text-green-800"
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
                            className="px-4 py-2 bg-green-800 text-white rounded-full hover:bg-green-700"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SubTopic;