import { BrowserRouter } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import queryClient from '../services/queryClient';
import Navbar from '../components/Navbar';
import ErrorBoundary from '../components/ErrorBoundary';
import AppRoutes from './routes';

/**
 * Layout wrapper — shows sidebar only on authenticated pages.
 * RULE: This component must remain lightweight — provider orchestration only.
 */
function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const isAuthPage = ['/login', '/signup', '/'].includes(location.pathname);
  const showSidebar = user && !isAuthPage && !loading;

  return (
    <div className="flex min-h-screen bg-background bg-mesh">
      {showSidebar && <Navbar />}
      <main
        className={`flex-1 min-h-screen transition-all duration-300 ${
          showSidebar
            ? 'p-4 lg:p-8 pt-16 lg:pt-8'
            : ''
        }`}
      >
        <AppRoutes />
      </main>
    </div>
  );
}

/**
 * Root App component.
 *
 * Provider hierarchy (outermost → innermost):
 * 1. QueryClientProvider — server state management
 * 2. ThemeProvider — theme context (dark/light)
 * 3. ToastProvider — global notifications
 * 4. BrowserRouter — routing
 * 5. AuthProvider — Firebase auth state
 * 6. ErrorBoundary — global error catch
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <AuthProvider>
              <ErrorBoundary>
                <AppLayout />
              </ErrorBoundary>
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
