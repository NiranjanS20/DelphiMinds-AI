import { motion } from 'framer-motion';
import { FileText, Download, Trash2, Calendar } from 'lucide-react';
import { formatDate, getSkillColor } from '../../utils/helpers';
import Button from '../../components/Button';

/**
 * Resume view — displays a previously analyzed resume and its extracted data.
 */
export default function ResumeView({ resume = null }) {
  // Demo data when no resume
  const data = resume || {
    fileName: 'Software_Engineer_Resume.pdf',
    uploadedAt: new Date().toISOString(),
    summary: 'Experienced full-stack developer with 4+ years building scalable web applications using React, Node.js, and cloud technologies.',
    skills: [
      { name: 'React', proficiency: 90, category: 'Frontend' },
      { name: 'TypeScript', proficiency: 85, category: 'Language' },
      { name: 'Node.js', proficiency: 82, category: 'Backend' },
      { name: 'Python', proficiency: 75, category: 'Language' },
      { name: 'PostgreSQL', proficiency: 72, category: 'Database' },
      { name: 'AWS', proficiency: 65, category: 'Cloud' },
      { name: 'Docker', proficiency: 60, category: 'DevOps' },
    ],
    experience: [
      { title: 'Senior Frontend Developer', company: 'TechCorp', duration: '2022 - Present' },
      { title: 'Full Stack Developer', company: 'StartupXYZ', duration: '2020 - 2022' },
    ],
    education: 'B.Tech Computer Science, IIT Delhi',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center">
            <FileText className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{data.fileName}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <Calendar className="w-3 h-3" />
              <span>Uploaded {formatDate(data.uploadedAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Trash2 className="w-4 h-4 text-error-400" />
          </Button>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="p-4 rounded-xl bg-surface-100 border border-glass-border mb-6">
          <p className="text-sm text-slate-300 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Skills */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Detected Skills</h4>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill) => (
            <span
              key={skill.name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
              style={{
                backgroundColor: `${getSkillColor(skill.proficiency)}15`,
                borderColor: `${getSkillColor(skill.proficiency)}30`,
                color: getSkillColor(skill.proficiency),
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getSkillColor(skill.proficiency) }} />
              {skill.name} — {skill.proficiency}%
            </span>
          ))}
        </div>
      </div>

      {/* Experience */}
      {data.experience && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Experience</h4>
          <div className="space-y-3">
            {data.experience.map((exp, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-100">
                <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{exp.title}</p>
                  <p className="text-xs text-slate-500">{exp.company} • {exp.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && (
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-2">Education</h4>
          <p className="text-sm text-slate-400">🎓 {data.education}</p>
        </div>
      )}
    </motion.div>
  );
}
