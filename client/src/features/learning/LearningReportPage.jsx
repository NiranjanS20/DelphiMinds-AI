import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import ENDPOINTS from '../../services/endpoints';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/ui/EmptyState';
import { SectionLoader } from '../../components/Loader';

export default function LearningReportPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post(ENDPOINTS.LEARNING_REPORT);
      const data = res.data;
      if (data.success && data.data) {
        setReportData(data.data);
      } else {
        setError(data.message || 'Failed to generate report');
      }
    } catch (err) {
      console.error('Failed to fetch report', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to generate diagnostic report. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return <SectionLoader text="Generating your diagnostic report..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-text-main font-display flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ai-accent-muted flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-ai-accent" />
          </div>
          Diagnostic Report
        </h1>
        <p className="text-text-muted mt-1 ml-[52px]">AI-powered analysis of your career readiness</p>
      </motion.div>

      {/* Error State */}
      {error && (
        <Card className="border-error/20">
          <CardContent className="py-6">
            <EmptyState
              icon={AlertTriangle}
              title="Report generation failed"
              description={error}
              action={fetchReport}
              actionLabel="Try Again"
            />
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!error && !reportData && !loading && (
        <Card>
          <CardContent className="py-6">
            <EmptyState
              icon={BarChart3}
              title="No report available"
              description="Upload a resume first, then generate a diagnostic report to see your strengths, weaknesses, and market gaps."
              action={() => navigate('/resume')}
              actionLabel="Upload Resume"
            />
          </CardContent>
        </Card>
      )}

      {/* Report Results */}
      {reportData && (
        <div className="space-y-6">
          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary-muted to-ai-accent-muted p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="ai" icon={Sparkles}>AI Assessment</Badge>
                  </div>
                  <h2 className="text-xl font-semibold text-text-main font-display">Resume Score</h2>
                  <p className="text-sm text-text-muted mt-1">
                    Level: <span className="font-semibold text-text-main">{reportData.score?.level?.toUpperCase() || 'N/A'}</span>
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary font-mono">
                    {reportData.score?.score || 0}
                  </div>
                  <p className="text-sm text-text-subtle mt-1">out of 100</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-success-muted flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <CardTitle>Strengths</CardTitle>
                      <CardDescription>Areas where you excel</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {Array.isArray(reportData.report?.strengths) && reportData.report.strengths.length > 0 ? (
                    <ul className="space-y-2">
                      {reportData.report.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-main">
                          <span className="w-1.5 h-1.5 rounded-full bg-success mt-2 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-text-subtle">No strengths data available.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Weaknesses */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-error-muted flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-error" />
                    </div>
                    <div>
                      <CardTitle>Weaknesses</CardTitle>
                      <CardDescription>Areas to improve</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {Array.isArray(reportData.report?.weaknesses) && reportData.report.weaknesses.length > 0 ? (
                    <ul className="space-y-2">
                      {reportData.report.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-main">
                          <span className="w-1.5 h-1.5 rounded-full bg-error mt-2 shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-text-subtle">No weaknesses identified.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Market Gap */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-warning-muted flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-warning" />
                    </div>
                    <div>
                      <CardTitle>Market Gap</CardTitle>
                      <CardDescription>Industry demand vs your skills</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {Array.isArray(reportData.report?.market_gap) && reportData.report.market_gap.length > 0 ? (
                    <ul className="space-y-2">
                      {reportData.report.market_gap.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-main">
                          <span className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-text-subtle">No market gap data available.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Improvement Areas */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-ai-accent-muted flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-ai-accent" />
                    </div>
                    <div>
                      <CardTitle>Improvement Areas</CardTitle>
                      <CardDescription>Focus areas for growth</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {Array.isArray(reportData.report?.improvement_areas) && reportData.report.improvement_areas.length > 0 ? (
                    <ul className="space-y-2">
                      {reportData.report.improvement_areas.map((imp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-main">
                          <span className="w-1.5 h-1.5 rounded-full bg-ai-accent mt-2 shrink-0" />
                          {imp}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-text-subtle">No improvement data available.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button
              onClick={() => navigate('/learning/path')}
              variant="ai"
              icon={ArrowRight}
              iconPosition="right"
            >
              Generate Personalized Learning Path
            </Button>
            <Button
              onClick={fetchReport}
              variant="secondary"
              icon={RefreshCw}
            >
              Regenerate Report
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
