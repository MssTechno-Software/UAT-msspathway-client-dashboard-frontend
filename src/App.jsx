import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
const AppLayout = lazy(() => import("./pages/AppLayout"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const InterviewMode = lazy(() => import("./pages/InterviewMode"));
const SelfIntroductionQuestion = lazy(() => import("./pages/SelfIntroductionQuestion"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const TheoryTopic = lazy(() => import("./pages/TheoryTopic"));
const SubTopic = lazy(() => import("./pages/SubTopicPage"));
const TheoryStartModule = lazy(() => import("./pages/TheoryStartModule"));
const TheoryAIInterview = lazy(() => import("./pages/TheoryAIInterview"));
const TheoryFeedbackPage = lazy(() => import("./pages/TheoryFeedackPage"));
const ScheduledInterviewPage = lazy(() => import("./pages/ScheduledInterviewPage"));
const ScheduledInterviewMode = lazy(() => import("./pages/ScheduledInterviewMode"));
const ScheduledAIInterviewPage = lazy(() => import("./pages/ScheduledAIInterviewPage"));
const ScheduledInterviewFeedback = lazy(() => import("./pages/ScheduledInterviewFeedback"));
const ScoreCardPage = lazy(() => import("./pages/ScoreCardPage"));
const InterviewPerformanceReport = lazy(() => import("./pages/InterviewPerformanceReport"));
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/profile" element={<ProtectedRoute allowedRoles={["client"]}><MyProfile /></ProtectedRoute>} />
            <Route path="/client-dashboard" element={<ProtectedRoute allowedRoles={["client"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/interview-modes" element={<ProtectedRoute allowedRoles={["client"]}><InterviewMode /></ProtectedRoute>} />
            <Route path="/self-introduction" element={<ProtectedRoute allowedRoles={["client"]}><SelfIntroductionQuestion /></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute allowedRoles={["client"]}><FeedbackPage /></ProtectedRoute>} />
            <Route path="/theory-topic" element={<ProtectedRoute allowedRoles={["client"]}><TheoryTopic /></ProtectedRoute>} />
            <Route path="/sub-topic" element={<ProtectedRoute allowedRoles={["client"]}><SubTopic /></ProtectedRoute>} />
            <Route path="/theory-interview-start-module" element={<ProtectedRoute allowedRoles={["client"]}><TheoryStartModule /></ProtectedRoute>} />
            <Route path="/theory-interview" element={<ProtectedRoute allowedRoles={["client"]}><TheoryAIInterview /></ProtectedRoute>} />
            <Route path="/theory-feedback" element={<ProtectedRoute allowedRoles={["client"]}><TheoryFeedbackPage /></ProtectedRoute>} />
            <Route path="/scheduled-Interview" element={<ProtectedRoute allowedRoles={["client"]}><ScheduledInterviewPage /></ProtectedRoute>} />
            <Route path="/scheduled-Interview-mode" element={<ProtectedRoute allowedRoles={["client"]}><ScheduledInterviewMode /></ProtectedRoute>} />
            <Route path="/scheduled-AI-Interview" element={<ProtectedRoute allowedRoles={["client"]}><ScheduledAIInterviewPage /></ProtectedRoute>} />
            <Route path="/scheduled-Interview-feedback" element={<ProtectedRoute allowedRoles={["client"]}><ScheduledInterviewFeedback /></ProtectedRoute>} />
            <Route path="/scorecards" element={<ProtectedRoute allowedRoles={["client"]}><ScoreCardPage /></ProtectedRoute>} />
            <Route path="/Interview-Performance-Report" element={<ProtectedRoute allowedRoles={["client"]}><InterviewPerformanceReport /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
export default App;
