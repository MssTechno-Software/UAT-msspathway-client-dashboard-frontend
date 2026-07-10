import BASE_URL from "../config/api";
import { Mic, SkipForward, CheckCircle, Timer, Square } from "lucide-react";

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiLoader } from "react-icons/fi";

import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";

import BeginAssessmentModal from "../components/BeginAssessmentModal";

function SelfIntroductionQuestion() {
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const [isRecording, setIsRecording] = useState(false);
    const [waveScale, setWaveScale] = useState(1);
    const [timeLeft, setTimeLeft] = useState(119);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const currentQuestion = questions[currentQuestionIndex];
    const [loading, setLoading] = useState(false);

    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "", // success | error
    });
    const {
        transcript,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    useEffect(() => {
        if (location.state?.questions) {
            setQuestions(location.state.questions);
        }
    }, [location.state]);

    useEffect(() => {
        if (location.state?.showBeginAssessmentModal) {
            setShowModal(true);
        }
    }, [location]);

    useEffect(() => {
        let interval;

        if (isRecording) {
            interval = setInterval(() => {
                setWaveScale(Math.random() * 0.8 + 0.6);
            }, 150);
        } else {
            setWaveScale(1);
        }

        return () => clearInterval(interval);
    }, [isRecording]);

    useEffect(() => {
        if (!isRecording) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);

                    SpeechRecognition.stopListening();
                    setIsRecording(false);

                    // Auto submit when time ends
                    setTimeout(() => {
                        handleSubmitAnswer();
                    }, 500);

                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRecording]);

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");

    const startRecording = () => {
        resetTranscript();

        SpeechRecognition.startListening({
            continuous: true,
            language: "en-US",
        });

        setIsRecording(true);
    };

    const stopRecording = () => {
        SpeechRecognition.stopListening();
        setIsRecording(false);
    };

    //retry useEffect
    useEffect(() => {
        if (location.state?.retry) {
            stopRecording();
            resetTranscript();
            setTimeLeft(119);

            if (location.state?.retryQuestionIndex !== undefined) {
                setCurrentQuestionIndex(
                    location.state.retryQuestionIndex
                );
            }
        }
    }, [location.state]);

    //next question useEffect
    useEffect(() => {
        if (
            location.state?.nextQuestionIndex !== undefined
        ) {
            setQuestions(location.state.questions || []);

            setCurrentQuestionIndex(
                location.state.nextQuestionIndex
            );

            resetTranscript();
            setTimeLeft(119);
            stopRecording();
        }
    }, [location.state]);

    //wave component
    const Waveform = () => {
        if (!isRecording) return null;

        const bars = [28, 40, 22, 34, 18, 30, 42];

        return (
            <div className="flex items-center justify-center gap-1 mt-8 h-15">
                {bars.map((height, index) => (
                    <div
                        key={index}
                        className="bg-[#3b6934] rounded-full"
                        style={{
                            width: "4px",
                            height: `${height * waveScale}px`,
                            transition: "height 0.15s ease-in-out",
                        }}
                    />
                ))}
            </div>
        );
    };

    //get question by client_id api call
    const client_id = localStorage.getItem("client_id");

    const handleStartInterview = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${BASE_URL}/questions/clients/${client_id}/self-introduction-questions`
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    data.detail ||
                    "Failed to fetch questions"
                );
            }

            console.log("Self Introduction Questions fetched", data);

            const enabledQuestions = (data.questions || [])
                .filter((question) => question.status === "enabled")
                .sort((a, b) => a.display_order - b.display_order);

            setQuestions(enabledQuestions);

            setCurrentQuestionIndex(0);

            setShowModal(false);
            setPopup({
                show: true,
                message:
                    data.message ||
                    data.error ||
                    data.detail ||
                    "Questions loaded successfully",
                type: "success",
            });
        } catch (error) {
            console.error("Failed to fetch questions:", error);
            setPopup({
                show: true,
                message:
                    error.message ||
                    "Failed to fetch questions",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    //skip question logic
    const handleSkipQuestion = () => {
        stopRecording();
        resetTranscript();
        setTimeLeft(119);

        const updatedQuestions = [...questions];

        updatedQuestions[currentQuestionIndex].attempted_status = "skipped";

        const nextIndex = updatedQuestions.findIndex(
            (q, i) =>
                i > currentQuestionIndex &&
                q.attempted_status !== "completed" &&
                q.attempted_status !== "skipped"
        );

        if (nextIndex !== -1) {
            updatedQuestions[nextIndex].attempted_status = "current";
            setCurrentQuestionIndex(nextIndex);
            setQuestions(updatedQuestions);
        } else {
            setQuestions(updatedQuestions);

            setPopup({
                show: true,
                type: "warning",
                message: "This is the last question. Click OK to finish the interview.",
            });
        }
    };

    //submit answer api call
    const handleSubmitAnswer = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setLoading(true);
        try {
            const currentQuestion = questions[currentQuestionIndex];
            console.log("Current Question:", currentQuestion);
            console.log("Question ID:", currentQuestion?.question_id);

            const response = await fetch(
                `${BASE_URL}/questions/clients/${client_id}/questions/${currentQuestion.question_id}/submit-answer`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        answer_text: transcript,
                    }),
                }
            );

            const data = await response.json();

            console.log("Submit Response:", data);
            if (!response.ok) {
                setPopup({
                    show: true,
                    message:
                        data.message ||
                        data.error ||
                        data.detail ||
                        "Failed to submit answer",
                    type: "error",
                });

                return;
            }

            setPopup({
                show: true,
                message:
                    data.message ||
                    data.error ||
                    data.detail ||
                    "Answer submitted successfully",
                type: "success",
            });
            setTimeout(() => {
                navigate("/feedback", {
                    state: {
                        feedbackData: data,
                        transcript,
                        question: currentQuestion.question_text,
                        questions,
                        currentQuestionIndex,
                    },
                });
            }, 1000);
        } catch (error) {
            console.error("Submit failed:", error);
        } finally {
            setLoading(false);
            setIsSubmitting(false);
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
            {/* Header */}
            <div className="h-auto min-h-16 border-b border-[#d5c2bf] flex items-center px-4 sm:px-6 lg:px-12 py-4">
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold uppercase text-[#514441]">
                    <span
                        onClick={() => navigate("/interview-modes")}
                        className="cursor-pointer hover:text-[#3b6934]"
                    >
                        Interview Modes
                    </span>
                    <span>›</span>
                    <span>
                        Self Introduction
                    </span>
                    <span>›</span>
                    <span className="text-[#3b6934]">Question {currentQuestionIndex + 1}</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* LEFT SECTION */}
                    <div className="xl:col-span-7">
                        {/* Interview Card */}
                        <div className="bg-white border border-[#d5c2bf] rounded-xl shadow-sm min-h-162.5 flex flex-col items-center justify-center relative overflow-hidden">

                            {/* Avatar */}
                            <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-xl border-4 border-[#bcf1ad] p-1 bg-white">
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-d1mNhj1eejdH7s-lXg-ifQEp4vQ6reI7Px0jAwKT7mFZyoP3wTBW5DzAqjMGrTbFnX56HN0g-dT4x-9CrcUFCA23ir2F2E6RGtYNV5bT0Wfh287CJvbQt3MeGc6XLtkMJ2qeo61Dqli5FTPTekXwgXXl6qNfAQch8ZDn1gSb-vXKdxACoJJflpil6e5BDIEOBzjEqj0o8zRnLPJHnuJxv_EdW9jBF_7jKhoVcrreRH0De0HLrwk74OtGKHpJ95_T8cX0qRrP7RWH"
                                    alt="AI Interviewer"
                                    className="w-full h-full rounded-xl object-cover"
                                />
                            </div>

                            {/* Waveform */}
                            <Waveform />

                            {/* Timer */}
                            <div className="mt-12 flex flex-col items-center">
                                <div className="flex flex-wrap justify-center items-center gap-2 mb-1 text-center">
                                    <Timer
                                        size={18}
                                        className="text-[#3b6934]"
                                    />

                                    <span className="uppercase font-bold tracking-wider text-[#514441]">
                                        Question Time Remaining:
                                    </span>

                                    <span className="font-bold text-[#3b6934]">
                                        {minutes}:{seconds}
                                    </span>
                                </div>

                                <div className="w-32 h-1 bg-[#f1f4f9] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#3b6934] transition-all duration-1000"
                                        style={{
                                            width: `${(timeLeft / 105) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Question */}
                            <div className="text-center mt-8 lg:mt-10 px-4 sm:px-8 lg:px-12">
                                <p className="uppercase tracking-[2px] text-[#3b6934] font-bold mb-2">
                                    Interviewer AI Active
                                </p>

                                <h2 className="text-xl sm:text-2xl lg:text-[28px] leading-8 sm:leading-10 font-bold">
                                    {questions[currentQuestionIndex]?.question_text ||
                                        "Loading question..."}
                                </h2>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                            <button
                                onClick={() =>
                                    isRecording
                                        ? stopRecording()
                                        : startRecording()
                                }
                                className={`flex-1 py-4 rounded-lg flex items-center justify-center gap-2 font-bold uppercase transition
                                    ${isRecording
                                        ? "bg-red-600 hover:bg-red-700 text-white"
                                        : "bg-[#3b6934] hover:bg-[#2f5a29] text-white"
                                    }`}
                            >
                                {isRecording ? (
                                    <>
                                        <Square size={18} />
                                        Recording...
                                    </>
                                ) : (
                                    <>
                                        <Mic size={18} />
                                        Speak Now
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleSkipQuestion}
                                disabled={!currentQuestion?.attempted_status}
                                className={`w-full flex-1 py-4 rounded-lg flex items-center justify-center gap-2 font-bold uppercase transition
                                    ${currentQuestion?.attempted_status
                                        ? "border-2 border-[#3b6934] text-[#3b6934] hover:bg-[#3b6934]/5"
                                        : "bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300"
                                    }
                                `}
                            >
                                <SkipForward size={18} />
                                Skip Question
                            </button>

                            <button
                                onClick={handleSubmitAnswer}
                                className="w-full flex-1 bg-[#3b6934] hover:bg-[#2f5a29] text-white py-4 rounded-lg flex items-center justify-center gap-2 font-bold uppercase">
                                <CheckCircle size={18} />
                                Submit Answer
                            </button>
                        </div>
                    </div>

                    {/* RIGHT SECTION */}
                    <div className="xl:col-span-5">
                        <div className="bg-white border border-[#d5c2bf] rounded-xl shadow-sm h-162.5 flex flex-col p-6">

                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className="w-2 h-2 rounded-full bg-[#3b6934] animate-pulse"></span>

                                <span className="uppercase font-bold text-[15px] tracking-wide text-[#514441]">
                                    Live Transcription
                                </span>
                            </div>

                            {/* Scroll Area */}
                            <div className="flex-1 overflow-y-auto pr-2">

                                {/* AI Prompt */}
                                <div className="bg-[#f1f4f9] border-l-4 border-[#3b6934] p-4 mb-8">
                                    <p className="italic text-[#514441] text-[16px] leading-8">
                                        AI: {questions[currentQuestionIndex]?.question_text}
                                    </p>
                                </div>

                                {/* Transcript */}
                                <div className="space-y-8">
                                    <p className="text-[#3b6934] text-base sm:text-lg leading-7 sm:leading-9 border-b border-[#bcf1ad] pb-3">
                                        {transcript || "Start speaking to see live transcription..."}

                                        {isRecording && (
                                            <span className="inline-block w-0.5 h-6 bg-[#3b6934] ml-1 animate-pulse align-middle"></span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Bottom Divider */}
                            <div className="mt-6 border-t border-[#d5c2bf] pt-6"></div>
                        </div>
                    </div>
                </div>
            </div>
            <BeginAssessmentModal
                open={showModal}
                onClose={() => setShowModal(false)}
                onProceed={handleStartInterview}
                loading={loading}
            />
            {
                popup.show && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 px-2">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">

                            <p
                                className={`text-lg font-semibold mb-4
                    ${popup.type === "success" &&
                                    "text-green-800"}
                    ${popup.type === "error" &&
                                    "text-red-600"}
                `}
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
                                className="px-4 py-2 bg-green-800 text-white rounded-full hover:bg-green-700 cursor-pointer"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default SelfIntroductionQuestion;