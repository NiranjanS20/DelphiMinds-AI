import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../../components/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function ResumeHistory({ resumes = [], onSelectResume }) {
  const [expandedId, setExpandedId] = useState(null);

  const safeResumes = Array.isArray(resumes) ? resumes : [];
  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  if (safeResumes.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No resumes yet"
        description="Upload your first resume to start tracking your career progress."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-text-subtle" />
        <h3 className="text-sm font-medium text-text-main font-display">Resume History</h3>
        <span className="text-xs text-text-subtle">({safeResumes.length})</span>
      </div>

      <div className="space-y-2">
        {safeResumes.slice(0, 5).map((resume, index) => {
          const isExpanded = expandedId === resume.id;
          const skills = Array.isArray(resume.skills) ? resume.skills : [];
          const skillCount = skills.length;
          const date = resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : 'Unknown date';

          return (
            <motion.div
              key={resume.id || index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-surface rounded-lg border border-border overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(resume.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-surface-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-muted flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-main truncate max-w-[150px]">
                      {resume.fileName || 'Resume'}
                    </p>
                    <p className="text-xs text-text-subtle">{date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-subtle">
                    {skillCount} skills
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-text-subtle" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-subtle" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-3 border-t border-border"
                  >
                    <div className="pt-3 space-y-3">
                      {resume.geminiProcessedData?.summary ? (
                        <p className="text-xs text-text-muted">{resume.geminiProcessedData.summary}</p>
                      ) : resume.summary ? (
                        <p className="text-xs text-text-muted">{resume.summary}</p>
                      ) : null}
                      
                      <div className="flex flex-wrap gap-1.5">
                        {skills.slice(0, 10).map((skill, i) => {
                           const skillName = typeof skill === 'string' ? skill : (skill?.name || 'Unknown');
                           return (
                             <Badge key={`${skillName}-${i}`} variant="default" size="sm">
                               {skillName}
                             </Badge>
                           );
                        })}
                        {skillCount > 10 && (
                          <Badge variant="outline" size="sm">
                            +{skillCount - 10} more
                          </Badge>
                        )}
                      </div>

                      {onSelectResume && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onSelectResume(resume)}
                          className="w-full"
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
