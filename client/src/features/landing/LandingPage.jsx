import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import HeroSection from './HeroSection';
import FeaturesBento from './FeaturesBento';
import HowItWorks from './HowItWorks';
import ChatPreview from './ChatPreview';
import DashboardPreview from './DashboardPreview';
import CTASection from './CTASection';
import Footer from './Footer';

function LandingHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-ai-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <div className="w-3.5 h-3.5 bg-white rounded-sm" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
            DelphiMinds
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="text-sm font-bold bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors shadow-lg active:scale-95"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user) return null; // Avoid flashing landing page if rendering while redirecting

  return (
    <div className="min-h-screen bg-background bg-mesh overflow-x-hidden font-sans text-gray-200">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesBento />
        <HowItWorks />
        <ChatPreview />
        <DashboardPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
