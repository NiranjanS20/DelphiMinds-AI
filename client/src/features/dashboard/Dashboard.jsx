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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await dashboardService.getUserProfile();
        setProfile(data);
      } catch {
        // Use demo data on failure (backend not yet connected)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[140px]">
        
        {/* Stats */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4 h-full">
          <StatCard
            icon={FileText}
            label="Resumes Analyzed"
            value={profile?.resumeCount || 3}
            change="2 this week"
            changeType="positive"
            color="primary"
            delay={0.1}
          />
          <StatCard
            icon={Target}
            label="Skills Detected"
            value={profile?.skillCount || 24}
            change="+5"
            changeType="positive"
            color="accent"
            delay={0.2}
          />
          <StatCard
            icon={TrendingUp}
            label="Career Matches"
            value={profile?.careerMatches || 8}
            color="success"
            delay={0.3}
          />
          <StatCard
            icon={LayoutDashboard}
            label="Completion"
            value={`${profile?.completion || 72}%`}
            change="+12%"
            changeType="positive"
            color="warning"
            delay={0.4}
          />
        </div>

        {/* Main Content Areas */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 h-full">
          <SkillsWidget skills={profile?.skills} />
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-1 row-span-2 h-full">
          <ProgressWidget progress={profile?.progress} />
        </div>

        <div className="col-span-1 md:col-span-1 lg:col-span-1 row-span-2 h-full">
          <QuickActions />
        </div>

        {/* Recent Activity */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-4 row-span-auto">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { action: 'Resume analyzed', detail: 'Frontend Developer Resume.pdf', time: '2 hours ago', color: 'primary' },
              { action: 'Skill gap identified', detail: 'System Design, Cloud Architecture', time: '1 day ago', color: 'warning' },
              { action: 'Career path matched', detail: 'Senior Full-Stack Engineer', time: '2 days ago', color: 'success' },
              { action: 'AI mentor session', detail: 'Interview preparation tips', time: '3 days ago', color: 'accent' },
            ].map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0"
              >
                <div className={`w-2 h-2 rounded-full shrink-0`}
                  style={{
                    backgroundColor: activity.color === 'primary' ? 'var(--color-primary)' :
                      activity.color === 'accent' ? 'var(--color-ai-accent)' :
                      activity.color === 'success' ? 'var(--color-accent)' : '#facc15'
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500 truncate font-mono">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-600 whitespace-nowrap">{activity.time}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
