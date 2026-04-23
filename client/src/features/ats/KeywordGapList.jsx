import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

const importanceStyle = {
  high: 'bg-error-500/15 text-error-400 border-error-500/20',
  medium: 'bg-warning-500/15 text-warning-400 border-warning-500/20',
  low: 'bg-accent-500/15 text-accent-400 border-accent-500/20',
};

export default function KeywordGapList({ matchedKeywords = [], keywordGap = [] }) {
  return (
    <div className="glass-card p-6 space-y-6">
      <div>
        <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success-400" />
          Matched Keywords
        </h3>

        {matchedKeywords.length === 0 ? (
          <p className="text-sm text-slate-500">No matched keywords yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {matchedKeywords.map((keyword) => (
              <span
                key={keyword}
                className="px-2.5 py-1 rounded-lg text-xs bg-success-500/15 border border-success-500/20 text-success-300"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning-400" />
          Missing Keywords
        </h3>

        {keywordGap.length === 0 ? (
          <p className="text-sm text-slate-500">Great coverage. No major keyword gaps detected.</p>
        ) : (
          <div className="space-y-2">
            {keywordGap.map((item, index) => (
              <motion.div
                key={`${item.keyword}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-surface-100 border border-glass-border"
              >
                <span className="text-sm text-slate-200">{item.keyword}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-md border ${
                    importanceStyle[item.importance] || importanceStyle.medium
                  }`}
                >
                  {item.importance}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
