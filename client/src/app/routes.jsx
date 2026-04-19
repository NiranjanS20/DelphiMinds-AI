import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

// Auth pages
import Login from '../features/auth/Login';
import Signup from '../features/auth/Signup';

// Protected pages
import Dashboard from '../features/dashboard/Dashboard';
import ResumeUpload from '../features/resume/ResumeUpload';
import CareerPath from '../features/career/CareerPath';
import SkillGap from '../features/career/SkillGap';
import ChatUI from '../features/chatbot/ChatUI';
import InsightsDashboard from '../features/insights/InsightsDashboard';
import LearningReportPage from '../features/learning/LearningReportPage';
import LearningPathPage from '../features/learning/LearningPathPage';

import LandingPage from '../features/landing/LandingPage';

/**
 * Application route definitions.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume"
        element={
          <ProtectedRoute>
            <ResumeUpload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/career"
        element={
          <ProtectedRoute>
            <CareerPath />
          </ProtectedRoute>
        }
      />
      <Route
        path="/skill-gap"
        element={
          <ProtectedRoute>
            <SkillGap />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatUI />
          </ProtectedRoute>
        }
      />
      <Route
        path="/insights"
        element={
          <ProtectedRoute>
            <InsightsDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learning/report"
        element={
          <ProtectedRoute>
            <LearningReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learning/path"
        element={
          <ProtectedRoute>
            <LearningPathPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect (handled by component or catch-all) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
