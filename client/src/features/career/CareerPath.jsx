import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, Briefcase, Star, Clock, DollarSign } from 'lucide-react';
import careerService from './careerService';
import { SectionLoader } from '../../components/Loader';
import Button from '../../components/Button';

const DEMO_CAREERS = [
  {
    id: 1,
    title: 'Senior Full-Stack Engineer',
    match: 92,
    company: 'Various Tech Companies',
    salary: '$130K - $180K',
    growth: 'High',
    description: 'Build and maintain scalable web applications across the entire stack. Lead technical decisions and mentor juniors.',
    requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'System Design'],
    matchedSkills: ['React', 'Node.js', 'PostgreSQL'],
    timeToReady: '3-6 months',
  },
  {
    id: 2,
    title: 'ML Engineer',
    match: 78,
    company: 'AI/ML Companies',
    salary: '$145K - $200K',
    growth: 'Very High',
    description: 'Design and deploy machine learning models at scale. Work with data pipelines and model optimization.',
    requiredSkills: ['Python', 'TensorFlow', 'SQL', 'Docker', 'Statistics'],
    matchedSkills: ['Python', 'SQL', 'Docker'],
    timeToReady: '6-12 months',
  },
  {
    id: 3,
    title: 'Technical Lead',
    match: 85,
    company: 'Mid to Large Companies',
    salary: '$150K - $210K',
    growth: 'High',
    description: 'Lead engineering teams, define architecture, and drive technical strategy while staying hands-on.',
    requiredSkills: ['React', 'System Design', 'Leadership', 'Cloud Architecture', 'CI/CD'],
    matchedSkills: ['React', 'System Design'],
    timeToReady: '6-9 months',
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    match: 65,
    company: 'Cloud-First Companies',
    salary: '$120K - $170K',
    growth: 'High',
    description: 'Manage cloud infrastructure, CI/CD pipelines, and ensure system reliability and scalability.',
    requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Linux'],
    matchedSkills: ['Docker', 'AWS'],
    timeToReady: '9-12 months',
  },
];

export default function CareerPath() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState(null);

  useEffect(() => {
    async function fetchCareers() {
      try {
        const data = await careerService.getRecommendations();
        setCareers(data.recommendations || data);
      } catch {
        setCareers(DEMO_CAREERS);
      } finally {
        setLoading(false);
      }
    }
    fetchCareers();
  }, []);

  if (loading) return <SectionLoader text="Analyzing career paths..." />;

  const getMatchColor = (match) => {
    if (match >= 85) return { bg: 'bg-success-500/15', text: 'text-success-400', bar: 'from-success-400 to-success-500' };
    if (match >= 70) return { bg: 'bg-brand-500/15', text: 'text-brand-400', bar: 'from-brand-400 to-brand-500' };
    if (match >= 50) return { bg: 'bg-warning-500/15', text: 'text-warning-400', bar: 'from-warning-400 to-warning-500' };
    return { bg: 'bg-error-500/15', text: 'text-error-400', bar: 'from-error-400 to-error-500' };
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Career Path Recommendations</h1>
        <p className="text-slate-400 mt-1">AI-powered career matches based on your skills and experience</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {careers.map((career, index) => {
          const matchColor = getMatchColor(career.match);
          const isSelected = selectedCareer?.id === career.id;

          return (
            <motion.div
              key={career.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedCareer(isSelected ? null : career)}
              className={`glass-card p-6 cursor-pointer transition-all duration-300 ${
                isSelected ? 'ring-2 ring-brand-500/50' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{career.title}</h3>
                    <p className="text-xs text-slate-500">{career.company}</p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg ${matchColor.bg} ${matchColor.text} text-sm font-bold`}>
                  {career.match}% match
                </div>
              </div>

              {/* Match bar */}
              <div className="h-2 rounded-full bg-surface-200 overflow-hidden mb-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${career.match}%` }}
                  transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                  className={`h-full rounded-full bg-gradient-to-r ${matchColor.bar}`}
                />
              </div>

              <p className="text-sm text-slate-400 mb-4 leading-relaxed">{career.description}</p>

              {/* Info chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-100 text-xs text-slate-400">
                  <DollarSign className="w-3 h-3" /> {career.salary}
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-100 text-xs text-slate-400">
                  <TrendingUp className="w-3 h-3" /> {career.growth} growth
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-100 text-xs text-slate-400">
                  <Clock className="w-3 h-3" /> {career.timeToReady}
                </span>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5">
                {career.requiredSkills.map((skill) => {
                  const matched = career.matchedSkills.includes(skill);
                  return (
                    <span
                      key={skill}
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        matched
                          ? 'bg-success-500/15 text-success-400 border border-success-500/20'
                          : 'bg-surface-200 text-slate-500 border border-glass-border'
                      }`}
                    >
                      {matched && <Star className="w-2.5 h-2.5 inline mr-1" />}
                      {skill}
                    </span>
                  );
                })}
              </div>

              {/* Expand */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-glass-border"
                >
                  <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
                    View Full Career Map
                  </Button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
