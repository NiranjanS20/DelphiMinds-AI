import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Award, Clock } from 'lucide-react';
import SkillRadar from './charts/SkillRadar';
import ProgressChart from './charts/ProgressChart';
import { StatCard } from '../dashboard/widgets';

export default function InsightsDashboard() {
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
          value="78/100"
          change="+8"
          changeType="positive"
          color="brand"
          delay={0.1}
        />
        <StatCard
          icon={TrendingUp}
          label="Growth Rate"
          value="+24%"
          change="vs last month"
          changeType="positive"
          color="accent"
          delay={0.2}
        />
        <StatCard
          icon={Award}
          label="Top Skill"
          value="React"
          color="success"
          delay={0.3}
        />
        <StatCard
          icon={Clock}
          label="Learning Hours"
          value="48h"
          change="+12h"
          changeType="positive"
          color="warning"
          delay={0.4}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillRadar />
        <ProgressChart />
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
          {[
            { category: 'Frontend', count: 8, color: '#7c5cfc', percentage: 35 },
            { category: 'Backend', count: 5, color: '#38bdf8', percentage: 22 },
            { category: 'DevOps', count: 4, color: '#4ade80', percentage: 17 },
            { category: 'Data/ML', count: 6, color: '#facc15', percentage: 26 },
          ].map((cat, i) => (
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
            { text: 'Your React skills are in the top 15% of analyzed profiles. Consider sharing knowledge through mentoring or tech talks.', type: 'success' },
            { text: 'System Design is your biggest gap for senior roles. Prioritize this for the next 3 months to unlock 4 new career paths.', type: 'warning' },
            { text: 'You\'ve improved 24% faster than the average user this month. Keep up the momentum!', type: 'info' },
            { text: 'Adding cloud certifications (AWS/GCP) would increase your career match scores by an estimated 15-20%.', type: 'tip' },
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
