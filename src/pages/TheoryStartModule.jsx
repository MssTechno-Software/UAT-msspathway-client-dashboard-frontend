import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import { ArrowLeft } from "lucide-react";

function TheoryStartModule() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const topic = state?.topic || "";
    const subTopic = state?.subTopic || "";
    const technology_id = state?.technology_id;
    const subtopic_id = state?.subtopic_id;
    const client_id = localStorage.getItem("client_id");

    console.log(topic);
    console.log(subTopic);

    const [loading, setLoading] = useState(false);
    const [difficulty, setDifficulty] = useState("Easy");

    return (
        <div className="bg-[#f8f9ff] min-h-screen">

            {/* Loader */}
            {loading && (
                <div className="fixed inset-0 bg-black/40 z-9999 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <FiLoader className="animate-spin text-4xl text-green-800" />
                        <p>Please wait...</p>
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
                    <span>›</span>
                    <span className="text-[#3b6934]">
                        {subTopic}
                    </span>
                </div>
            </div>

            <div className="p-12">
                <button
                    onClick={() => {
                        setLoading(true);

                        setTimeout(() => {
                            navigate("/sub-topic", {
                                state: {
                                    client_id,
                                    technology_id,
                                    topic,
                                },
                            });
                        }, 500);
                    }}
                    className="inline-flex items-center gap-2 mb-6 text-sm font-semibold text-[#514441] uppercase cursor-pointer hover:text-[#3b6934] transition-colors"
                >
                    <ArrowLeft size={18} />
                    Change Sub Topic
                </button>
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-[40px] font-semibold text-[#0B1C30]">
                        {subTopic}
                    </h1>

                    <p className="text-[#514441] mt-2">
                        Tailor the assessment difficulty and duration to match the executive level of the applicant.
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">

                    {/* LEFT */}
                    <div className="lg:col-span-8">

                        <div className="bg-white border border-[#d5c2bf] rounded-xl p-6">

                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-[#3b6934]">
                                    psychology
                                </span>

                                <h3 className="font-semibold">
                                    Select Difficulty
                                </h3>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">

                                {/* Easy */}
                                <div
                                    onClick={() => setDifficulty("Easy")}
                                    className={`cursor-pointer border rounded-lg p-5 transition
                                        ${difficulty === "Easy"
                                            ? "border-2 border-[#3b6934] bg-[#eff4ff]"
                                            : "border-[#d5c2bf] hover:border-[#3b6934]"
                                        }`}
                                >
                                    <div className="flex justify-between mb-4">
                                        <span className="material-symbols-outlined text-[#3b6934]">
                                            sentiment_satisfied
                                        </span>

                                        {difficulty === "Easy" && (
                                            <span className="material-symbols-outlined text-[#3b6934]">
                                                check_circle
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-[#3b6934]">Easy</h3>

                                    <p className="text-sm text-[#514441] mt-2">
                                        Entry-level focus, standard questions.
                                    </p>
                                </div>

                                {/* Medium */}
                                <div
                                    onClick={() => setDifficulty("Medium")}
                                    className={`cursor-pointer border rounded-lg p-5 transition
                                        ${difficulty === "Medium"
                                            ? "border-2 border-[#3b6934] bg-[#eff4ff]"
                                            : "border-[#d5c2bf] hover:border-[#3b6934]"
                                        }`}
                                >
                                    <div className="flex justify-between mb-4">
                                        <span className="material-symbols-outlined text-[#3b6934]">
                                            equalizer
                                        </span>

                                        {difficulty === "Medium" && (
                                            <span className="material-symbols-outlined text-[#3b6934]">
                                                check_circle
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-[#3b6934]">
                                        Medium
                                    </h3>

                                    <p className="text-sm text-[#514441] mt-2">
                                        Professional assessment with intermediate difficulty.
                                    </p>
                                </div>

                                {/* Hard */}
                                <div
                                    onClick={() => setDifficulty("Hard")}
                                    className={`cursor-pointer border rounded-lg p-5 transition
                                        ${difficulty === "Hard"
                                            ? "border-2 border-[#3b6934] bg-[#eff4ff]"
                                            : "border-[#d5c2bf] hover:border-[#3b6934]"
                                        }`}
                                >
                                    <div className="flex justify-between mb-4">
                                        <span className="material-symbols-outlined text-[#3b6934]">
                                            bolt
                                        </span>

                                        {difficulty === "Hard" && (
                                            <span className="material-symbols-outlined text-[#3b6934]">
                                                check_circle
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-[#3b6934]">
                                        Hard
                                    </h3>

                                    <p className="text-sm text-[#514441] mt-2">
                                        Advanced interview with complex technical questions.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="lg:col-span-4">

                        <div className="bg-white border border-[#d5c2bf] rounded-xl p-6">

                            <h3 className="font-semibold mb-5">
                                Environment Preview
                            </h3>

                            <div className="relative w-full h-56 overflow-hidden rounded-lg">
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDy8mY4x9bAwlXONIEjO2lz6JnpfBxga_PH_aJZpauK8XAAbbB4P7MNbN-kIub0GqnEXYmQRY8A7YRy_wGl6ug0Pz_NN6-MCSsauobw8jNmhPtQGiMvuhCFWIB4OpfOfm2Y-PVnrTuFBmM3SMOnCrDO1BVnnlZuHhVe0K6-4Z4qw_aXq6_8Be0QubTJxAyyxHxykpAsCrpkwdRk1Skj8kcy623Lzuv2BXlA6DWebdP-DhodYhPMdDdkfg4IoYy7rd1v5Q62TfAOtI-B"
                                    alt="Interview Preview"
                                    className="w-full h-full object-cover grayscale opacity-70"
                                />

                                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>

                                        <span className="text-white text-xs uppercase tracking-wider font-semibold">
                                            AI System Ready
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#eff4ff] p-4 rounded-lg mt-4">
                                <p className="italic text-center text-sm text-[#514441]">
                                    "The system is configured for an entry-level
                                    professional assessment with standard
                                    behavioral metrics."
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setLoading(true);

                                    setTimeout(() => {
                                        navigate("/theory-interview", {
                                            state: {
                                                client_id,
                                                technology_id,
                                                subtopic_id,
                                                difficulty_level: difficulty.toLowerCase(),
                                                topic,
                                                subTopic,
                                            },
                                        });
                                    }, 500);
                                }}
                                className="w-full mt-5 bg-[#3b6934] text-white py-4 rounded-xl font-bold uppercase cursor-pointer"
                            >
                                Start Interview
                            </button>

                            <button
                                onClick={() => navigate(-1)}
                                className="w-full mt-4 border border-[#d5c2bf] py-3 rounded-lg uppercase text-[#514441] cursor-pointer"
                            >
                                Cancel Assessment
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TheoryStartModule;