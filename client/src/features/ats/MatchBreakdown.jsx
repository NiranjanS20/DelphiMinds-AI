import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

const ROWS = [
  { key: 'keywordMatch', label: 'Keyword Match', color: 'from-brand-400 to-brand-500' },
  { key: 'skillRelevance', label: 'Skill Relevance', color: 'from-accent-400 to-accent-500' },
  { key: 'completeness', label: 'Profile Completeness', color: 'from-success-400 to-success-500' },
];

export default function MatchBreakdown({ breakdown = {} }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-accent-400" />
        Match Breakdown
      </h3>

      <div className="space-y-4">
        {ROWS.map((row, index) => {
          const value = Math.max(0, Math.min(100, Number(breakdown[row.key] || 0)));

          return (
            <div key={row.key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-slate-300">{row.label}</span>
                <span className="text-xs font-mono text-slate-500">{value}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-200 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.9, delay: 0.15 + index * 0.08 }}
                  className={`h-full rounded-full bg-gradient-to-r ${row.color}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
