import { motion } from 'framer-motion';
import { TrendingUp, Award, BookOpen, Zap } from 'lucide-react';
import { getSkillColor } from '../../../utils/helpers';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';

/**
 * Skills overview widget showing extracted skills with proficiency bars.
 */
export default function SkillsWidget({ skills = [] }) {
  const displaySkills = skills.length > 0 ? skills : [];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center glow-primary shrink-0">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <CardTitle>Skills Overview</CardTitle>
          <p className="text-xs text-gray-500 font-mono mt-1">{displaySkills.length} skills detected</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {displaySkills.length === 0 && (
          <p className="text-sm text-gray-400">No resume-derived skills found yet.</p>
        )}
        {displaySkills.map((skill, index) => (
          <motion.div
            key={skill.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-300">{skill.name}</span>
              <span className="text-xs font-mono text-gray-500">{skill.proficiency}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${skill.proficiency}%` }}
                transition={{ duration: 1, delay: 0.2 + index * 0.08, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-ai-accent"
              />
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Stats card — shows a single metric.
 */
export function StatCard({ icon: Icon, label, value, change, changeType = 'positive', color = 'primary', delay = 0 }) {
  const colorMap = {
    primary: { bg: 'bg-primary/15', text: 'text-primary' },
    accent: { bg: 'bg-ai-accent/15', text: 'text-ai-accent' },
    success: { bg: 'bg-accent/15', text: 'text-accent' },
    warning: { bg: 'bg-warning-500/15', text: 'text-warning-400' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-surface rounded-xl border border-white/5 p-5 shadow-sm hover:border-white/10 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${colorMap[color]?.bg || colorMap.primary.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colorMap[color]?.text || colorMap.primary.text}`} />
        </div>
        {change && (
          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
            changeType === 'positive'
              ? 'bg-accent/15 text-accent'
              : 'bg-error/15 text-error'
          }`}>
            {changeType === 'positive' ? '+' : ''}{change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </motion.div>
  );
}

/**
 * Progress widget showing learning progress.
 */
export function ProgressWidget({ progress = null }) {
  const data = progress || {
    coursesCompleted: 0,
    totalCourses: 0,
    streak: 0,
    hoursLearned: 0,
  };

  const percentage = data.totalCourses > 0
    ? Math.round((data.coursesCompleted / data.totalCourses) * 100)
    : 0;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-accent" />
        </div>
        <div>
          <CardTitle>Learning Progress</CardTitle>
          <p className="text-xs text-gray-500 font-mono mt-1">{data.streak} day streak 🔥</p>
        </div>
      </CardHeader>

      <CardContent>
        {/* Circular progress */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="8" />
              <motion.circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - percentage / 100) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor="var(--color-ai-accent)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white font-mono">{percentage}%</span>
              <span className="text-xs text-gray-500">Complete</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="text-lg font-bold text-white font-mono">{data.coursesCompleted}</div>
            <div className="text-xs text-gray-500 mt-1">Completed</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="text-lg font-bold text-white font-mono">{data.hoursLearned}h</div>
            <div className="text-xs text-gray-500 mt-1">Learned</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Quick actions widget.
 */
export function QuickActions() {
  const actions = [
    { icon: Award, label: 'Upload Resume', path: '/resume', color: 'primary' },
    { icon: TrendingUp, label: 'View Career Paths', path: '/career', color: 'accent' },
    { icon: BookOpen, label: 'Skill Gap Analysis', path: '/skill-gap', color: 'success' },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, i) => {
          const colorMap = {
            primary: 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20',
            accent: 'bg-ai-accent/10 text-ai-accent hover:bg-ai-accent/20 border border-ai-accent/20',
            success: 'bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20',
          };

          return (
            <motion.a
              key={action.label}
              href={action.path}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${colorMap[action.color]}`}
            >
              <action.icon className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm text-gray-300">{action.label}</span>
            </motion.a>
          );
        })}
      </CardContent>
    </Card>
  );
}
