import {
    RefreshCw,
    ArrowRight,
    CheckCircle,
    TrendingUp,
    Lightbulb,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Check } from "lucide-react";
import { FiLoader } from "react-icons/fi";

function TheoryFeedbackPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const topic = location.state?.topic || "";
    const subTopic = location.state?.subTopic || "";
    const feedbackData = location.state?.feedbackData;
    const transcript = location.state?.transcript;
    const question = location.state?.question;
    const currentQuestionIndex = location.state?.currentQuestionIndex;
    const questions = location.state?.questions;
    const [loading, setLoading] = useState(false);
    const client_id = location.state?.client_id;
    const technology_id = location.state?.technology_id;
    const subtopic_id = location.state?.subtopic_id;
    const difficulty_level = location.state?.difficulty_level;
    if (!feedbackData) {
        navigate("/theory-interview");
        return null;
    }

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
            {/* Header */}
            <div className="min-h-16 border-b border-[#d5c2bf] flex items-center px-4 sm:px-6 lg:px-12 py-4">
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
                    <span>
                        {topic}
                    </span>
                    <span>›</span>
                    <span className="text-[#3b6934]">
                        {subTopic}
                    </span>
                    <span>
                        Question {(currentQuestionIndex ?? 0) + 1}
                    </span>
                    <span>›</span>
                    <span className="text-[#3b6934]">
                        Feedback
                    </span>
                </div>
            </div>

            {/* Question Stepper */}
            <div className="px-4 sm:px-6 lg:px-12 mt-6">
                <div className="bg-white border border-[#e7dbd6] rounded-xl px-5 py-4 shadow-sm">

                    <div className="flex items-center">

                        {/* Previous */}
                        <button
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6b5f5b] hover:bg-gray-100 transition"
                        >
                            &#8249;
                        </button>

                        {/* Steps */}
                        <div className="flex-1 flex items-center px-3">

                            {questions?.map((_, index) => (
                                <div
                                    key={index}
                                    className="flex items-center flex-1 last:flex-none"
                                >
                                    <div
                                        className={`
                                            relative z-10
                                            w-7.5 h-7.5 rounded-xl
                                            flex items-center justify-center
                                            text-xs font-semibold
                                            transition-all duration-300
                                            ${questions[index]?.attempted_status === "completed"
                                                ? "bg-[#3b6934] text-white"
                                                : questions[index]?.attempted_status === "current"
                                                    ? "bg-green-100 border-2 border-[#3b6934] text-[#3b6934]"
                                                    : questions[index]?.attempted_status === "skipped"
                                                        ? "bg-red-100 border-2 border-red-500 text-red-500"
                                                        : "bg-white border border-[#dddddd] text-[#bcbcbc]"
                                            }
                                        `}
                                    >
                                        {index + 1}
                                        {questions[index]?.attempted_status === "completed" && (
                                            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#3b6934] flex items-center justify-center shadow-sm">
                                                <Check
                                                    size={10}
                                                    strokeWidth={3}
                                                    className="text-[#3b6934]"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {index !== questions.length - 1 && (
                                        <div className="flex-1 px-3">
                                            <div className="relative h-0.5 bg-[#ececec]">
                                                <div
                                                    className={`absolute left-0 top-0 h-full transition-all duration-300 ${index < currentQuestionIndex
                                                        ? "w-full bg-[#97b78c]"
                                                        : "w-0"
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                        </div>

                        {/* Next */}
                        <button
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#756965] hover:bg-gray-100 disabled:opacity-40"
                        >
                            &#8250;
                        </button>

                    </div>

                </div>
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 lg:px-12 py-6 lg:py-12">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">

                    {/* LEFT SIDE */}
                    <div className="xl:col-span-7 flex flex-col">

                        <div className="bg-gray-50 border border-[#d5c2bf] rounded-xl p-4 sm:p-6 lg:p-8 flex flex-col xl:min-h-162.5">

                            {/* Score Card */}
                            <div className="shadow-sm rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">

                                <div>
                                    <p className="uppercase font-bold text-[#514441] text-md mb-3">
                                        Overall Score
                                    </p>

                                    <div className="flex items-center gap-3">
                                        <CheckCircle
                                            size={32}
                                            className="text-[#3b6934]"
                                        />
                                        <span className="text-2xl font-bold text-[#3b6934]">
                                            {feedbackData?.evaluation?.overall_score}/100
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setLoading(true);
                                        setTimeout(() => {
                                            navigate("/theory-interview", {
                                                state: {
                                                    questions,
                                                    nextQuestionIndex: currentQuestionIndex,
                                                    topic,
                                                    subTopic,
                                                    client_id,
                                                    technology_id,
                                                    subtopic_id,
                                                    difficulty_level,
                                                },
                                            });
                                        }, 500);
                                    }}
                                    className="w-full sm:w-auto border border-[#3b6934] text-[#3b6934] px-4 sm:px-8 py-3 sm:py-4 rounded-lg font-bold uppercase flex items-center justify-center gap-2 hover:bg-[#3b6934]/5 transition">
                                    <RefreshCw size={18} />
                                    Retry Question
                                </button>
                            </div>

                            {/* Feedback */}
                            <div className="flex-1 mt-5 rounded-xl p-4 sm:p-6 lg:p-8 bg-white shadow-sm">

                                {/* Strengths */}
                                <h3 className="text-[#3b6934] font-bold uppercase flex items-center gap-2 mb-4">
                                    <TrendingUp size={18} />
                                    Comprehensive Strengths
                                </h3>

                                <ul className="space-y-2 mb-8">
                                    {feedbackData?.evaluation?.strengths?.map((item, index) => (
                                        <li key={index} className="text-[#0b1c30]">
                                            • {item}
                                        </li>
                                    ))}
                                </ul>

                                {/* Improvement Areas */}
                                <h3 className="text-red-600 font-bold uppercase flex items-center gap-2 mb-4">
                                    <Lightbulb size={18} />
                                    Improvement Areas
                                </h3>

                                <ul className="space-y-2 mb-8">
                                    {feedbackData?.evaluation?.improvement_areas?.map((item, index) => (
                                        <li key={index} className="text-[#0b1c30]">
                                            • {item}
                                        </li>
                                    ))}
                                </ul>

                                {/* Overall Feedback */}
                                <div className="mt-8">
                                    <h3 className="font-bold text-[#3b6934] uppercase mb-3">
                                        Overall Feedback
                                    </h3>

                                    <p className="text-gray-700 leading-7">
                                        {feedbackData?.evaluation?.overall_feedback}
                                    </p>
                                </div>

                                {/* Candidate Tier */}
                                <div className="mt-6">
                                    <span className="font-bold text-[#3b6934]">
                                        Candidate Tier :
                                    </span>

                                    <span className="ml-2 text-red-600 font-semibold">
                                        {feedbackData?.evaluation?.candidate_tier}
                                    </span>
                                </div>

                                {/* Scores */}
                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <div className="border border-gray-200 rounded-lg p-3">
                                        <p className="text-sm text-gray-500">Accuracy</p>
                                        <p className="text-xl font-bold">
                                            {feedbackData?.evaluation?.scores?.accuracy}
                                        </p>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-3">
                                        <p className="text-sm text-gray-500">Completeness</p>
                                        <p className="text-xl font-bold">
                                            {feedbackData?.evaluation?.scores?.completeness}
                                        </p>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-3">
                                        <p className="text-sm text-gray-500">Clarity</p>
                                        <p className="text-xl font-bold">
                                            {feedbackData?.evaluation?.scores?.clarity}
                                        </p>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-3">
                                        <p className="text-sm text-gray-500">Depth</p>
                                        <p className="text-xl font-bold">
                                            {feedbackData?.evaluation?.scores?.depth}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="xl:col-span-5">

                        <div className="bg-white border border-[#d5c2bf] rounded-xl shadow-sm p-4 sm:p-6 flex flex-col xl:min-h-162.5">

                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className="w-2 h-2 rounded-full bg-[#3b6934]"></span>

                                <span className="uppercase font-bold text-[15px] tracking-wide text-[#514441]">
                                    Live Transcription
                                </span>
                            </div>

                            {/* Scrollable Area */}
                            <div className="flex-1 overflow-y-auto pr-2">

                                {/* AI Prompt */}
                                <div className="bg-[#f1f4f9] border-l-4 border-[#3b6934] p-4 mb-8">
                                    <p className="italic text-[#514441] text-sm sm:text-base leading-7 sm:leading-8">
                                        AI: {question}
                                    </p>
                                </div>

                                {/* Transcript */}
                                <div className="space-y-8">
                                    <p className="text-[#0b1c30] text-sm sm:text-base lg:text-lg leading-7 lg:leading-10">
                                        {transcript}
                                    </p>
                                </div>
                            </div>

                            {/* Bottom Divider */}
                            <div className="mt-6 border-t border-[#d5c2bf] pt-6"></div>

                        </div>
                    </div>
                </div>
                {/* Next Question */}
                <button
                    onClick={() => {
                        setLoading(true);

                        setTimeout(() => {
                            if (currentQuestionIndex < questions.length - 1) {
                                navigate("/theory-interview", {
                                    state: {
                                        questions,
                                        nextQuestionIndex: currentQuestionIndex + 1,
                                        topic,
                                        subTopic,
                                        client_id,
                                        technology_id,
                                        subtopic_id,
                                        difficulty_level,
                                    },
                                });
                            } else {
                                navigate("/interview-modes");
                            }
                        }, 500);
                    }}
                    className="mt-6 w-full bg-[#3b6934] hover:bg-[#2f5a29] text-white py-4 sm:py-5 rounded-lg flex items-center justify-center gap-3 font-bold uppercase transition"
                >
                    <ArrowRight size={20} />
                    {currentQuestionIndex < questions.length - 1
                        ? "Next Question"
                        : "Finish Interview"}
                </button>
            </div>
        </div >
    );
}

export default TheoryFeedbackPage;