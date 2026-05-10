import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Target,
  MessageSquare,
  BarChart3,
  Briefcase,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Sparkles,
  Search,
  Moon,
  Sun,
  Monitor,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { getInitials } from '../utils/helpers';
import { APP_NAME } from '../utils/constants';

const iconMap = {
  LayoutDashboard,
  FileText,
  Briefcase,
  Search,
  TrendingUp,
  Target,
  MessageSquare,
  BarChart3,
  BookOpen,
  GraduationCap,
};

/**
 * Navigation items grouped by section for editorial clarity.
 * Section dividers create visual hierarchy in the sidebar.
 */
const navSections = [
  {
    label: 'Core',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
      { label: 'Resume', path: '/resume', icon: 'FileText' },
      { label: 'ATS Analyze', path: '/ats', icon: 'Search' },
      { label: 'Jobs', path: '/jobs', icon: 'Briefcase' },
    ],
  },
  {
    label: 'AI Intelligence',
    items: [
      { label: 'Career Path', path: '/career', icon: 'TrendingUp' },
      { label: 'Skill Gap', path: '/skill-gap', icon: 'Target' },
      { label: 'AI Mentor', path: '/chat', icon: 'MessageSquare' },
    ],
  },
  {
    label: 'Growth',
    items: [
      { label: 'Diagnostic', path: '/learning/report', icon: 'BookOpen' },
      { label: 'Learning Path', path: '/learning/path', icon: 'GraduationCap' },
      { label: 'Insights', path: '/insights', icon: 'BarChart3' },
    ],
  },
];

const COLLAPSED_KEY = 'delphiminds_sidebar_collapsed';

export default function Navbar() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Persist collapsed state
  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, String(collapsed));
    } catch {
      // noop
    }
  }, [collapsed]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const { theme, setTheme, isDark } = useTheme();

  const ThemeToggle = ({ mobile = false }) => (
    <div className={`px-4 py-2 flex items-center ${mobile || !collapsed ? 'justify-between' : 'justify-center'} border-t border-border`}>
      {(!collapsed || mobile) && <span className="text-sm text-text-subtle font-medium">Theme</span>}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="p-2 rounded-xl text-text-subtle hover:text-text-main hover:bg-surface-50 transition-all border border-transparent hover:border-border cursor-pointer flex items-center justify-center gap-2"
        title="Toggle Theme"
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {theme === 'light' && <Sun className="w-5 h-5 text-warning" />}
        {theme === 'dark' && <Moon className="w-5 h-5 text-ai-accent" />}
        {theme === 'system' && <Monitor className="w-5 h-5 text-text-subtle" />}
      </button>
    </div>
  );

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 mb-2">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-ai-accent shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
          <div className="absolute inset-0 rounded-xl bg-primary/20 blur-lg" />
        </div>
        <AnimatePresence>
          {(!collapsed || mobile) && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-lg font-bold gradient-text font-display whitespace-nowrap overflow-hidden"
            >
              {APP_NAME}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav sections with dividers */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {navSections.map((section, sectionIndex) => (
          <div key={section.label}>
            {/* Section divider + label */}
            {sectionIndex > 0 && (
              <div className="pt-4 pb-2">
                <div className="border-t border-border" />
              </div>
            )}
            <AnimatePresence>
              {(!collapsed || mobile) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 pb-1 text-[10px] font-semibold text-text-subtle uppercase tracking-wider"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>

            {section.items.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => mobile && setMobileOpen(false)}
                  className={`
                    group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive
                      ? 'bg-primary-muted text-primary'
                      : 'text-text-subtle hover:text-text-main hover:bg-surface-50'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-text-subtle group-hover:text-text-muted'}`} />
                  <AnimatePresence>
                    {(!collapsed || mobile) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Theme Toggle */}
      <ThemeToggle mobile={mobile} />

      {/* User section */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-primary to-ai-accent text-white text-xs font-bold shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(user?.displayName || user?.email)
            )}
          </div>
          <AnimatePresence>
            {(!collapsed || mobile) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-medium text-text-main truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-text-subtle truncate">
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 mt-1 rounded-xl text-text-subtle hover:text-error hover:bg-error-muted transition-all duration-200 cursor-pointer"
          aria-label="Sign out"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <AnimatePresence>
            {(!collapsed || mobile) && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40 bg-surface/80 backdrop-blur-xl border-r border-border"
        aria-label="Sidebar navigation"
      >
        <SidebarContent />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-text-subtle hover:text-text-main hover:bg-surface-50 transition-all cursor-pointer"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </motion.aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-surface/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-ai-accent">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold gradient-text font-display">{APP_NAME}</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-text-subtle hover:text-text-main hover:bg-surface-50 transition-all cursor-pointer"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-[260px] z-50 bg-surface border-r border-border"
              aria-label="Mobile navigation"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for content */}
      <div className={`hidden lg:block shrink-0 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`} />
    </>
  );
}
