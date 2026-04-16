import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Target,
  MessageSquare,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../utils/helpers';
import { APP_NAME } from '../utils/constants';

const iconMap = {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Target,
  MessageSquare,
  BarChart3,
};

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Resume', path: '/resume', icon: 'FileText' },
  { label: 'Career Path', path: '/career', icon: 'TrendingUp' },
  { label: 'Skill Gap', path: '/skill-gap', icon: 'Target' },
  { label: 'AI Mentor', path: '/chat', icon: 'MessageSquare' },
  { label: 'Insights', path: '/insights', icon: 'BarChart3' },
];

export default function Navbar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
              className="text-lg font-bold gradient-text whitespace-nowrap overflow-hidden"
            >
              {APP_NAME}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
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
                  ? 'bg-primary/15 text-primary'
                  : 'text-gray-400 hover:text-white hover:bg-surface'
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300'}`} />
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
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-white/5">
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
                <p className="text-sm font-medium text-white truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 mt-1 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
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
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40 bg-background/80 backdrop-blur-xl border-r border-white/5"
      >
        <SidebarContent />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-surface/80 transition-all cursor-pointer"
        >
          <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </motion.aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-ai-accent">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold gradient-text">{APP_NAME}</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface transition-all cursor-pointer"
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
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-[260px] z-50 bg-surface-50 border-r border-glass-border"
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
