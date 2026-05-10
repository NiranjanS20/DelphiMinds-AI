import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import ENDPOINTS from '../../services/endpoints';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import { SectionLoader } from '../../components/Loader';

export default function LearningPathPage() {
  const location = useLocation();
  const initialState = location.state || {};

  const [loading, setLoading] = useState(false);
  const [pathData, setPathData] = useState(null);
  const [error, setError] = useState(null);

  const [role, setRole] = useState(initialState.role || '');
  const [time, setTime] = useState('10 hours/week');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!role.trim()) {
      setError('Please enter a target role.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post(ENDPOINTS.LEARNING_PATH, {
        role: role.trim(),
        timeCommitment: time,
        level: 'intermediate',
      });
      const data = res.data;
      if (data.success && data.data) {
        setPathData(data.data);
      } else {
        setError(data.message || 'Failed to generate learning path');
      }
    } catch (err) {
      console.error('Failed to fetch path', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to generate learning path. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const stageConfig = [
    { key: 'beginner', title: 'Beginner Stage', color: 'primary', icon: BookOpen },
    { key: 'intermediate', title: 'Intermediate Stage', color: 'warning', icon: TrendingUp },
    { key: 'advanced', title: 'Advanced Stage', color: 'ai', icon: GraduationCap },
  ];

  const colorMap = {
    primary: { bg: 'bg-primary-muted', text: 'text-primary', dot: 'bg-primary', border: 'border-l-primary' },
    warning: { bg: 'bg-warning-muted', text: 'text-warning', dot: 'bg-warning', border: 'border-l-warning' },
    ai: { bg: 'bg-ai-accent-muted', text: 'text-ai-accent', dot: 'bg-ai-accent', border: 'border-l-ai-accent' },
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-text-main font-display flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-muted flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          Personalized Learning Roadmap
        </h1>
        <p className="text-text-muted mt-1 ml-[52px]">Tell us your goal and get an AI-crafted learning plan</p>
      </motion.div>

      {/* Input Form */}
      {!pathData && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Configure Your Path</CardTitle>
              <CardDescription>What role are you aiming for and how much time can you invest?</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <Input
                  label="Target Role"
                  placeholder="e.g. Full Stack Engineer, Data Scientist, DevOps Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  error={error && !role.trim() ? 'Target role is required' : undefined}
                />
                <Input
                  label="Time Commitment"
                  placeholder="e.g. 5 hours/week"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />

                {error && role.trim() && (
                  <div className="p-3 rounded-xl bg-error-muted border border-error/20">
                    <p className="text-sm text-error">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  variant="ai"
                  icon={Sparkles}
                  className="w-full"
                >
                  {loading ? 'Generating Roadmap...' : 'Generate Roadmap'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && <SectionLoader text="AI is crafting your personalized roadmap..." />}

      {/* Results */}
      {pathData && (
        <div className="space-y-6">
          {/* Score Improvement */}
          {pathData.estimated_score_improvement && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-success-muted to-primary-muted p-6 text-center">
                  <Badge variant="success" size="sm" icon={TrendingUp}>Estimated Improvement</Badge>
                  <div className="text-4xl font-bold text-success font-mono mt-3">
                    +{pathData.estimated_score_improvement} <span className="text-xl text-text-muted">pts</span>
                  </div>
                  <p className="text-sm text-text-muted mt-1">Projected score increase after completing this path</p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Learning Stages */}
          <div className="space-y-6">
            {stageConfig.map((stage, stageIndex) => {
              const items = pathData[stage.key];
              const colors = colorMap[stage.color];
              const StageIcon = stage.icon;

              if (!items || items.length === 0) return null;

              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + stageIndex * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center`}>
                          <StageIcon className={`w-4 h-4 ${colors.text}`} />
                        </div>
                        <div>
                          <CardTitle>{stage.title}</CardTitle>
                          <CardDescription>{items.length} resource{items.length !== 1 ? 's' : ''}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {items.map((item, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-xl bg-surface-50 border-l-4 ${colors.border} space-y-1.5`}
                        >
                          <h4 className="text-sm font-semibold text-text-main font-display">{item.skill}</h4>
                          <p className="text-xs text-text-muted">
                            <span className="font-medium text-text-main">Resource:</span> {item.resource}
                          </p>
                          <p className="text-xs text-text-muted">
                            <span className="font-medium text-text-main">Duration:</span> {item.duration}
                          </p>
                          {item.reason && (
                            <p className="text-xs text-text-subtle mt-1">{item.reason}</p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4 pt-4"
          >
            <Button
              onClick={() => setPathData(null)}
              variant="secondary"
              icon={RefreshCw}
            >
              Start Over
            </Button>
          </motion.div>
        </div>
      )}

      {/* Empty State when no form and no data */}
      {!pathData && !loading && !error && !role && (
        <Card>
          <CardContent className="py-6">
            <EmptyState
              icon={GraduationCap}
              title="Create your learning roadmap"
              description="Enter your target role above and let AI design a personalized path with curated resources, timelines, and milestones."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
