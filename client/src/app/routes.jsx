import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import ErrorBoundary from '../components/ErrorBoundary';
import { FullScreenLoader } from '../components/Loader';

// Auth pages
import Login from '../features/auth/Login';
import Signup from '../features/auth/Signup';

// Lazy-loaded protected pages
const Dashboard = lazy(() => import('../features/dashboard/Dashboard'));
const ResumeUpload = lazy(() => import('../features/resume/ResumeUpload'));
const CareerPath = lazy(() => import('../features/career/CareerPath'));
const SkillGap = lazy(() => import('../features/career/SkillGap'));
const ChatUI = lazy(() => import('../features/chatbot/ChatUI'));
const InsightsDashboard = lazy(() => import('../features/insights/InsightsDashboard'));
const LearningReportPage = lazy(() => import('../features/learning/LearningReportPage'));
const LearningPathPage = lazy(() => import('../features/learning/LearningPathPage'));
const JobListPage = lazy(() => import('../features/jobs/JobListPage'));
const JobDetailPage = lazy(() => import('../features/jobs/JobDetailPage'));
const ATSAnalyzer = lazy(() => import('../features/ats/ATSAnalyzer'));

import LandingPage from '../features/landing/LandingPage';

/**
 * Wraps a protected page with ErrorBoundary + Suspense + ProtectedRoute.
 */
function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <Suspense fallback={<FullScreenLoader />}>
          {children}
        </Suspense>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}

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
      <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
      <Route path="/resume" element={<ProtectedPage><ResumeUpload /></ProtectedPage>} />
      <Route path="/career" element={<ProtectedPage><CareerPath /></ProtectedPage>} />
      <Route path="/skill-gap" element={<ProtectedPage><SkillGap /></ProtectedPage>} />
      <Route path="/chat" element={<ProtectedPage><ChatUI /></ProtectedPage>} />
      <Route path="/ats" element={<ProtectedPage><ATSAnalyzer /></ProtectedPage>} />
      <Route path="/insights" element={<ProtectedPage><InsightsDashboard /></ProtectedPage>} />
      <Route path="/learning/report" element={<ProtectedPage><LearningReportPage /></ProtectedPage>} />
      <Route path="/learning/path" element={<ProtectedPage><LearningPathPage /></ProtectedPage>} />
      <Route path="/jobs" element={<ProtectedPage><JobListPage /></ProtectedPage>} />
      <Route path="/jobs/:id" element={<ProtectedPage><JobDetailPage /></ProtectedPage>} />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
