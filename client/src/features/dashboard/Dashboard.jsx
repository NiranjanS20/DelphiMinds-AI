import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Target,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Upload,
  Brain,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDashboard, useResumeHistory } from '../../hooks/useApiQuery';
import SkillsWidget, { StatCard, ProgressWidget, QuickActions } from './widgets';
import { SkeletonStats, SkeletonCard } from '../../components/Loader';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import ResumeHistory from '../resume/ResumeHistory';

/**
 * AI Insight Card — contextual AI recommendation based on user data.
 * Shows different insights depending on user state.
 */
function AIInsightCard({ profile }) {
  const hasResume = Boolean(profile?.resumeCount > 0 || profile?.latestResume);
  const skills = Array.isArray(profile?.skills) ? profile.skills : [];

  let insight = {
    title: 'Upload your resume to get started',
    description: 'Our AI will analyze your skills, identify gaps, and recommend career paths tailored to your experience.',
    action: '/resume',
    actionLabel: 'Upload Resume',
    icon: Upload,
  };

  if (hasResume && skills.length > 0) {
    const weakSkills = skills.filter((s) => (s.proficiency || 0) < 50);
    if (weakSkills.length > 0) {
      insight = {
        title: `${weakSkills.length} skill${weakSkills.length > 1 ? 's' : ''} need${weakSkills.length === 1 ? 's' : ''} attention`,
        description: `Consider strengthening ${weakSkills.slice(0, 3).map((s) => s.name).join(', ')} to improve your career readiness score.`,
        action: '/skill-gap',
        actionLabel: 'View Skill Gap',
        icon: Target,
      };
    } else {
      insight = {
        title: 'Your skills are looking strong',
        description: 'Explore career paths that match your profile, or chat with your AI mentor for personalized guidance.',
        action: '/career',
        actionLabel: 'Explore Careers',
        icon: TrendingUp,
      };
    }
  } else if (hasResume) {
    insight = {
      title: 'Resume analyzed — explore your insights',
      description: 'Your resume has been processed. Check your skill gaps and explore career paths recommended by AI.',
      action: '/skill-gap',
      actionLabel: 'View Analysis',
      icon: Brain,
    };
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-xl border border-ai-accent/20 bg-gradient-to-r from-ai-accent-muted to-primary-muted p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-ai-accent/15 flex items-center justify-center shrink-0 glow-ai">
            <insight.icon className="w-5 h-5 text-ai-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="ai" size="sm" icon={Sparkles}>AI Insight</Badge>
            </div>
            <h3 className="text-base font-semibold text-text-main font-display">{insight.title}</h3>
            <p className="text-sm text-text-muted mt-1 max-w-lg">{insight.description}</p>
          </div>
        </div>
        <Link
          to={insight.action}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ai-accent text-white text-sm font-semibold hover:bg-ai-accent-hover transition-colors shrink-0 group"
        >
          {insight.actionLabel}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      {/* Decorative gradient blob */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-ai-accent/5 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading, error: profileError } = useDashboard();
  const { data: historyData, isLoading: historyLoading } = useResumeHistory();

  const resumeHistory = Array.isArray(historyData?.resumes) ? historyData.resumes : [];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const hasResume = Boolean(profile?.resumeCount > 0 || profile?.latestResume);
  const skills = Array.isArray(profile?.skills) ? profile.skills : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-main font-display">
            {greeting()}, {user?.displayName?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-text-muted mt-1">Here&apos;s your career intelligence overview</p>
        </div>
      </motion.div>

      {/* AI Insight Card */}
      {!profileLoading && <AIInsightCard profile={profile} />}

      {/* Stats Row */}
      {profileLoading ? (
        <SkeletonStats count={4} />
      ) : profileError ? (
        <Card>
          <CardContent className="py-5">
            <p className="text-error text-sm">
              {profileError?.response?.data?.message || 'Unable to load dashboard data. Please try again.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Resume Score"
            value={profile?.latestResume?.geminiProcessedData?.confidence_score || profile?.latestResume?.parsedData?.score || profile?.completion || 0}
            color="primary"
            delay={0.1}
          />
          <StatCard
            icon={Target}
            label="Skills Detected"
            value={profile?.skillCount || 0}
            color="ai"
            delay={0.2}
          />
          <StatCard
            icon={TrendingUp}
            label="Career Paths"
            value={profile?.careerMatches || 0}
            color="success"
            delay={0.3}
          />
          <StatCard
            icon={Sparkles}
            label="ATS Score"
            value={`${profile?.atsScore || '--'}`}
            color="warning"
            delay={0.4}
          />
        </div>
      )}

      {/* Main Content Grid — 4-6 widgets, generous whitespace */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Skills Widget — 2 cols */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          {profileLoading ? (
            <SkeletonCard />
          ) : (
            <SkillsWidget skills={skills} />
          )}
        </div>

        {/* Progress Widget — 1 col */}
        <div className="col-span-1">
          {profileLoading ? <SkeletonCard /> : <ProgressWidget progress={profile?.progress} />}
        </div>

        {/* Quick Actions — 1 col */}
        <div className="col-span-1">
          <QuickActions />
        </div>

        {/* Recent Activity — 3 cols */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest career intelligence events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {profileLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <div className="w-2 h-2 rounded-full shimmer" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-1/3 rounded shimmer" />
                      <div className="h-2 w-2/3 rounded shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !hasResume ? (
              <EmptyState
                icon={FileText}
                title="No activity yet"
                description="Upload and analyze your resume to start tracking your career intelligence journey."
                action={() => window.location.href = '/resume'}
                actionLabel="Upload Resume"
              />
            ) : (
              (() => {
                const activityItems = Array.isArray(profile?.recentActivity) ? profile.recentActivity : [];
                if (activityItems.length === 0) {
                  return (
                    <p className="text-sm text-text-muted py-4">
                      No recent activity found for your account yet.
                    </p>
                  );
                }
                return activityItems.map((activity, i) => (
                  <motion.div
                    key={activity.id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="flex items-center gap-4 py-3 border-b border-border last:border-0"
                  >
                    <div className="w-2 h-2 rounded-full shrink-0 bg-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-main font-medium">{activity.type || 'Activity'}</p>
                      <p className="text-xs text-text-subtle truncate font-mono">
                        {activity.metadata?.detail || activity.metadata?.message || 'No detail'}
                      </p>
                    </div>
                    <span className="text-xs text-text-subtle whitespace-nowrap">
                      {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : ''}
                    </span>
                  </motion.div>
                ));
              })()
            )}
          </CardContent>
        </Card>

        {/* Resume History — 1 col */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Resume History</CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 rounded-lg shimmer" />
                ))}
              </div>
            ) : (
              <ResumeHistory resumes={resumeHistory} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
