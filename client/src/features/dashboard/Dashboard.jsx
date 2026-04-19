import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Target, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SkillsWidget, { StatCard, ProgressWidget, QuickActions } from './widgets';
import { SectionLoader } from '../../components/Loader';
import dashboardService from './dashboardService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await dashboardService.getUserProfile();
        setProfile(data?.data || data || null);
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load dashboard data right now.');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return <SectionLoader text="Loading your dashboard..." />;

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="bg-surface border border-error/30 rounded-xl p-4 text-error">
          {error}
        </div>
      </div>
    );
  }

  const hasResume = Boolean(profile?.resumeCount > 0 || profile?.latestResume);
  const activityItems = Array.isArray(profile?.recentActivity) ? profile.recentActivity : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            {greeting()}, {user?.displayName?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-gray-400 mt-1">Here&apos;s your career intelligence overview</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ai-accent/10 border border-ai-accent/20">
          <Sparkles className="w-4 h-4 text-ai-accent" />
          <span className="text-sm text-ai-accent font-medium">AI Insights Ready</span>
        </div>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stats */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4 h-full">
          <StatCard
            icon={FileText}
            label="Resumes Analyzed"
            value={profile?.resumeCount || 0}
            color="primary"
            delay={0.1}
          />
          <StatCard
            icon={Target}
            label="Skills Detected"
            value={profile?.skillCount || 0}
            color="accent"
            delay={0.2}
          />
          <StatCard
            icon={TrendingUp}
            label="Career Matches"
            value={profile?.careerMatches || 0}
            color="success"
            delay={0.3}
          />
          <StatCard
            icon={LayoutDashboard}
            label="Completion"
            value={`${profile?.completion || 0}%`}
            color="warning"
            delay={0.4}
          />
        </div>

        {/* Main Content Areas */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 h-full">
          <SkillsWidget skills={profile?.skills} />
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-1 h-full">
          <ProgressWidget progress={profile?.progress} />
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-1 h-full">
          <QuickActions />
        </div>

        {/* Recent Activity */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!hasResume && (
              <div className="text-sm text-gray-400">
                Upload and analyze your resume to unlock personalized dashboard insights.
              </div>
            )}
            {hasResume && activityItems.length === 0 && (
              <div className="text-sm text-gray-400">
                No recent activity found for your account yet.
              </div>
            )}
            {hasResume && activityItems.map((activity, i) => (
              <motion.div
                key={activity.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0"
              >
                <div className="w-2 h-2 rounded-full shrink-0 bg-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{activity.type || 'activity'}</p>
                  <p className="text-xs text-gray-500 truncate font-mono">
                    {activity.metadata?.detail || activity.metadata?.message || 'No detail'}
                  </p>
                </div>
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : ''}
                </span>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
