import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, AlertTriangle, CheckCircle2, BookOpen, ArrowUpRight } from 'lucide-react';
import careerService from './careerService';
import { SectionLoader } from '../../components/Loader';
import { getSkillColor } from '../../utils/helpers';
import Button from '../../components/Button';

const DEMO_SKILL_GAP = {
  targetRole: 'Senior Full-Stack Engineer',
  overallReadiness: 72,
  strengths: [
    { name: 'React', current: 90, required: 85, status: 'exceeded' },
    { name: 'JavaScript', current: 92, required: 85, status: 'exceeded' },
    { name: 'Node.js', current: 82, required: 80, status: 'met' },
    { name: 'Git', current: 88, required: 80, status: 'exceeded' },
  ],
  gaps: [
    { name: 'System Design', current: 45, required: 80, gap: 35, priority: 'high', resources: ['Grokking System Design', 'System Design Primer'] },
    { name: 'Cloud Architecture (AWS)', current: 40, required: 75, gap: 35, priority: 'high', resources: ['AWS Solutions Architect Cert', 'Cloud Guru courses'] },
    { name: 'DevOps / CI/CD', current: 50, required: 70, gap: 20, priority: 'medium', resources: ['Docker Deep Dive', 'GitHub Actions mastery'] },
    { name: 'GraphQL', current: 30, required: 60, gap: 30, priority: 'medium', resources: ['GraphQL official docs', 'Apollo tutorials'] },
    { name: 'Testing (E2E)', current: 55, required: 70, gap: 15, priority: 'low', resources: ['Cypress.io docs', 'Testing JavaScript by Kent C. Dodds'] },
  ],
};

export default function SkillGap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const result = await careerService.getSkillGap();
        setData(result);
      } catch {
        setData(DEMO_SKILL_GAP);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) return <SectionLoader text="Analyzing your skill gaps..." />;
  if (!data) return null;

  const priorityColors = {
    high: { bg: 'bg-error-500/15', text: 'text-error-400', border: 'border-error-500/20' },
    medium: { bg: 'bg-warning-500/15', text: 'text-warning-400', border: 'border-warning-500/20' },
    low: { bg: 'bg-accent-500/15', text: 'text-accent-400', border: 'border-accent-500/20' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Skill Gap Analysis</h1>
        <p className="text-slate-400 mt-1">
          Identify what you need to learn for <span className="text-brand-400 font-medium">{data.targetRole}</span>
        </p>
      </motion.div>

      {/* Overall readiness */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Overall Readiness</h2>
          <span className="text-3xl font-bold gradient-text">{data.overallReadiness}%</span>
        </div>
        <div className="h-3 rounded-full bg-surface-200 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.overallReadiness}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-brand-500 via-accent-500 to-success-500"
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {data.overallReadiness >= 80 ? "You're almost ready! Focus on a few more skills." :
           data.overallReadiness >= 60 ? "Good progress! Bridge the gaps below to level up." :
           "You have a solid foundation. Let's build on it."}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-success-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Your Strengths</h3>
              <p className="text-xs text-slate-500">Skills that meet or exceed requirements</p>
            </div>
          </div>

          <div className="space-y-4">
            {data.strengths.map((skill, i) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-white">{skill.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-success-400 font-medium">{skill.current}%</span>
                    <span className="text-xs text-slate-600">/ {skill.required}%</span>
                  </div>
                </div>
                <div className="relative h-2 rounded-full bg-surface-200 overflow-hidden">
                  {/* Required marker */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-slate-500 z-10"
                    style={{ left: `${skill.required}%` }}
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.current}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                    className="h-full rounded-full bg-gradient-to-r from-success-400 to-success-500"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Gaps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-warning-500/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Skill Gaps</h3>
              <p className="text-xs text-slate-500">Skills that need improvement</p>
            </div>
          </div>

          <div className="space-y-4">
            {data.gaps.map((skill, i) => {
              const pColor = priorityColors[skill.priority];
              return (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="p-3 rounded-xl bg-surface-100/50 border border-glass-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{skill.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${pColor.bg} ${pColor.text} border ${pColor.border}`}>
                      {skill.priority} priority
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 h-2 rounded-full bg-surface-200 overflow-hidden">
                      <div className="relative h-full">
                        <div
                          className="absolute top-0 h-full w-0.5 bg-slate-400 z-10"
                          style={{ left: `${skill.required}%` }}
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.current}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + i * 0.08 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: getSkillColor(skill.current) }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {skill.current}% → {skill.required}%
                    </span>
                  </div>

                  {/* Resources */}
                  {skill.resources && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {skill.resources.map((res) => (
                        <span key={res} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface-200 text-xs text-slate-400 hover:text-brand-400 cursor-pointer transition-colors">
                          <BookOpen className="w-2.5 h-2.5" />
                          {res}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Action CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6 text-center"
      >
        <Target className="w-10 h-10 text-brand-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">Ready to close the gap?</h3>
        <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
          Chat with your AI mentor for a personalized learning plan tailored to your skill gaps.
        </p>
        <Button icon={ArrowUpRight} iconPosition="right" onClick={() => window.location.href = '/chat'}>
          Talk to AI Mentor
        </Button>
      </motion.div>
    </div>
  );
}
