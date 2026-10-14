import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import {
    Check,
    Mic,
    SkipForward,
    CheckCircle,
    Timer,
    Square,
    AlertCircle,
    RefreshCw,
    ArrowLeft,
} from "lucide-react";
import { FiLoader } from "react-icons/fi";
import BASE_URL from "../config/api";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition";
import { getClientId } from "../services/authSession";
import { getApiErrorMessage } from "../utils/apiErrorHandler";
import ApiErrorModal from "../components/ApiErrorModal";

// Constants
const QUESTION_DURATION = 119;
const WAVEFORM_BARS = [28, 40, 22, 34, 18, 30, 42];

function Waveform({ isRecording, waveScale }) {
    if (!isRecording) return null;

    return (
        <div className="flex items-center justify-center gap-1 mt-8 h-15">
            {WAVEFORM_BARS.map((height, index) => (
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
}

function TheoryAIInterview() {
    const { state } = useLocation();
    const navigate = useNavigate();

    // Read interview details from route state and the current session.
    const topic = state?.topic || "";
    const subTopic = state?.subTopic || "";
    const client_id = state?.client_id || getClientId();
    const technology_id = state?.technology_id;
    const subtopic_id = state?.subtopic_id;
    const difficulty_level = state?.difficulty_level;
    const nextQuestionIndex = state?.nextQuestionIndex;
    const existingQuestions = state?.questions;

    // Refs
    const handleSubmitAnswerRef = useRef(null);

    // State variables
    const [isRecording, setIsRecording] = useState(false);
    const [waveScale, setWaveScale] = useState(1);
    const [timeLeft, setTimeLeft] = useState(QUESTION_DURATION);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [questions, setQuestions] = useState(() =>
        Array.isArray(existingQuestions) ? existingQuestions : []
    );

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
        nextQuestionIndex ?? 0
    );

    const [loading, setLoading] = useState(
        () => !existingQuestions?.length
    );

    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "",
    });

    const [apiError, setApiError] = useState(null);
    const [hasLoadFailed, setHasLoadFailed] = useState(false);
    const [questionRetryCount, setQuestionRetryCount] = useState(0);

    const {
        transcript,
        resetTranscript,
    } = useSpeechRecognition();

    // Derived values
    const currentQuestion = questions[currentQuestionIndex];
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");

    // Retry loading the interview questions.
    const handleRetryLoadQuestions = useCallback(() => {
        setApiError(null);
        setHasLoadFailed(false);
        setLoading(true);
        setQuestionRetryCount((previousCount) => previousCount + 1);
    }, []);

    // Question countdown timer.
    useEffect(() => {
        if (!isRecording) return;

        const timer = setInterval(() => {
            setTimeLeft((previousTime) => {
                if (previousTime <= 1) {
                    clearInterval(timer);
                    SpeechRecognition.stopListening();
                    setIsRecording(false);

                    // Allow the final transcript to be captured before auto-submit.
                    setTimeout(() => {
                        handleSubmitAnswerRef.current?.();
                    }, 500);

                    return 0;
                }

                return previousTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRecording]);

    // Animate the waveform while recording.
    useEffect(() => {
        if (!isRecording) return;

        const interval = setInterval(() => {
            setWaveScale(Math.random() * 0.8 + 0.6);
        }, 150);

        return () => clearInterval(interval);
    }, [isRecording]);

    // Start recording the answer.
    const startRecording = () => {
        resetTranscript();
        setTimeLeft(QUESTION_DURATION);
        setWaveScale(1);

        SpeechRecognition.startListening({
            continuous: true,
            language: "en-US",
        });

        setIsRecording(true);
    };

    // Stop recording the answer.
    const stopRecording = useCallback(() => {
        SpeechRecognition.stopListening();
        setIsRecording(false);
        setWaveScale(1);
    }, []);

    // Navigate between questions using the stepper.
    const handleStepClick = (index) => {
        if (index < 0 || index >= questions.length) return;

        stopRecording();
        resetTranscript();
        setTimeLeft(QUESTION_DURATION);

        const updatedQuestions = questions.map((question) => ({
            ...question,
            attempted_status:
                question.attempted_status === "current"
                    ? "pending"
                    : question.attempted_status,
        }));

        // Keep completed and skipped questions unchanged.
        if (
            updatedQuestions[index].attempted_status !== "completed" &&
            updatedQuestions[index].attempted_status !== "skipped"
        ) {
            updatedQuestions[index].attempted_status = "current";
        }

        setQuestions(updatedQuestions);
        setCurrentQuestionIndex(index);
    };

    // Load interview questions.
    const handleStartInterview = useCallback(async (signal) => {
        try {
            setLoading(true);
            setApiError(null);
            setHasLoadFailed(false);

            // Validate required route and session details.
            if (
                !client_id ||
                !technology_id ||
                !subtopic_id ||
                !difficulty_level
            ) {
                setHasLoadFailed(true);
                setApiError({
                    title: "Interview Information Unavailable",
                    message:
                        "Some interview details are missing. Return to the topic selection page and start again.",
                    onRetry: handleRetryLoadQuestions,
                });
                return;
            }

            const response = await fetch(
                `${BASE_URL}/Topic_based/clients/${client_id}/interview-questions?technology_id=${technology_id}&subtopic_id=${subtopic_id}&difficulty_level=${difficulty_level}`,
                { signal }
            );

            if (signal?.aborted) return;

            // Preserve the existing session-expiry flow.
            if (response.status === 401) {
                window.dispatchEvent(new Event("session-expired"));
                return;
            }

            if (!response.ok) {
                setHasLoadFailed(true);
                setApiError({
                    title: "Unable to Load Interview Questions",
                    message: getApiErrorMessage(
                        { response: { status: response.status } },
                        "Failed to load interview questions. Please try again."
                    ),
                    onRetry: handleRetryLoadQuestions,
                });
                return;
            }

            const data = await response.json();

            if (signal?.aborted) return;

            if (!Array.isArray(data) || data.length === 0) {
                setHasLoadFailed(true);
                setApiError({
                    title: "Interview Questions Unavailable",
                    message:
                        "No interview questions are available for this assessment. Please retry or return to topic selection.",
                    onRetry: handleRetryLoadQuestions,
                });
                return;
            }

            setQuestions(data);

            // Resume from the question marked current by the backend.
            const currentIndex = data.findIndex(
                (question) => question.attempted_status === "current"
            );

            setCurrentQuestionIndex(
                currentIndex !== -1 ? currentIndex : 0
            );
            setHasLoadFailed(false);
        } catch (error) {
            if (error.name === "AbortError" || signal?.aborted) return;

            setHasLoadFailed(true);
            setApiError({
                title: "Unable to Load Interview Questions",
                message: getApiErrorMessage(
                    error,
                    "Failed to load interview questions. Please check your connection and try again."
                ),
                onRetry: handleRetryLoadQuestions,
            });
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, [
        client_id,
        technology_id,
        subtopic_id,
        difficulty_level,
        handleRetryLoadQuestions,
    ]);

    // Fetch questions only when they were not passed from the previous page.
    useEffect(() => {
        if (existingQuestions?.length) return;

        const controller = new AbortController();

        // Defer the request until after the effect has completed.
        Promise.resolve().then(() => {
            if (!controller.signal.aborted) {
                handleStartInterview(controller.signal);
            }
        });

        return () => controller.abort();
    }, [
        existingQuestions,
        handleStartInterview,
        questionRetryCount,
    ]);
    // Skip the current question.
    const handleSkipQuestion = async () => {
        const question = questions[currentQuestionIndex];

        if (!question) {
            setPopup({
                show: true,
                message: "The current question is unavailable.",
                type: "error",
            });
            return;
        }

        try {
            setLoading(true);
            setApiError(null);

            const response = await fetch(
                `${BASE_URL}/Topic_based/clients/${client_id}/subtopic-questions/${question.question_id}/skip`,
                {
                    method: "POST",
                }
            );

            // Preserve the existing session-expiry flow.
            if (response.status === 401) {
                window.dispatchEvent(new Event("session-expired"));
                return;
            }

            if (!response.ok) {
                setApiError({
                    title: "Unable to Skip Question",
                    message: getApiErrorMessage(
                        { response: { status: response.status } },
                        "Unable to skip question. Please try again."
                    ),
                    onRetry: () => {
                        setApiError(null);
                        handleSkipQuestion();
                    },
                });
                return;
            }

            const data = await response.json();

            const updatedQuestions = questions.map((item, index) => ({
                ...item,
                attempted_status:
                    index === currentQuestionIndex
                        ? "skipped"
                        : item.attempted_status,
            }));

            // Move forward only when another question remains.
            if (currentQuestionIndex < updatedQuestions.length - 1) {
                updatedQuestions[currentQuestionIndex + 1] = {
                    ...updatedQuestions[currentQuestionIndex + 1],
                    attempted_status: "current",
                };

                setQuestions(updatedQuestions);
                setCurrentQuestionIndex((previousIndex) => previousIndex + 1);

                stopRecording();
                resetTranscript();
                setTimeLeft(QUESTION_DURATION);

                setPopup({
                    show: true,
                    message: data.message || "Question skipped successfully.",
                    type: "success",
                });
            }
        } catch (error) {
            setApiError({
                title: "Unable to Skip Question",
                message: getApiErrorMessage(
                    error,
                    "Unable to skip question. Please check your connection and try again."
                ),
                onRetry: () => {
                    setApiError(null);
                    handleSkipQuestion();
                },
            });
        } finally {
            setLoading(false);
        }
    };

    // Submit the spoken answer and navigate to the feedback page.
    const handleSubmitAnswer = useCallback(async () => {
        if (isSubmitting || loading) return;

        // Prevent submitting an empty answer.
        if (!(transcript || "").trim()) {
            setPopup({
                show: true,
                message: "Please speak before submitting.",
                type: "error",
            });
            return;
        }

        const question = questions[currentQuestionIndex];

        if (!question) {
            setPopup({
                show: true,
                message: "The current question is unavailable.",
                type: "error",
            });
            return;
        }

        setIsSubmitting(true);
        setLoading(true);
        setApiError(null);

        try {
            const response = await fetch(
                `${BASE_URL}/Topic_based/clients/${client_id}/subtopic-questions/${question.question_id}/submit-answer`,
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

            // Preserve the existing session-expiry flow.
            if (response.status === 401) {
                window.dispatchEvent(new Event("session-expired"));
                return;
            }

            if (!response.ok) {
                setApiError({
                    title: "Unable to Submit Answer",
                    message: getApiErrorMessage(
                        { response: { status: response.status } },
                        "Failed to submit answer. Please try again."
                    ),
                    onRetry: () => {
                        setApiError(null);
                        handleSubmitAnswerRef.current?.();
                    },
                });
                return;
            }

            const data = await response.json();

            stopRecording();
            resetTranscript();
            setTimeLeft(QUESTION_DURATION);

            // Pass the evaluation and interview details to the feedback page.
            navigate("/theory-feedback", {
                state: {
                    feedbackData: data,
                    transcript,
                    question: question.question_text,
                    questions: data.question_stepper || questions,
                    currentQuestionIndex,
                    topic,
                    subTopic,
                    client_id,
                    technology_id,
                    subtopic_id,
                    difficulty_level,
                },
            });
        } catch (error) {
            setApiError({
                title: "Unable to Submit Answer",
                message: getApiErrorMessage(
                    error,
                    "Something went wrong while submitting your answer. Please try again."
                ),
                onRetry: () => {
                    setApiError(null);
                    handleSubmitAnswerRef.current?.();
                },
            });
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    }, [
        isSubmitting,
        loading,
        transcript,
        questions,
        currentQuestionIndex,
        client_id,
        stopRecording,
        resetTranscript,
        navigate,
        topic,
        subTopic,
        technology_id,
        subtopic_id,
        difficulty_level,
    ]);

    // Keep the latest submit handler available for automatic submission.
    useEffect(() => {
        handleSubmitAnswerRef.current = handleSubmitAnswer;
    }, [handleSubmitAnswer]);

    // Show fallback only after question loading fails and the error modal is closed.
    if (
        !loading &&
        questions.length === 0 &&
        hasLoadFailed &&
        !apiError
    ) {
        return (
            <div className="bg-white min-h-screen">
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
                        <span>{subTopic}</span>
                    </div>
                </div>

                {/* Fallback UI */}
                <div className="min-h-[65vh] flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-lg rounded-2xl border border-[#e7dbd6] bg-white px-6 py-10 sm:px-10 text-center shadow-sm">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#eff4ff]">
                            <AlertCircle
                                size={32}
                                className="text-[#3b6934]"
                            />
                        </div>

                        <p className="mb-3 text-xs font-bold uppercase tracking-[2px] text-[#3b6934]">
                            Interview Setup
                        </p>

                        <h1 className="text-2xl sm:text-3xl font-bold text-[#DC2626]">
                            Interview Questions Unavailable
                        </h1>

                        <p className="mt-4 text-sm sm:text-base leading-7 text-[#514441]">
                            We couldn't load the interview questions.
                            Your selected topic and difficulty are preserved.
                            Retry loading the questions or return to topic selection.
                        </p>

                        {/* Retry */}
                        <button
                            type="button"
                            onClick={handleRetryLoadQuestions}
                            className="mt-7 w-full rounded-xl bg-[#3b6934] px-6 py-4 font-bold uppercase text-white transition hover:bg-[#2f5a29]"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <RefreshCw size={18} />
                                Retry Loading Questions
                            </span>
                        </button>

                        {/* Back to technologies */}
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
            {/* Loader */}
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
                    <span>›</span>
                    <span>{subTopic}</span>
                    <span>›</span>

                    <span className="text-[#3b6934]">
                        Question {currentQuestionIndex + 1}
                    </span>
                </div>
            </div>

            {/* Question Stepper */}
            <div className="border border-gray-300 rounded-xl p-4 mb-6">
                <div className="px-4 sm:px-6 lg:px-12 mt-6">
                    <div className="bg-white border border-[#e7dbd6] rounded-xl px-5 py-4 shadow-sm">
                        <div className="flex items-center">
                            {/* Previous question */}
                            <button
                                type="button"
                                onClick={() =>
                                    handleStepClick(currentQuestionIndex - 1)
                                }
                                disabled={
                                    currentQuestionIndex === 0 ||
                                    loading ||
                                    isSubmitting
                                }
                                aria-label="Previous question"
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6b5f5b] hover:bg-gray-100 transition disabled:opacity-40"
                            >
                                &#8249;
                            </button>

                            {/* Question steps */}
                            <div className="flex-1 flex items-center px-3">
                                {questions.map((_, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center flex-1 last:flex-none"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleStepClick(index)}
                                            disabled={loading || isSubmitting}
                                            aria-label={`Go to question ${index + 1}`}
                                            className={`
                                                relative z-10
                                                w-7.5 h-7.5 rounded-xl
                                                flex items-center justify-center
                                                text-xs font-semibold
                                                transition-all duration-300
                                                disabled:cursor-not-allowed
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

                            {/* Next question */}
                            <button
                                type="button"
                                onClick={() =>
                                    handleStepClick(currentQuestionIndex + 1)
                                }
                                disabled={
                                    currentQuestionIndex >= questions.length - 1 ||
                                    loading ||
                                    isSubmitting
                                }
                                aria-label="Next question"
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[#756965] hover:bg-gray-100 disabled:opacity-40"
                            >
                                &#8250;
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
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
                            <Waveform
                                isRecording={isRecording}
                                waveScale={waveScale}
                            />

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

                            {/* Current question */}
                            <div className="text-center mt-8 lg:mt-10 px-4 sm:px-8 lg:px-12">
                                <p className="uppercase tracking-[2px] text-[#3b6934] font-bold mb-2">
                                    Interviewer AI Active
                                </p>

                                <h2 className="text-xl sm:text-2xl lg:text-[28px] leading-8 sm:leading-10 font-bold">
                                    {currentQuestion?.question_text ||
                                        "Loading question..."}
                                </h2>
                            </div>
                        </div>

                        {/* Interview controls */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                            {/* Recording control */}
                            <button
                                type="button"
                                onClick={() =>
                                    isRecording
                                        ? stopRecording()
                                        : startRecording()
                                }
                                disabled={loading || isSubmitting || !currentQuestion}
                                className={`flex-1 py-4 rounded-lg flex items-center justify-center gap-2 font-bold uppercase transition disabled:opacity-60 disabled:cursor-not-allowed ${isRecording
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

                            {/* Skip question */}
                            <button
                                type="button"
                                onClick={handleSkipQuestion}
                                disabled={
                                    loading ||
                                    isSubmitting ||
                                    currentQuestion?.attempted_status !== "current"
                                }
                                className={`w-full flex-1 py-4 rounded-lg flex items-center justify-center gap-2 font-bold uppercase transition ${currentQuestion?.attempted_status === "current" &&
                                        !loading &&
                                        !isSubmitting
                                        ? "border-2 border-[#3b6934] text-[#3b6934] hover:bg-[#3b6934]/5"
                                        : "bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300"
                                    }`}
                            >
                                <SkipForward size={18} />
                                Skip Question
                            </button>

                            {/* Submit answer */}
                            <button
                                type="button"
                                onClick={handleSubmitAnswer}
                                disabled={loading || isSubmitting || !currentQuestion}
                                className="w-full flex-1 bg-[#3b6934] hover:bg-[#2f5a29] text-white py-4 rounded-lg flex items-center justify-center gap-2 font-bold uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                            >
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
                                <span className="w-2 h-2 rounded-full bg-[#3b6934] animate-pulse" />

                                <span className="uppercase font-bold text-[15px] tracking-wide text-[#514441]">
                                    Live Transcription
                                </span>
                            </div>

                            {/* Scroll area */}
                            <div className="flex-1 overflow-y-auto pr-2">
                                {/* AI Prompt */}
                                <div className="bg-[#f1f4f9] border-l-4 border-[#3b6934] p-4 mb-8">
                                    <p className="italic text-[#514441] text-[16px] leading-8">
                                        AI: {currentQuestion?.question_text}
                                    </p>
                                </div>

                                {/* Transcript */}
                                <div className="space-y-8">
                                    <p className="text-[#3b6934] text-base sm:text-lg leading-7 sm:leading-9 border-b border-[#bcf1ad] pb-3">
                                        {transcript ||
                                            "Start speaking to see live transcription..."}

                                        {isRecording && (
                                            <span className="inline-block w-0.5 h-6 bg-[#3b6934] ml-1 animate-pulse align-middle" />
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Bottom divider */}
                            <div className="mt-6 border-t border-[#d5c2bf] pt-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Existing validation and skip-success popup */}
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
                            type="button"
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
export default TheoryAIInterview;