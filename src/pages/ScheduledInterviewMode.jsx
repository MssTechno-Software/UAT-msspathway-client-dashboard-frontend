import React from "react";
import { useLocation } from "react-router-dom";
import { ChevronRight, Clock3, ShieldCheck, CircleCheck, ArrowRight, Info, FileText } from "lucide-react";
import { FiLoader } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import BASE_URL from "../config/api";

function ScheduledInterviewMode() {
    const { state } = useLocation();
    const interview = state?.interview;
    const preStartData = state?.preStartData;
    const interviewType = preStartData?.interview_type || "";
    const pageTitle = interviewType.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
    // const pageTitle = preStartData?.page_title?.trim() || "Interview";
    const isCompanyInterview = interviewType === "company_based";
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "", // success | error
    });
    const clientId =
        state?.client_id ??
        localStorage.getItem("client_id");

    const activeAssessmentMode =
        preStartData?.assessment_mode?.label || "--";

    const activeDuration =
        preStartData?.duration?.label || "--";
    //resume
    const focusArea =
        preStartData?.question_focus || [];
    //company
    const focusAreas =
        preStartData?.question_focus_areas || [];

    /*start interview*/
    console.log({ clientId, interviewId: interview.interview_id });
    const handleStartInterview = async () => {
        try {
            setLoading(true);
            console.log(clientId);
            console.log(interview.interview_id);
            const response = await axios.post(
                `${BASE_URL}/api/clients/${clientId}/interviews/${interview.interview_id}/generate-questions`
            );

            console.log("Generate Questions Response:", response.data);
            navigate("/scheduled-ai-interview", {
                state: {
                    ...response.data,
                    interview_id: interview.interview_id,
                    client_id: clientId,
                    preStartData,
                    interview,
                },
            });

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

    return (
        <div className="w-full min-h-screen font-sans antialiased text-[#0b1c30]">
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

            <div className="w-full max-w-full flex flex-col pt-2">
                {/* Breadcrumb */}
                <div className="h-auto min-h-16 border-b border-[#d5c2bf] flex items-center px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 mb-10">
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold uppercase text-[#514441]">

                        <span
                            onClick={() => navigate("/scheduled-interview")}
                            className="cursor-pointer hover:text-[#3b6934]"
                        >
                            Scheduled Interviews
                        </span>

                        <span>›</span>

                        <span className="text-[#3b6934]">
                            {pageTitle}
                        </span>

                    </div>
                </div>

                {isCompanyInterview ? (
                    <>
                        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex flex-col">
                            {/* Page Title */}
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-[#0B1C30] mb-5">
                                {pageTitle}
                            </h2>

                            {/* Main Card */}
                            <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 sm:p-6 lg:p-8 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)] gap-6">
                                    {/* Left */}
                                    <div className="flex flex-col gap-5">
                                        {/* Assessment Mode */}
                                        <div
                                            className="
                                                bg-[#F8F9FD]
                                                border
                                                border-[#E5E7EB]
                                                rounded-lg
                                                p-4
                                                sm:p-5
                                                min-h-30
                                                flex
                                                flex-col
                                                justify-center
                                            "
                                        >
                                            <p className="text-xs uppercase tracking-wider font-semibold text-[#514441] mb-2">
                                                Assessment Mode
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="w-5 h-5 text-[#154212]" />
                                                <span className="text-base sm:text-lg md:text-xl lg:text-2xl break-word font-semibold break-word text-[#0b1c30]">
                                                    {activeAssessmentMode}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Duration */}
                                        <div className="
                                            bg-[#F8F9FD]
                                            border
                                            border-[#E5E7EB]
                                            rounded-lg
                                            p-4
                                            sm:p-5
                                            min-h-30
                                            flex
                                            flex-col
                                            justify-center
                                        "
                                        >
                                            <p className="text-xs uppercase tracking-wider font-semibold text-[#514441] mb-2">
                                                Duration
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Clock3 className="w-5 h-5 text-[#154212]" />
                                                <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold break-word text-[#0b1c30]">
                                                    {activeDuration}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Right */}
                                    <div className="bg-[#F3F5F8] border border-[#E5E7EB] rounded-lg p-6 h-full">
                                        <p className="text-xs uppercase tracking-wider font-semibold text-[#514441] mb-6">
                                            Question Focus Areas
                                        </p>
                                        <div className="space-y-5">
                                            {focusAreas.map((area, index) => (
                                                <div
                                                    key={index}
                                                    className="flex gap-3"
                                                >
                                                    <CircleCheck className="w-5 h-5 text-[#154212] shrink-0 mt-1" />

                                                    <div>
                                                        <p className="text-lg font-semibold text-[#0b1c30]">
                                                            {area.title}
                                                        </p>

                                                        <p className="text-sm text-[#6B7280]">
                                                            {area.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Warning Text */}
                            <div className="mt-10 flex flex-col items-center w-full">
                                <div className="text-center w-full max-w-2xl mb-16 flex flex-col items-center">
                                    <p className="text-[14px] leading-5 font-normal text-[#514441] italic mb-6">
                                        {preStartData?.consent_text}
                                    </p>
                                    <button
                                        onClick={handleStartInterview}
                                        className="bg-[#2d5a27] text-white px-16 py-3 rounded-lg text-[24px] leading-8 font-semibold shadow-lg hover:brightness-110 active:scale-95 transition-all w-full md:w-auto min-w-[320px] cursor-pointer"
                                    >
                                        START INTERVIEW
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // Resume-Based 
                    <>
                        {/* Main Content */}
                        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col">
                            {/* Page Title */}
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#0b1c30] text-center mb-5">
                                {pageTitle}
                            </h2>
                            {/* Main Card */}
                            <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 sm:p-6 lg:p-8 shadow-sm">
                                <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)] gap-6 lg:gap-8">
                                    {/* Left */}
                                    <div className="flex flex-col gap-5 h-full">
                                        {/* Assessment Mode */}
                                        <div className="bg-[#F8F9FD] border border-[#E5E7EB] rounded-lg p-4 sm:p-5 min-h-30 flex flex-col justify-center">
                                            <p className="text-xs uppercase tracking-wider font-semibold text-[#514441] mb-2">
                                                Assessment Mode
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="w-5 h-5 text-[#154212]" />
                                                <span className="text-base sm:text-lg md:text-xl lg:text-2xl break-word font-semibold break-word text-[#0b1c30]">
                                                    {activeAssessmentMode}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Duration */}
                                        <div className="
                                                bg-[#F8F9FD]
                                                border
                                                border-[#E5E7EB]
                                                rounded-lg
                                                p-4
                                                sm:p-5
                                                min-h-30
                                                flex
                                                flex-col
                                                justify-center
                                            ">
                                            <p className="text-xs uppercase tracking-wider font-semibold text-[#514441] mb-2">
                                                Duration
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Clock3 className="w-5 h-5 text-[#154212]" />
                                                <span className="text-base sm:text-lg md:text-xl lg:text-2xl break-word font-semibold break-word text-[#0b1c30]">
                                                    {activeDuration}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right */}
                                    <div className="
                                        bg-[#F3F5F8]
                                        border
                                        border-[#E5E7EB]
                                        rounded-lg
                                        p-5
                                        sm:p-6
                                        h-full
                                    ">
                                        <p className="text-xs uppercase tracking-wider font-semibold text-[#514441] mb-6">
                                            Question Focus Areas
                                        </p>
                                        <div className="space-y-5">
                                            {focusArea.map((area, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-3"
                                                >
                                                    <CircleCheck
                                                        className="w-5 h-5 text-[#154212] shrink-0"
                                                    />

                                                    <p className="text-lg font-semibold text-[#0b1c30]">
                                                        {area}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* Info */}
                                <div className="mt-6 pt-6 border-t border-[#E5E7EB] flex gap-3 items-start">
                                    <span className="p-1 rounded-full bg-[#ffdad6] text-[#ba1a1a]">
                                        <Info className="w-4 h-4" />
                                    </span>

                                    <p className="text-sm sm:text-base leading-6 text-[#514441]">
                                        {preStartData?.info_note}
                                    </p>
                                </div>
                            </div>

                            {/* Warning Text */}
                            <div className="mt-10 flex flex-col items-center w-full">
                                <div className="text-center w-full max-w-2xl mb-16 flex flex-col items-center">
                                    <p className="text-[14px] leading-5 font-normal text-[#514441] italic mb-6">
                                        {preStartData?.consent_text}
                                    </p>
                                    <button
                                        onClick={handleStartInterview}
                                        className="bg-[#2d5a27] text-white px-16 py-3 rounded-lg text-[24px] leading-8 font-semibold shadow-lg hover:brightness-110 active:scale-95 transition-all w-full md:w-auto min-w-[320px] cursor-pointer"
                                    >
                                        START INTERVIEW
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            {/* Popup */}
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
}
export default ScheduledInterviewMode;