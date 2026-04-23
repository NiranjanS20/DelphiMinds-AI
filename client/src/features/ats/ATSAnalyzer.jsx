import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileSearch, Sparkles, AlertCircle } from 'lucide-react';
import Button from '../../components/Button';
import { SectionLoader } from '../../components/Loader';
import atsService from './atsService';
import ATSScoreCard from './ATSScoreCard';
import MatchBreakdown from './MatchBreakdown';
import KeywordGapList from './KeywordGapList';

const SAMPLE_JD = `We are looking for a Full Stack Engineer with strong React and Node.js experience.
You should be comfortable with REST APIs, SQL, Docker, and cloud deployments.
Experience with system design, CI/CD pipelines, and performance optimization is preferred.`;

export default function ATSAnalyzer() {
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description to run ATS analysis.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await atsService.analyze(jobDescription.trim());
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(
        err?.response?.data?.message ||
          'ATS analysis failed. Make sure your resume is uploaded and analyzed first.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">ATS Analyzer</h1>
        <p className="text-slate-400 mt-1">
          Compare your latest analyzed resume against a target job description
        </p>
      </motion.div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-brand-400" />
            Job Description Input
          </h2>
          <Button variant="secondary" size="sm" onClick={() => setJobDescription(SAMPLE_JD)}>
            Use Sample JD
          </Button>
        </div>

        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={10}
          className="w-full rounded-xl bg-surface-100 border border-glass-border px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />

        <div className="flex items-center gap-3">
          <Button
            onClick={handleAnalyze}
            loading={loading}
            icon={Sparkles}
            className="w-full sm:w-auto"
          >
            {loading ? 'Analyzing...' : 'Analyze ATS Match'}
          </Button>
          <p className="text-xs text-slate-500 hidden sm:block">
            Uses your latest parsed resume automatically.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error-500/10 border border-error-500/20 flex items-center gap-2 text-error-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {result?.meta?.fallback && (
          <div className="p-3 rounded-xl bg-warning-500/10 border border-warning-500/20 text-warning-300 text-sm">
            ATS response is using fallback mode because the ML service is unavailable.
          </div>
        )}
      </div>

      {loading ? (
        <SectionLoader text="Running ATS analysis..." />
      ) : result ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ATSScoreCard
            score={result.atsScore}
            matchScore={result.matchScore}
            suggestions={result.suggestions}
          />
          <MatchBreakdown breakdown={result.breakdown} />
          <div className="lg:col-span-2">
            <KeywordGapList
              matchedKeywords={result.matchedKeywords}
              keywordGap={result.keywordGap}
            />
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 text-center">
          <p className="text-slate-400 text-sm">
            Paste a job description and click Analyze ATS Match to see your score and keyword gaps.
          </p>
        </div>
      )}
    </div>
  );
}
