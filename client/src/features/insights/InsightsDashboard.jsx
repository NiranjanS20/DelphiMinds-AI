import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Award, Clock } from 'lucide-react';
import SkillRadar from './charts/SkillRadar';
import ProgressChart from './charts/ProgressChart';
import { StatCard } from '../dashboard/widgets';
import dashboardService from '../dashboard/dashboardService';
import { SectionLoader } from '../../components/Loader';

const toRadarData = (skills = []) =>
  skills.slice(0, 8).map((skill) => ({
    skill: skill.name,
    level: Number(skill.proficiency || 0),
    fullMark: 100,
  }));

const toProgressData = (skills = [], completion = 0) => {
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const totalSkills = skills.length;

  return monthLabels.map((month, index) => {
    const ratio = (index + 1) / monthLabels.length;

    return {
      month,
      skills: Math.max(0, Math.round(totalSkills * ratio)),
      progress: Math.max(0, Math.round(Number(completion || 0) * ratio)),
    };
  });
};

const getCategory = (skill = {}) => {
  const value = String(skill.category || '').toLowerCase();
  if (value.includes('front')) return 'Frontend';
  if (value.includes('back')) return 'Backend';
  if (value.includes('devops') || value.includes('cloud')) return 'DevOps';
  if (value.includes('ml') || value.includes('data')) return 'Data/ML';
  return 'Other';
};

const CATEGORY_COLORS = {
  Frontend: '#7c5cfc',
  Backend: '#38bdf8',
  DevOps: '#4ade80',
  'Data/ML': '#facc15',
  Other: '#94a3b8',
};

export default function InsightsDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await dashboardService.getUserProfile();
        setProfile(data || null);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const skills = useMemo(() => (Array.isArray(profile?.skills) ? profile.skills : []), [profile]);
  const hasResumeData = Boolean(profile?.hasResume) && skills.length > 0;

  const topSkill = useMemo(() => {
    if (skills.length === 0) return 'N/A';

    return [...skills].sort((a, b) => Number(b.proficiency || 0) - Number(a.proficiency || 0))[0]?.name || 'N/A';
  }, [skills]);

  const skillScore = useMemo(() => {
    if (skills.length === 0) return 0;
    const sum = skills.reduce((acc, skill) => acc + Number(skill.proficiency || 0), 0);
    return Math.round(sum / skills.length);
  }, [skills]);

  const radarData = useMemo(() => toRadarData(skills), [skills]);
  const progressData = useMemo(
    () => toProgressData(skills, Number(profile?.completion || 0)),
    [skills, profile?.completion]
  );

  const categoryData = useMemo(() => {
    const buckets = skills.reduce((acc, skill) => {
      const category = getCategory(skill);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const total = Math.max(1, skills.length);

    return Object.entries(buckets).map(([category, count]) => ({
      category,
      count,
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
      percentage: Math.round((count / total) * 100),
    }));
  }, [skills]);

  if (loading) return <SectionLoader text="Loading insights..." />;

  if (!hasResumeData) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Career Insights</h1>
          <p className="text-slate-400 mt-1">Analytics and trends from your career intelligence data</p>
        </motion.div>

        <div className="glass-card p-8 text-center">
          <h2 className="text-lg font-semibold text-white">No resume-driven insights yet</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
            Upload and analyze your resume first. Insights will be generated from your extracted skills and progress automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Career Insights</h1>
        <p className="text-slate-400 mt-1">Analytics and trends from your career intelligence data</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart3}
          label="Skill Score"
          value={`${skillScore}/100`}
          change={`${skills.length} skills`}
          changeType="positive"
          color="primary"
          delay={0.1}
        />
        <StatCard
          icon={TrendingUp}
          label="Growth Rate"
          value={`${Math.max(0, Math.round(Number(profile?.completion || 0)))}%`}
          change="completion"
          changeType="positive"
          color="accent"
          delay={0.2}
        />
        <StatCard
          icon={Award}
          label="Top Skill"
          value={topSkill}
          color="success"
          delay={0.3}
        />
        <StatCard
          icon={Clock}
          label="Learning Hours"
          value={`${Number(profile?.progress?.hoursLearned || 0)}h`}
          change={`${Number(profile?.progress?.coursesCompleted || 0)} courses`}
          changeType="positive"
          color="warning"
          delay={0.4}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillRadar data={radarData} />
        <ProgressChart data={progressData} />
      </div>

      {/* Skill distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="text-base font-semibold text-white mb-4">Skill Distribution by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoryData.map((cat, i) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="text-center p-4 rounded-xl bg-surface-100 border border-glass-border"
            >
              <div
                className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                <span className="text-xl font-bold" style={{ color: cat.color }}>
                  {cat.count}
                </span>
              </div>
              <p className="text-sm font-medium text-white">{cat.category}</p>
              <div className="h-1.5 rounded-full bg-surface-200 overflow-hidden mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.percentage}%` }}
                  transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">{cat.percentage}%</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          AI-Generated Insights
        </h3>
        <div className="space-y-3">
          {[
            {
              text: `${topSkill} is currently your strongest skill. Position it prominently in resume bullet points for better recruiter scanning.`,
              type: 'success',
            },
            {
              text: `You currently have ${skills.length} verified skills. Expanding breadth in one weaker category can increase your role coverage.`,
              type: 'warning',
            },
            {
              text: `Learning completion stands at ${Math.max(0, Math.round(Number(profile?.completion || 0)))}%. Keep a weekly routine to sustain progression.`,
              type: 'info',
            },
            {
              text: `Your average skill score is ${skillScore}/100. Add measurable outcomes to projects to improve ATS relevance and ranking.`,
              type: 'tip',
            },
          ].map((insight, i) => {
            const styles = {
              success: 'bg-success-500/10 border-success-500/20 text-success-300',
              warning: 'bg-warning-500/10 border-warning-500/20 text-warning-300',
              info: 'bg-brand-500/10 border-brand-500/20 text-brand-300',
              tip: 'bg-accent-500/10 border-accent-500/20 text-accent-300',
            };
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className={`p-4 rounded-xl border text-sm leading-relaxed ${styles[insight.type]}`}
              >
                {insight.text}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
