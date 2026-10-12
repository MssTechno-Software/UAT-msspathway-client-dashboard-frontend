import {
  RefreshCw,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { FiLoader } from "react-icons/fi";

function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Read the feedback and interview details passed through route state.
  const feedbackData = location.state?.feedbackData;
  const transcript = location.state?.transcript;
  const question = location.state?.question;
  const currentQuestionIndex = location.state?.currentQuestionIndex;
  const questions = location.state?.questions;
  const [loading, setLoading] = useState(false);

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
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold uppercase">
          <span
            onClick={() => navigate("/interview-modes")}
            className="cursor-pointer hover:text-[#3b6934]"
          >
            Interview Modes
          </span>
          <span>›</span>
          <span
            onClick={() => navigate("/self-introduction")}
            className="cursor-pointer hover:text-[#3b6934]"
          >
            Self Introduction
          </span>
          <span>›</span>
          <span>
            Question {questions?.[currentQuestionIndex]?.question_id || currentQuestionIndex + 1}
          </span>
          <span>›</span>
          <span className="text-[#3b6934]">
            Feedback
          </span>
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

                    <h2 className="text-2xl sm:text-3xl lg:text-[42px] font-bold text-[#3b6934]">
                      {feedbackData?.evaluation?.overall_score || 0} <span className="text-[28px] text-[#514441]">/100</span>
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => {
                    // Show the loader before navigating back to retry the current question.
                    setLoading(true);
                    setTimeout(() => {
                      navigate("/self-introduction", {
                        state: {
                          retry: true,
                          retryQuestionIndex: currentQuestionIndex,
                          questions: questions || [],
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
                <h3 className="text-[#3b6934] font-bold uppercase flex items-center gap-2 mb-6 text-sm sm:text-base">
                  <TrendingUp size={18} />
                  Comprehensive Strengths
                </h3>

                {/* Render each strength provided by the evaluation response. */}
                <ul>
                  {feedbackData?.evaluation?.strengths?.map((strength, index) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>

              {/* Overall Feedback */}
              <div className="mt-8 p-4 bg-[#f8f9ff] rounded-lg border border-[#d5c2bf]">
                <h3 className="font-bold mb-2 text-[#3b6934]">
                  Overall Feedback
                </h3>

                <p className="text-[#514441] leading-7">
                  {feedbackData?.evaluation?.overall_feedback}
                </p>
              </div>

              {/* Improvement Areas */}
              <div className="mt-6">
                <h3 className="text-red-600 font-bold uppercase flex items-center gap-2 mb-4">
                  <Lightbulb size={18} />
                  Improvement Areas
                </h3>

                {/* Display the improvement suggestions returned by the evaluation. */}
                <ul className="space-y-3 text-[#0b1c30]">
                  {feedbackData?.evaluation?.improvement_areas?.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
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

                {/* Display the user's recorded interview transcript. */}
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
            // Show the loader before moving to the next question or finishing the interview.
            setLoading(true);

            setTimeout(() => {
              // Continue to the next question when more questions remain.
              if (currentQuestionIndex < questions.length - 1) {
                navigate("/self-introduction", {
                  state: {
                    questions,
                    nextQuestionIndex: currentQuestionIndex + 1,
                  },
                });
              } else {
                // Return to interview modes after the final question.
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

export default FeedbackPage;