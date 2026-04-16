import { BrowserRouter } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import AppRoutes from './routes';

/**
 * Layout wrapper — shows sidebar only on authenticated pages.
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
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
