import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Mic, SkipForward, CheckCircle, Timer, Square } from "lucide-react";
import { FiLoader } from "react-icons/fi";
import BASE_URL from "../config/api";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

function ScheduledAIInterview() {
    const { state } = useLocation();
    const interview = state?.interview;
    const preStartData = state?.preStartData;
    const interviewType = preStartData?.interview_type || "";
    const pageTitle = interviewType.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
    //const pageTitle = state?.preStartData?.page_title?.trim();
    const navigate = useNavigate();
    const location = useLocation();
    const apiQuestions = state?.questions || [];
    const clientId = state?.client_id || localStorage.getItem("client_id");
    const interview_id =
        state?.interview_id || state?.interview?.interview_id;
    const technology_id = state?.technology_id;
    const [answers, setAnswers] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [waveScale, setWaveScale] = useState(1);
    const [timeLeft, setTimeLeft] = useState(119);
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");
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

    console.log("state", state);
    console.log("clientId", clientId);
    console.log("questions", state?.questions);
    const {
        transcript,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    /*timer*/
    useEffect(() => {
        if (!isRecording) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);

                    SpeechRecognition.stopListening();
                    setIsRecording(false);

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

    useEffect(() => {
        if (!apiQuestions?.length) return;

        const formatted = apiQuestions.map((q, index) => ({
            ...q,
            question_id: q.id,
            question_text: q.question,
            attempted_status:
                index === 0 ? "current" : "pending",
        }));

        setQuestions(formatted);
        setCurrentQuestionIndex(0);
    }, [apiQuestions]);

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

    const startRecording = () => {
        resetTranscript();
        setTimeLeft(119);

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

    const handleStepClick = (index) => {
        stopRecording();
        resetTranscript();
        setTimeLeft(119);

        const updatedQuestions = [...questions];

        // Remove the current status from the old question
        updatedQuestions.forEach((question) => {
            if (question.attempted_status === "current") {
                question.attempted_status = "pending";
            }
        });

        // Make the selected question current
        if (
            updatedQuestions[index].attempted_status !== "completed" &&
            updatedQuestions[index].attempted_status !== "skipped"
        ) {
            updatedQuestions[index].attempted_status = "current";
        }

        setQuestions(updatedQuestions);
        setCurrentQuestionIndex(index);
    };

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

    const handleSubmitAnswer = () => {
        if (!transcript.trim()) {
            setPopup({
                show: true,
                message: "Please speak before submitting.",
                type: "error",
            });
            return;
        }

        const questionNumber = currentQuestionIndex + 1;

        let updatedAnswers = [...answers];

        const existingIndex = updatedAnswers.findIndex(
            ans => ans.question_number === questionNumber
        );

        if (existingIndex !== -1) {
            // Update skipped/previous answer
            updatedAnswers[existingIndex] = {
                ...updatedAnswers[existingIndex],
                answer_text: transcript,
            };
        } else {
            // First time answering
            updatedAnswers.push({
                question_number: questionNumber,
                answer_text: transcript,
            });
        }

        setAnswers(updatedAnswers);

        const updatedQuestions = [...questions];

        updatedQuestions[currentQuestionIndex].attempted_status = "completed";

        const nextIndex = updatedQuestions.findIndex(
            (q, i) =>
                i > currentQuestionIndex &&
                q.attempted_status !== "completed" &&
                q.attempted_status !== "skipped"
        );

        if (nextIndex !== -1) {
            updatedQuestions[nextIndex].attempted_status = "current";
            setCurrentQuestionIndex(nextIndex);
        }

        setQuestions(updatedQuestions);

        stopRecording();
        resetTranscript();
        setTimeLeft(119);

        if (currentQuestionIndex < updatedQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleSkipQuestion = () => {
        setAnswers(prev => [
            ...prev,
            {
                question_number: currentQuestionIndex + 1,
                answer_text: ""
            }
        ]);

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
        }

        setQuestions(updatedQuestions);
    };

    const handleFinishInterview = async () => {
        try {
            setLoading(true);

            let finalAnswers = [...answers];

            if (transcript.trim()) {
                const questionNumber = currentQuestionIndex + 1;

                const existingIndex = finalAnswers.findIndex(
                    ans => ans.question_number === questionNumber
                );

                if (existingIndex !== -1) {
                    finalAnswers[existingIndex].answer_text = transcript;
                } else {
                    finalAnswers.push({
                        question_number: questionNumber,
                        answer_text: transcript,
                    });
                }
            }

            // 👇 ADD THIS BLOCK HERE
            const unanswered = questions.findIndex((_, index) => {
                return !finalAnswers.some(
                    answer => answer.question_number === index + 1
                );
            });

            if (unanswered !== -1) {
                setLoading(false);

                setPopup({
                    show: true,
                    type: "error",
                    message: `Please answer Question ${unanswered + 1} before finishing the interview.`,
                });

                // Move to the unanswered question
                setCurrentQuestionIndex(unanswered);

                return;
            }

            // 👇 API CALL SHOULD COME AFTER THE VALIDATION
            const response = await fetch(
                `${BASE_URL}/api/clients/${clientId}/interviews/${interview_id}/submit-all-answers`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        answers: finalAnswers,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                let errorMessage = "Submission failed";

                if (data?.detail?.validation_errors?.length) {
                    errorMessage = data.detail.validation_errors.join("\n");
                } else if (data?.detail?.error) {
                    errorMessage = data.detail.error;
                } else if (typeof data?.detail === "string") {
                    errorMessage = data.detail;
                } else if (data?.message) {
                    errorMessage = data.message;
                }

                throw new Error(errorMessage);
            }

            navigate("/scheduled-interview-feedback", {
                state: {
                    scorecard: data,
                    interview: state?.interview,
                    preStartData: state?.preStartData,
                },
            });
        } catch (err) {
            setPopup({
                show: true,
                type: "error",
                message: err.message,
            });
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="bg-white min-h-screen">
            {/*loader*/}
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
                        onClick={() => navigate("/scheduled-interview")}
                        className="cursor-pointer hover:text-[#3b6934]"
                    >
                        Scheduled Interviews
                    </span>
                    <span>›</span>
                    <span
                        onClick={() =>
                            navigate("/scheduled-interview-mode", {
                                state: {
                                    interview: state?.interview,
                                    preStartData: state?.preStartData,
                                },
                            })
                        }
                        className="cursor-pointer hover:text-[#3b6934]"
                    >
                        {pageTitle}
                    </span>

                    <span>›</span>

                    <span className="text-[#3b6934]">
                        Question {(currentQuestionIndex ?? 0) + 1}
                    </span>
                </div>
            </div>
            <div className="border border-gray-300 p-4 mb-6">
                {/* Question Stepper */}
                <div className="px-4 sm:px-6 lg:px-12 mt-6">
                    <div className="bg-white border border-[#e7dbd6] rounded-xl px-5 py-4 shadow-sm">

                        <div className="flex items-center">

                            {/* Previous */}
                            <button
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6b5f5b] hover:bg-gray-100 transition cursor-pointer"
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
                                        <button
                                            type="button"
                                            onClick={() => handleStepClick(index)}
                                            className={`
                                            relative z-10
                                            w-7.5 h-7.5 rounded-xl
                                            flex items-center justify-center
                                            text-xs font-semibold
                                            transition-all duration-300
                                            cursor-pointer
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
                                        </button>

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
                                    className={`flex-1 py-4 rounded-lg flex items-center justify-center gap-2 font-bold uppercase transition cursor-pointer
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
                                    disabled={currentQuestion?.attempted_status !== "current"}
                                    className={`w-full flex-1 py-4 rounded-lg flex items-center justify-center gap-2 font-bold uppercase transition cursor-pointer
                                    ${currentQuestion?.attempted_status
                                            ? "border-2 border-[#3b6934] text-[#3b6934] hover:bg-[#3b6934]/5"
                                            : "bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300"
                                        }
                                `}
                                >
                                    <SkipForward size={18} />
                                    Skip Question
                                </button>

                                {currentQuestionIndex === questions.length - 1 ? (
                                    <button
                                        onClick={handleFinishInterview}
                                        className="w-full flex-1 bg-[#3b6934] hover:bg-[#2f5a29] text-white py-4 rounded-lg flex items-center justify-center gap-2 font-bold uppercase cursor-pointer"
                                    >
                                        <CheckCircle size={18} />
                                        Finish Interview
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmitAnswer}
                                        className="w-full flex-1 bg-[#3b6934] hover:bg-[#2f5a29] text-white py-4 rounded-lg flex items-center justify-center gap-2 font-bold uppercase cursor-pointer"
                                    >
                                        <CheckCircle size={18} />
                                        Submit Answer
                                    </button>
                                )}
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
            </div>
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
        </div >
    );
}

export default ScheduledAIInterview;