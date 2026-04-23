import { motion } from 'framer-motion';
import { Target, CheckCircle2, AlertTriangle } from 'lucide-react';

const scoreTone = (score) => {
  if (score >= 80) return { text: 'text-success-400', ring: 'from-success-400 to-success-500' };
  if (score >= 60) return { text: 'text-brand-400', ring: 'from-brand-400 to-brand-500' };
  if (score >= 40) return { text: 'text-warning-400', ring: 'from-warning-400 to-warning-500' };
  return { text: 'text-error-400', ring: 'from-error-400 to-error-500' };
};

export default function ATSScoreCard({ score = 0, matchScore = 0, suggestions = [] }) {
  const tone = scoreTone(score);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="glass-card p-6">
      <h3 className="text-base font-semibold text-white mb-6 flex items-center gap-2">
        <Target className="w-5 h-5 text-brand-400" />
        ATS Match Overview
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-40 h-40 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="10" />
            <motion.circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="url(#atsScoreGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="atsScoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-brand-400)" />
                <stop offset="100%" stopColor="var(--color-accent-400)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${tone.text}`}>{score}%</span>
            <span className="text-xs text-slate-500">ATS score</span>
          </div>
        </div>

        <div className="w-full space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-surface-100 border border-glass-border">
            <span className="text-sm text-slate-300">Overall Match</span>
            <span className="text-sm font-semibold text-white">{matchScore}%</span>
          </div>

          <div className="space-y-2">
            {suggestions.slice(0, 3).map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-start gap-2 text-sm text-slate-300">
                {index === 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-success-400 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-warning-400 mt-0.5 shrink-0" />
                )}
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
